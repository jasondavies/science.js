import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.lin.tridag simple", function() {
  var n = 31;
  var a = [], b = [], c = [], d = [], x = [];
  for (var i = 0; i < n; i++) {
    a[i] = 1;
    b[i] = 2;
    c[i] = 1;
    d[i] = i < n / 2 ? i + 1 : n - i;
  }
  science.lin.tridag(a, b.slice(), c, d.slice(), x, n);
  var matrix = [];
  for (var row = 0; row < n; row++) {
    matrix[row] = [];
    for (var col = 0; col < n; col++) matrix[row][col] = 0;
  }
  for (var j = 0; j < n; j++) {
    matrix[j][j] = b[j];
    if (j > 0) matrix[j - 1][j] = a[j];
    if (j < n - 1) matrix[j + 1][j] = c[j];
  }
  var result = science.lin.multiply(matrix, x.map(function(d) { return [d]; }));
  var epsilon = 1e-12;
  for (var k = 0; k < n; k++) {
    assert.isTrue(result[k] - d[k] < epsilon);
  }
});
