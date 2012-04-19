require("../../science.v1");
require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.iqr");

suite.addBatch({
  "iqr": {
    "returns correct interquartile ranges": function() {
      assert.isTrue(isNaN(science.stats.iqr([])));
      assert.equal(science.stats.iqr([1]), 0);
      assert.equal(science.stats.iqr([1, 2]), .5);
      assert.equal(science.stats.iqr([1, 2, 3]), 1);
      assert.equal(science.stats.iqr([1, 2, 3, 4]), 1.5);
      assert.equal(science.stats.iqr([1, 2, 3, 4, 5]), 2);
      assert.equal(science.stats.iqr([1, 2, 3, 4, 5, 6]), 2.5);
    }
  }
});

suite.export(module);
