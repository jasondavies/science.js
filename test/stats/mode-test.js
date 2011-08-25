require("../../science");
require("../../science.stats");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.mode");

suite.addBatch({
  "mode": {
    "returns correct modes": function() {
      assert.isTrue(isNaN(science.stats.mode([])));
      assert.equal(science.stats.mode([1, 2, 3, 4, 5]), null);
      assert.equal(science.stats.mode([1, 2, 2, 3, 4, 7, 9]), 2);
    }
  }
});

suite.export(module);
