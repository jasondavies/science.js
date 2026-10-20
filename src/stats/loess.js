import { mean, median } from "./summary.js";
import { checkOptions, requireFiniteNumbers, requireSameLength } from "../validate.js";

// LOESS smoothing. Based on org.apache.commons.math.analysis.interpolation.
// LoessInterpolator from http://commons.apache.org/math/, with the
// neighbourhood search of R's lowess (Cleveland, 1979).
export function loess(x, y, options) {
  let {bandwidth = .3, robustnessIterations = 2, accuracy = 1e-12, weights} = checkOptions(options, ["bandwidth", "robustnessIterations", "accuracy", "weights"], "loess");
  requireFiniteNumbers(x, "x");
  requireFiniteNumbers(y, "y");
  requireSameLength(x, y);
  const n = x.length;
  if (n === 0) throw new RangeError("At least one point is required.");
  if (!(bandwidth > 0 && bandwidth <= 1)) throw new RangeError("bandwidth must be greater than 0 and at most 1.");
  if (!(Number.isInteger(robustnessIterations) && robustnessIterations >= 0)) throw new RangeError("robustnessIterations must be a non-negative integer.");
  if (!(accuracy >= 0)) throw new RangeError("accuracy must be a non-negative number.");

  if (weights == null) {
    weights = new Array(n).fill(1);
  } else {
    requireFiniteNumbers(weights, "weights");
    requireSameLength(x, weights);
  }

  for (let i = 1; i < n; i++) {
    if (x[i - 1] > x[i]) throw new RangeError("x must be sorted in ascending order.");
  }

  // Only points with a positive weight take part in the local regressions.
  const points = [];
  for (let i = 0; i < n; i++) {
    if (weights[i] < 0) throw new RangeError("weights must be non-negative.");
    if (weights[i] > 0) points.push(i);
  }
  if (!points.length) throw new RangeError("At least one weight must be positive.");

  // With one or two points there is nothing to smooth, but a zero-weight point
  // still takes its value from the other point.
  if (n <= 2) return Array.from(y, (v, i) => weights[i] > 0 ? v : y[points[0]]);

  const bandwidthInPoints = Math.floor(bandwidth * n);
  if (bandwidthInPoints < 2) throw new RangeError("bandwidth is too small for the number of points.");

  const m = points.length,
        q = Math.min(bandwidthInPoints, m),
        res = new Array(n).fill(0),
        residuals = new Array(n).fill(0),
        robustnessWeights = new Array(n).fill(1),
        // accuracy is relative to the range of x and the mean magnitude of y,
        // as in R's lowess, so that the results do not depend on their units.
        xTolerance = accuracy * Math.min(x[n - 1] - x[0], Number.MAX_VALUE),
        yTolerance = accuracy * mean(Array.from(y, Math.abs)),
        // The combined weight of each point in the current window.
        w = new Float64Array(m);

  // Computes a least-squares linear fit at xi over points[lo..hi], weighted by
  // the product of the given weights, the robustness weights (if robust) and
  // the tricube weight function (if local). Returns null if the total weight
  // is zero. x values are taken relative to xi, so that large offsets in x do
  // not lose precision, and the spread is computed about the weighted mean, in
  // a second pass, so that it is accurate wherever the window lies.
  function localFit(lo, hi, xi, h, local, robust) {
    let sumWeights = 0,
        sumX = 0,
        sumY = 0;
    for (let k = lo; k <= hi; k++) {
      const p = points[k];
      let wk = weights[p];
      if (robust) wk *= robustnessWeights[p];
      if (local && h > 0) wk *= tricube(Math.abs(x[p] - xi) / h);
      w[k] = wk;
      sumWeights += wk;
      sumX += wk * (x[p] - xi);
      sumY += wk * y[p];
    }
    if (!(sumWeights > 0)) return null;

    const meanX = sumX / sumWeights,
          meanY = sumY / sumWeights;
    let sumXX = 0,
        sumXY = 0;
    for (let k = lo; k <= hi; k++) {
      const p = points[k],
            dx = x[p] - xi - meanX;
      sumXX += w[k] * dx * dx;
      sumXY += w[k] * dx * (y[p] - meanY);
    }

    const beta = Math.sqrt(sumXX / sumWeights) < xTolerance || !sumXX ? 0 : sumXY / sumXX;

    // The fitted line evaluated at xi, which is 0 relative to xi.
    return meanY - beta * meanX;
  }

  // An initial fit followed by robustnessIterations robustness iterations.
  for (let iteration = 0; iteration <= robustnessIterations; iteration++) {
    // The window is points[left..right], the q weighted points nearest x[i].
    let left = 0,
        right = q - 1;
    for (let i = 0; i < n; i++) {
      const xi = x[i];

      // Slide the window right for as long as that brings it closer to xi.
      while (right < m - 1 && x[points[right + 1]] - xi < xi - x[points[left]]) {
        left++;
        right++;
      }

      // Widen the window to include points tied at the edge distance h.
      const h = Math.max(xi - x[points[left]], x[points[right]] - xi);
      let lo = left,
          hi = right;
      while (lo > 0 && xi - x[points[lo - 1]] <= h) lo--;
      while (hi < m - 1 && x[points[hi + 1]] - xi <= h) hi++;

      let fit = localFit(lo, hi, xi, h, true, true);

      // Robustness weights can leave no weight in the window. A weighted point
      // then keeps its own value, as in R's lowess; a zero-weight point is
      // fitted from its neighbours without the weights that vanished.
      if (fit == null) {
        if (weights[i] > 0) fit = y[i];
        else {
          fit = localFit(lo, hi, xi, h, false, true);
          if (fit == null) fit = localFit(lo, hi, xi, h, false, false);
        }
      }

      res[i] = fit;
      residuals[i] = Math.abs(y[i] - fit);
    }

    // The robustness weights are not needed after the last iteration.
    if (iteration === robustnessIterations) break;

    // Recompute the robustness weights from the median residual of the
    // weighted points.
    const medianResidual = median(points.map((p) => residuals[p]));
    if (medianResidual < yTolerance || !medianResidual) break;

    for (let i = 0; i < n; i++) {
      const arg = residuals[i] / (6 * medianResidual);
      robustnessWeights[i] = arg >= 1 ? 0 : (1 - arg * arg) ** 2;
    }
  }

  return res;
}

// The tricube weight function.
// http://en.wikipedia.org/wiki/Local_regression#Weight_function
function tricube(x) {
  const t = 1 - x * x * x;
  return t * t * t;
}
