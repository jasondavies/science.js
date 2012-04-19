require("../../science.v1");
require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.variance");

suite.addBatch({
  "variance": {
    "returns correct variances": function() {
      assert.isTrue(isNaN(science.stats.variance([])));
      assert.equal(science.stats.variance([1]), 0);
      assert.equal(science.stats.variance([1, 2]), .5);
      assert.equal(science.stats.variance([1, 2, 3]), 1);
      assert.equal(science.stats.variance([1, 2, 3, 4]), 5/3);
      assert.equal(science.stats.variance([1, 2, 3, 4, 5]), 2.5);
    }
  }
});

suite.export(module);
