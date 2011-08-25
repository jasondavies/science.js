/**
 * Solves tridiagonal systems of linear equations.
 *
 * Source: http://en.wikipedia.org/wiki/Tridiagonal_matrix_algorithm
 *
 * @param {number[]} a
 * @param {number[]} b
 * @param {number[]} c
 * @param {number[]} d
 * @param {number[]} x
 * @param {number} n
 */
science.lin.tridag = function(a, b, c, d, x, n) {
  c[0] /= b[0];
  d[0] /= b[0];
  var i,
      id;
  for (i = 1; i < n; i++) {
    id = 1 / (b[i] - c[i-1] * a[i]);
    c[i] *= id;
    d[i] = (d[i] - d[i - 1] * a[i]) * id;
  }
  x[n] = d[n];
  for (i = n - 2; i >= 0; i--) {
    x[i] = d[i] - c[i] * x[i + 1];
  }
};
