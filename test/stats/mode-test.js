require("../../science.v1");
require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.mode");

suite.addBatch({
  "mode": {
    "returns correct modes": function() {
      assert.equal(science.stats.mode([1, 2, 2, 3, 4, 7, 9]), 2);
      assert.equal(science.stats.mode([1, 2, 2, 3, 4, 7, 9].reverse()), 2);
      assert.equal(science.stats.mode([1]), 1);
      assert.equal(science.stats.mode([1, 1, 1]), 1);
      assert.isUndefined(science.stats.mode([1, 2, 3, 4, 5]));
      assert.isUndefined(science.stats.mode([]));
    }
  }
});

suite.export(module);
