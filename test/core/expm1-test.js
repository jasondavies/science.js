require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.expm1");

suite.addBatch({
  "expm1": {
    "simple": function() {
      var expm1 = science.expm1;
      assert.inDelta(expm1(-1  ),       -0.632120558828558,       1e-6);
      assert.inDelta(expm1( 0  ),        0,                       1e-6);
      assert.inDelta(expm1(1e-5 - 1e-8), 0.000009990049900216168, 1e-6);
      assert.inDelta(expm1(1e-5 + 1e-8), 0.000010010050100217178, 1e-6);
      assert.inDelta(expm1( 0.5),        0.6487212707001282,      1e-6);
    }
  }
});

suite.export(module);
