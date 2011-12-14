require("../../science");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.vector.decompose");

suite.addBatch({
  "decompose": {
    "symmetric": function() {
      var decompose = science.vector.decompose();
      var A = [[1, 1, 1], [1, 2, 3], [1, 3, 6]];
      var result = decompose(A);
      assert.inDelta(
        science.vector.multiply(A, result.V),
        science.vector.multiply(result.V, result.D),
        1e-6
      );
    }
  }
});

suite.export(module);
