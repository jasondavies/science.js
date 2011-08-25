require("../../science");
require("../../science.stats");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.distance");

suite.addBatch({
  "distance": {
    "euclidean": function() {
      var euclidean = science.stats.distance.euclidean;
      assert.equal(euclidean([], []), 0);
      assert.equal(euclidean([0], [1]), 1);
      assert.equal(euclidean([0, 0], [1, 1]), Math.sqrt(2));
      assert.equal(euclidean([0, 0, 0], [1, 1, 1]), Math.sqrt(3));
    },
    "manhattan": function() {
      var manhattan = science.stats.distance.manhattan;
      assert.equal(manhattan([], []), 0);
      assert.equal(manhattan([0], [1]), 1);
      assert.equal(manhattan([0, 0], [1, 1]), 2);
      assert.equal(manhattan([0, 0, 0], [1, 1, 1]), 3);
    }
  }
});

suite.export(module);
