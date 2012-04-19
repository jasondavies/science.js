require("../../science.v1");
require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.mean");

suite.addBatch({
  "mean": {
    "returns correct means": function() {
      assert.isTrue(isNaN(science.stats.mean([])));
      assert.equal(science.stats.mean([1]), 1);
      assert.equal(science.stats.mean([1, 2]), 1.5);
      assert.equal(science.stats.mean([1, 2, 3]), 2);
      assert.equal(science.stats.mean([1, 2, 3, 4]), 2.5);
      assert.equal(science.stats.mean([1, 2, 3, 4, 5]), 3);
    }
  }
});

suite.export(module);
