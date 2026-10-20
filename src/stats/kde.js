import { bandwidths } from "./bandwidths.js";
import { kernels } from "./kernels.js";
import { checkOptions, requireFiniteNumbers, requireFunction } from "../validate.js";

// Kernel density estimation. Returns the estimated density function, with the
// bandwidth used as its bandwidth property.
export function kde(sample, options) {
  const {kernel = kernels.gaussian, bandwidth = bandwidths.nrd0} = checkOptions(options, ["kernel", "bandwidth"], "kde");
  requireFiniteNumbers(sample, "sample");
  if (!sample.length) throw new RangeError("sample must not be empty.");
  requireFunction(kernel, "kernel");

  const values = Array.from(sample),
        n = values.length,
        h = typeof bandwidth === "function" ? bandwidth(values) : bandwidth;
  if (!(h > 0 && h < Infinity)) throw new RangeError("Bandwidth must be a positive finite number.");

  function density(x) {
    let y = 0;
    for (let i = 0; i < n; i++) y += kernel((x - values[i]) / h);
    return y / (h * n);
  }

  density.bandwidth = h;
  return density;
}
