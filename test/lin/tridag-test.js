require("../../science.v1");
require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.lin.tridag");

suite.addBatch({
  "tridag": {
    "simple": function() {
      var n = 31;
      var a = [], b = [], c = [], d = [], x = [];
      for (var i=0; i<n; i++) {
        a[i] = 1;
        b[i] = 2;
        c[i] = 1;
        d[i] = i < n / 2 ? i + 1 : n - i;
      }
      science.lin.tridag(a, b.slice(), c, d.slice(), x, n);
      var matrix = [];
      for (var i=0; i<n; i++) {
        matrix[i] = [];
        for (var j=0; j<n; j++) matrix[i][j] = 0;
      }
      for (var i=0; i<n; i++) {
        matrix[i][i] = b[i];
        if (i > 0) matrix[i - 1][i] = a[i];
        if (i < n - 1) matrix[i + 1][i] = c[i];
      }
      var result = science.lin.multiply(matrix, x.map(function(d) { return [d]; }));
      var epsilon = 1e-12;
      for (var i=0; i<n; i++) {
        assert.isTrue(result[i] - d[i] < epsilon);
      }
    }
  }
});

suite.export(module);
