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

  if (a === 0) {
    // Linear, or no roots (or infinitely many) if b is also 0.
    // Adding 0 turns -0 into 0.
    return real(b === 0 ? [] : [-c / b + 0]);
  }

  // The roots are (-h ± sqrt(h^2 - ac)) / a, where h = b/2. The discriminant
  // h^2 - ac is computed relative to s^2, where s is the larger of |h| and
  // sqrt(|ac|), so that it neither overflows nor underflows, whatever the
  // magnitudes of a, b and c.
  const h = b / 2,
        g = Math.sqrt(Math.abs(a)) * Math.sqrt(Math.abs(c)),
        s = Math.max(Math.abs(h), g),
        hs = h / s,
        gs = g / s,
        acSign = (a < 0) !== (c < 0) ? -1 : 1,
        d = s === 0 ? 0 : hs * hs - acSign * gs * gs,
        rb = -h / a + 0;
  if (d > 0) {
    // Avoid cancellation by computing the larger root first.
    const q = -(h + (h < 0 ? -1 : 1) * s * Math.sqrt(d)),
          r1 = q / a + 0,
          r2 = c / q + 0;
    return real(r1 < r2 ? [r1, r2] : [r2, r1]);
  }
  if (d === 0) return real([rb]);
  if (!complex) return [];
  const im = s * Math.sqrt(-d) / Math.abs(a);
  return [{re: rb, im: -im}, {re: rb, im}];
}
