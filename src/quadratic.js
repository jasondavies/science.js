// Returns the roots of a x^2 + b x + c = 0 in ascending order. With
// {complex: true}, returns them as {re, im} objects and includes complex roots,
// in ascending order of their imaginary parts.
export function quadratic(a, b, c, {complex = false} = {}) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
    throw new TypeError("Coefficients must be finite numbers.");
  }
  const real = (roots) => complex ? roots.map((re) => ({re, im: 0})) : roots;

  if (a === 0) {
    // Linear, or no roots (or infinitely many) if b is also 0.
    return real(b === 0 ? [] : [-c / b]);
  }

  const d = b * b - 4 * a * c,
        rb = -b / (2 * a);
  if (d > 0) {
    // Avoid cancellation by computing the larger root first.
    const q = -(b + (b < 0 ? -1 : 1) * Math.sqrt(d)) / 2,
          r1 = q / a,
          r2 = c / q;
    return real(r1 < r2 ? [r1, r2] : [r2, r1]);
  }
  if (d === 0) return real([rb]);
  if (!complex) return [];
  const im = Math.sqrt(-d) / (2 * Math.abs(a));
  return [{re: rb, im: -im}, {re: rb, im}];
}
