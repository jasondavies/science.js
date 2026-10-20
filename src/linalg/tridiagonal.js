import { requireFiniteNumbers } from "../validate.js";

// Solves a tridiagonal system of equations with the Thomas algorithm: row i is
// lower[i - 1] x[i - 1] + diagonal[i] x[i] + upper[i] x[i + 1] = rhs[i].
// No pivoting is done, so the system should be, for example, diagonally
// dominant.
export function solveTridiagonal(lower, diagonal, upper, rhs) {
  requireFiniteNumbers(lower, "lower");
  requireFiniteNumbers(diagonal, "diagonal");
  requireFiniteNumbers(upper, "upper");
  requireFiniteNumbers(rhs, "rhs");
  const n = diagonal.length;
  if (!n) throw new RangeError("diagonal must not be empty.");
  if (rhs.length !== n || lower.length !== n - 1 || upper.length !== n - 1) {
    throw new RangeError("diagonal and rhs must have the same length, and lower and upper one fewer.");
  }

  const c = new Array(n),
        d = new Array(n);
  let b = diagonal[0];
  if (b === 0) throw new RangeError("Zero pivot; the system needs pivoting.");
  c[0] = n > 1 ? upper[0] / b : 0;
  d[0] = rhs[0] / b;
  for (let i = 1; i < n; i++) {
    b = diagonal[i] - lower[i - 1] * c[i - 1];
    if (b === 0) throw new RangeError("Zero pivot; the system needs pivoting.");
    c[i] = i < n - 1 ? upper[i] / b : 0;
    d[i] = (rhs[i] - lower[i - 1] * d[i - 1]) / b;
  }

  const x = new Array(n);
  x[n - 1] = d[n - 1];
  for (let i = n - 2; i >= 0; i--) x[i] = d[i] - c[i] * x[i + 1];
  return x;
}
