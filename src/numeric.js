// Numerical helpers shared by several functions; not exported from the package.

// The largest magnitude in a matrix. This is a separate function because,
// inlined in eigen, the loop made the decomposition about 20% slower.
export function largestMagnitude(m) {
  let max = 0;
  for (let i = 0; i < m.length; i++) {
    const row = m[i];
    for (let j = 0; j < row.length; j++) max = Math.max(max, Math.abs(row[j]));
  }
  return max;
}

// The power of 2 nearest to x > 0, within the range of normal numbers, so that
// dividing or multiplying by it is exact and cannot overflow.
export function powerOfTwoNear(x) {
  return Math.pow(2, Math.max(-1022, Math.min(1023, Math.round(Math.log2(x)))));
}

// The p-norm (p >= 1, or 2 by default) of the n values given by value(i),
// scaled by the largest magnitude so that it neither overflows nor underflows.
export function scaledNorm(n, value, p = 2) {
  let max = 0;
  for (let i = 0; i < n; i++) max = Math.max(max, Math.abs(value(i)));
  if (max === 0 || max === Infinity) return max;
  let s = 0;
  for (let i = 0; i < n; i++) s += Math.pow(Math.abs(value(i)) / max, p);
  return max * Math.pow(s, 1 / p);
}
