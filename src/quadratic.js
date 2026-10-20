import { checkOptions } from "./validate.js";

// Returns the roots of a x^2 + b x + c = 0 in ascending order. With
// {complex: true}, returns them as {re, im} objects and includes complex roots,
// in ascending order of their imaginary parts.
export function quadratic(a, b, c, options) {
  const {complex = false} = checkOptions(options, ["complex"], "quadratic");
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
    throw new TypeError("Coefficients must be finite numbers.");
  }
  const real = (roots) => complex ? roots.map((re) => ({re, im: 0})) : roots;

  // If the coefficients are very large or small, scale them by a power of 2,
  // which is exact and does not change the roots, so that the discriminant
  // neither overflows nor underflows.
  const max = Math.max(Math.abs(a), Math.abs(b), Math.abs(c));
  if (max > 1e150 || (max < 1e-150 && max > 0)) {
    const scale = Math.pow(2, -Math.round(Math.log2(max)));
    a *= scale;
    b *= scale;
    c *= scale;
  }

  if (a === 0) {
    // Linear, or no roots (or infinitely many) if b is also 0.
    // Adding 0 turns -0 into 0.
    return real(b === 0 ? [] : [-c / b + 0]);
  }

  const d = b * b - 4 * a * c,
        rb = -b / (2 * a) + 0;
  if (d > 0) {
    // Avoid cancellation by computing the larger root first.
    const q = -(b + (b < 0 ? -1 : 1) * Math.sqrt(d)) / 2,
          r1 = q / a + 0,
          r2 = c / q + 0;
    return real(r1 < r2 ? [r1, r2] : [r2, r1]);
  }
  if (d === 0) return real([rb]);
  if (!complex) return [];
  const im = Math.sqrt(-d) / (2 * Math.abs(a));
  return [{re: rb, im: -im}, {re: rb, im}];
}
