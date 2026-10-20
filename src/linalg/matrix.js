import { largestMagnitude, powerOfTwoNear } from "../numeric.js";
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

// LU decomposition with partial pivoting of the square matrix m, in place.
// Returns the row permutation and its sign.
function lu(m) {
  const n = m.length,
        permutation = Array.from({length: n}, (_, i) => i);
  let sign = 1;
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
  return {permutation, sign};
}

export function determinant(a) {
  const n = requireSquareMatrix(a, "a"),
        m = a.map((row) => Array.from(row)),
        {sign} = lu(m);
  let d = sign;
  for (let i = 0; i < n; i++) d *= m[i][i];
  // Adding 0 turns -0 into 0.
  return d + 0;
}

// Scales the rows and then the columns of a copy of the square matrix a by
// powers of 2 (which is exact), so that the largest magnitude in each is about
// 1, as LAPACK's dgeequ does. Returns the scaled matrix and the row and column
// scale factors, or null if a row or column is zero.
function equilibrate(a) {
  const n = a.length,
        m = a.map((row) => Array.from(row)),
        rows = new Array(n),
        columns = new Array(n);
  for (let i = 0; i < n; i++) {
    const max = largestMagnitude([m[i]]);
    if (max === 0) return null;
    rows[i] = 1 / powerOfTwoNear(max);
    for (let j = 0; j < n; j++) m[i][j] *= rows[i];
  }
  for (let j = 0; j < n; j++) {
    let max = 0;
    for (let i = 0; i < n; i++) max = Math.max(max, Math.abs(m[i][j]));
    if (max === 0) return null;
    columns[j] = 1 / powerOfTwoNear(max);
    for (let i = 0; i < n; i++) m[i][j] *= columns[j];
  }
  return {m, rows, columns};
}

// Solves a x = b for x, where b is a vector or a matrix of right-hand sides.
// The rows and columns of a are first equilibrated; a is treated as singular if
// a pivot of the equilibrated matrix is no larger than n × machine epsilon.
export function solve(a, b) {
  const n = requireSquareMatrix(a, "a");
  requireArray(b, "b");
  const vector = !b.length || typeof b[0] === "number",
        width = vector ? 1 : requireMatrix(b, "b")[1];
  if (vector) requireFiniteNumbers(b, "b");
  if (b.length !== n) throw new RangeError(`b must have ${n} rows.`);

  const equilibrated = equilibrate(a);
  if (!equilibrated) throw new RangeError("Matrix is singular.");
  const {m, rows, columns} = equilibrated,
        {permutation} = lu(m),
        tolerance = n * Number.EPSILON;
  for (let i = 0; i < n; i++) {
    if (!(Math.abs(m[i][i]) > tolerance)) throw new RangeError("Matrix is singular.");
  }

  // Forward substitution with L, then back substitution with U, a row of
  // right-hand sides at a time; the right-hand sides are scaled like the rows
  // of a, and the solution like its columns.
  const x = new Array(n);
  for (let i = 0; i < n; i++) {
    const p = permutation[i],
          xi = x[i] = vector ? [b[p] * rows[p]] : Array.from(b[p], (v) => v * rows[p]),
          mi = m[i];
    for (let k = 0; k < i; k++) {
      const f = mi[k],
            xk = x[k];
      if (f !== 0) for (let c = 0; c < width; c++) xi[c] -= f * xk[c];
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    const xi = x[i],
          mi = m[i];
    for (let k = i + 1; k < n; k++) {
      const f = mi[k],
            xk = x[k];
      if (f !== 0) for (let c = 0; c < width; c++) xi[c] -= f * xk[c];
    }
    for (let c = 0; c < width; c++) xi[c] /= mi[i];
  }
  for (let i = 0; i < n; i++) for (let c = 0; c < width; c++) x[i][c] *= columns[i];
  return vector ? x.map((row) => row[0]) : x;
}

export function inverse(a) {
  const n = requireSquareMatrix(a, "a");
  return solve(a, Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => +(i === j))));
}
