require("../../science.v1");
require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.lin.decompose");

suite.addBatch({
  "decompose": {
    topic: science.lin.decompose,
    "symmetric": function(decompose) {
      var A = [[1, 1, 1], [1, 2, 3], [1, 3, 6]],
          result = decompose(A);
      assert.inDelta(
        science.lin.multiply(A, result.V),
        science.lin.multiply(result.V, result.D),
        1e-6
      );
    }
  }
});

suite.export(module);
