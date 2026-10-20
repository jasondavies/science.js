// Based on org.apache.commons.math.analysis.interpolation.LoessInterpolator
// from http://commons.apache.org/math/, with the neighbourhood search of R's
// lowess (Cleveland, 1979).
science.stats.loess = function() {
  var bandwidth = .3,
      robustnessIters = 2,
      accuracy = 1e-12;

  function smooth(xval, yval, weights) {
    var n = xval.length,
        i;

    if (n !== yval.length) throw {error: "Mismatched array lengths"};
    if (n == 0) throw {error: "At least one point required."};

    if (!(bandwidth > 0 && bandwidth <= 1)) throw {error: "Bandwidth must be greater than 0 and at most 1."};
    if (!(robustnessIters >= 0 && robustnessIters % 1 === 0)) throw {error: "Robustness iterations must be a non-negative integer."};
    if (!(accuracy >= 0)) throw {error: "Accuracy must be a non-negative number."};

    if (weights == null) {
      weights = [];
      i = -1; while (++i < n) weights[i] = 1;
    } else if (weights.length !== n) throw {error: "Mismatched array lengths"};

    science_stats_loessFiniteReal(xval);
    science_stats_loessFiniteReal(yval);
    science_stats_loessFiniteReal(weights);
    science_stats_loessSorted(xval);

    // Only points with a positive weight take part in the local regressions.
    var points = [];
    i = -1; while (++i < n) {
      if (weights[i] < 0) throw {error: "Weights must be non-negative."};
      if (weights[i] > 0) points.push(i);
    }
    if (!points.length) throw {error: "At least one weight must be positive."};

    if (n == 1) return [yval[0]];
    if (n == 2) return [yval[0], yval[1]];

    var bandwidthInPoints = Math.floor(bandwidth * n);

    if (bandwidthInPoints < 2) throw {error: "Bandwidth too small."};

    var m = points.length,
        q = Math.min(bandwidthInPoints, m),
        res = [],
        residuals = [],
        robustnessWeights = [];

    // Do an initial fit and 'robustnessIters' robustness iterations.
    // This is equivalent to doing 'robustnessIters+1' robustness iterations
    // starting with all robustness weights set to 1.
    i = -1; while (++i < n) {
      res[i] = 0;
      residuals[i] = 0;
      robustnessWeights[i] = 1;
    }

    var iter = -1;
    while (++iter <= robustnessIters) {
      // The window is points[left..right], the q weighted points nearest x.
      var left = 0,
          right = q - 1,
          x;
      i = -1; while (++i < n) {
        x = xval[i];

        // Slide the window right for as long as that brings it closer to x.
        while (right < m - 1 && xval[points[right + 1]] - x < x - xval[points[left]]) {
          left++;
          right++;
        }

        // Widen the window to include points tied at the edge distance h.
        var h = Math.max(x - xval[points[left]], xval[points[right]] - x),
            lo = left,
            hi = right;
        while (lo > 0 && x - xval[points[lo - 1]] <= h) lo--;
        while (hi < m - 1 && xval[points[hi + 1]] - x <= h) hi++;

        var fit = localFit(xval, yval, weights, robustnessWeights, points, lo, hi, x, h, true, true);

        // Robustness weights can leave no weight in the window. A weighted
        // point then keeps its own value, as in R's lowess; a zero-weight
        // point is fitted from its neighbours without the weights that
        // vanished.
        if (fit == null) {
          if (weights[i] > 0) fit = yval[i];
          else {
            fit = localFit(xval, yval, weights, robustnessWeights, points, lo, hi, x, h, false, true);
            if (fit == null) fit = localFit(xval, yval, weights, robustnessWeights, points, lo, hi, x, h, false, false);
          }
        }

        res[i] = fit;
        residuals[i] = Math.abs(yval[i] - fit);
      }

      // No need to recompute the robustness weights at the last
      // iteration, they won't be needed anymore
      if (iter === robustnessIters) {
        break;
      }

      // Recompute the robustness weights.

      // Find the median residual of the weighted points.
      var medianResidual = science.stats.median(points.map(function(p) { return residuals[p]; }));

      if (medianResidual < accuracy || !medianResidual)
        break;

      var arg,
          w;
      i = -1; while (++i < n) {
        arg = residuals[i] / (6 * medianResidual);
        robustnessWeights[i] = (arg >= 1) ? 0 : ((w = 1 - arg * arg) * w);
      }
    }

    return res;
  }

  // Computes a least-squares linear fit at x over points[lo..hi], weighted by
  // the product of the given weights, the robustness weights (if robust) and
  // the tricube weight function (if local). Returns null if the total weight
  // is zero.
  // See http://en.wikipedia.org/wiki/Linear_regression
  // (section "Univariate linear case")
  // and http://en.wikipedia.org/wiki/Weighted_least_squares
  // (section "Weighted least squares")
  function localFit(xval, yval, weights, robustnessWeights, points, lo, hi, x, h, local, robust) {
    var sumWeights = 0,
        sumX = 0,
        sumY = 0,
        k,
        p,
        w;

    // x values are taken relative to x, so that large offsets in x do not
    // lose precision.
    for (k = lo; k <= hi; ++k) {
      p = points[k];
      w = weights[p];
      if (robust) w *= robustnessWeights[p];
      if (local && h > 0) w *= science_stats_loessTricube(Math.abs(xval[p] - x) / h);
      sumWeights += w;
      sumX += w * (xval[p] - x);
      sumY += w * yval[p];
    }

    if (!(sumWeights > 0)) return null;

    var meanX = sumX / sumWeights,
        meanY = sumY / sumWeights,
        sumXX = 0,
        sumXY = 0,
        dx;

    for (k = lo; k <= hi; ++k) {
      p = points[k];
      w = weights[p];
      if (robust) w *= robustnessWeights[p];
      if (local && h > 0) w *= science_stats_loessTricube(Math.abs(xval[p] - x) / h);
      dx = xval[p] - x - meanX;
      sumXX += w * dx * dx;
      sumXY += w * dx * (yval[p] - meanY);
    }

    var beta = (Math.sqrt(sumXX / sumWeights) < accuracy || !sumXX) ? 0 : sumXY / sumXX;

    // The fitted line evaluated at x, which is 0 relative to x.
    return meanY - beta * meanX;
  }

  smooth.bandwidth = function(x) {
    if (!arguments.length) return bandwidth;
    bandwidth = x;
    return smooth;
  };

  smooth.robustnessIterations = function(x) {
    if (!arguments.length) return robustnessIters;
    robustnessIters = x;
    return smooth;
  };

  smooth.accuracy = function(x) {
    if (!arguments.length) return accuracy;
    accuracy = x;
    return smooth;
  };

  return smooth;
};

function science_stats_loessFiniteReal(values) {
  var n = values.length,
      i = -1;

  while (++i < n) if (!Number.isFinite(values[i])) throw {error: "Values must be finite numbers."};
}

function science_stats_loessSorted(xval) {
  var n = xval.length,
      i = 0;

  while (++i < n) if (xval[i - 1] > xval[i]) throw {error: "X values must be sorted in ascending order."};
}

// Compute the tricube weight function.
// http://en.wikipedia.org/wiki/Local_regression#Weight_function
function science_stats_loessTricube(x) {
  return (x = 1 - x * x * x) * x * x;
}
