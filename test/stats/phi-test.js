require("../../science.v1");
require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.phi");

suite.addBatch({
  "phi": {
    "simple": function() {
      var phi = science.stats.phi;
      assert.inDelta(phi(-3  ),  0.00134989803163, 1e-6);
      assert.inDelta(phi(-1  ),  0.158655253931,   1e-6);
      assert.inDelta(phi( 0  ),  0.5,              1e-6);
      assert.inDelta(phi( 0.5),  0.691462461274,   1e-6);
      assert.inDelta(phi( 2.1),  0.982135579437,   1e-6);
    }
  }
});

suite.export(module);
