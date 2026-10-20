import { iqr, standardDeviation } from "./summary.js";
import { requireArray } from "../validate.js";

function check(x) {
  requireArray(x, "x");
  if (x.length < 2) throw new RangeError("At least two values are needed to select a bandwidth.");
}

// Bandwidth selectors for Gaussian kernels, as in R's bw.nrd0 and bw.nrd.
export const bandwidths = Object.freeze({
  // Silverman's rule of thumb. Silverman, B. W. (1986) Density Estimation.
  // London: Chapman and Hall.
  nrd0(x) {
    check(x);
    const hi = standardDeviation(x);
    let lo = Math.min(hi, iqr(x) / 1.34);
    if (!lo) lo = hi || Math.abs(x[0]) || 1;
    return .9 * lo * Math.pow(x.length, -.2);
  },

  // Scott's variation of Silverman's rule. Scott, D. W. (1992) Multivariate
  // Density Estimation: Theory, Practice, and Visualization. Wiley.
  nrd(x) {
    check(x);
    return 1.06 * Math.min(standardDeviation(x), iqr(x) / 1.34) * Math.pow(x.length, -.2);
  }
});
