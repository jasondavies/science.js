import { requireArray, requireFiniteNumbers, requireMatrix, requireSquareMatrix } from "../validate.js";

export function transpose(a) {
  const [rows, columns] = requireMatrix(a, "a");
  return Array.from({length: columns}, (_, j) => Array.from({length: rows}, (_, i) => a[i][j]));
}

// The product of matrix a with matrix b, or with vector b (returning a vector).
export function multiply(a, b) {
  const [rows, inner] = requireMatrix(a, "a");
  requireArray(b, "b");
  if (b.length && typeof b[0] === "number") {
    requireFiniteNumbers(b, "b");
    if (b.length !== inner) throw new RangeError(`Cannot multiply a ${rows}×${inner} matrix by a vector of length ${b.length}.`);
    const ab = new Array(rows);
    for (let i = 0; i < rows; i++) {
      const ai = a[i];
      let s = 0;
      for (let k = 0; k < inner; k++) s += ai[k] * b[k];
      ab[i] = s;
    }
    return ab;
  }
  const [bRows, columns] = requireMatrix(b, "b");
  if (bRows !== inner) throw new RangeError(`Cannot multiply a ${rows}×${inner} matrix by a ${bRows}×${columns} matrix.`);
  // Accumulate whole rows of b, which reads every array in order.
  const ab = new Array(rows);
  for (let i = 0; i < rows; i++) {
    const ai = a[i],
          row = new Array(columns).fill(0);
    for (let k = 0; k < inner; k++) {
      const f = ai[k],
            bk = b[k];
      for (let j = 0; j < columns; j++) row[j] += f * bk[j];
    }
    ab[i] = row;
  }
  return ab;
}

// LU decomposition with partial pivoting of a copy of the square matrix a.
// Returns the combined L and U factors, the row permutation, the sign of the
// permutation, and the largest magnitude in a.
function lu(a) {
  const n = a.length,
        m = a.map((row) => Array.from(row)),
        permutation = Array.from({length: n}, (_, i) => i);
  let sign = 1,
      max = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) max = Math.max(max, Math.abs(m[i][j]));
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(m[i][k]) > Math.abs(m[p][k])) p = i;
    if (p !== k) {
      [m[p], m[k]] = [m[k], m[p]];
      [permutation[p], permutation[k]] = [permutation[k], permutation[p]];
      sign = -sign;
    }
    if (m[k][k] === 0) continue;
    for (let i = k + 1; i < n; i++) {
      const f = m[i][k] /= m[k][k];
      for (let j = k + 1; j < n; j++) m[i][j] -= f * m[k][j];
    }
  }
  return {m, permutation, sign, max};
}

export function determinant(a) {
  const n = requireSquareMatrix(a, "a"),
        {m, sign} = lu(a);
  let d = sign;
  for (let i = 0; i < n; i++) d *= m[i][i];
  return d;
}

// Solves a x = b for x, where b is a vector or a matrix of right-hand sides.
// Throws if a is singular, treating pivots no larger than n × machine epsilon ×
// the largest magnitude in a as zero.
export function solve(a, b) {
  const n = requireSquareMatrix(a, "a");
  requireArray(b, "b");
  const vector = !b.length || typeof b[0] === "number",
        columns = vector ? 1 : requireMatrix(b, "b")[1];
  if (vector) requireFiniteNumbers(b, "b");
  if (b.length !== n) throw new RangeError(`b must have ${n} rows.`);

  const {m, permutation, max} = lu(a),
        tolerance = n * Number.EPSILON * max;
  for (let i = 0; i < n; i++) {
    if (!(Math.abs(m[i][i]) > tolerance)) throw new RangeError("Matrix is singular.");
  }

  // Forward substitution with L, then back substitution with U, a row of
  // right-hand sides at a time.
  const x = new Array(n);
  for (let i = 0; i < n; i++) {
    const xi = x[i] = vector ? [b[permutation[i]]] : Array.from(b[permutation[i]]),
          mi = m[i];
    for (let k = 0; k < i; k++) {
      const f = mi[k],
            xk = x[k];
      if (f !== 0) for (let c = 0; c < columns; c++) xi[c] -= f * xk[c];
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    const xi = x[i],
          mi = m[i];
    for (let k = i + 1; k < n; k++) {
      const f = mi[k],
            xk = x[k];
      if (f !== 0) for (let c = 0; c < columns; c++) xi[c] -= f * xk[c];
    }
    for (let c = 0; c < columns; c++) xi[c] /= mi[i];
  }
  return vector ? x.map((row) => row[0]) : x;
}

export function inverse(a) {
  const n = requireSquareMatrix(a, "a");
  return solve(a, Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => +(i === j))));
}
