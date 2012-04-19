require("../../science.v1");
require("../../science.v1");

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
    },
    "hamming": function() {
      var hamming = science.stats.distance.hamming;
      assert.equal(hamming([], []), 0);
      assert.equal(hamming([0], [1]), 1);
      assert.equal(hamming([0, 1], [1, 1]), 1);
      assert.equal(hamming([3, 2, 1], [1, 2, 3]), 2);
    },
    "minkowski": function() {
      var minkowski = science.stats.distance.minkowski(.5);
      assert.equal(minkowski([], []), 0);
      assert.equal(minkowski([0], [1]), 1);
      assert.equal(minkowski([0, 1], [1, 1]), 1);
      assert.equal(minkowski([1, 2, 3], [1, 2, 3]), 0);
    },
    "chebyshev": function() {
      var chebyshev = science.stats.distance.chebyshev;
      assert.equal(chebyshev([], []), 0);
      assert.equal(chebyshev([0], [1]), 1);
      assert.equal(chebyshev([0, 1], [1, 1]), 1);
      assert.equal(chebyshev([3, 2, 1], [1, 2, 3]), 2);
    },
    "jaccard": function() {
      var jaccard = science.stats.distance.jaccard;
      assert.isTrue(isNaN(jaccard([], [])));
      assert.equal(jaccard([0], [1]), 0);
      assert.equal(jaccard([0, 1], [1, 1]), .5);
      assert.equal(jaccard([3, 2, 1, 0], [1, 2, 3, 4]), .25);
    },
    "braycurtis": function() {
      var braycurtis = science.stats.distance.braycurtis;
      assert.isTrue(isNaN(braycurtis([], [])));
      assert.equal(braycurtis([0], [1]), 1);
      assert.equal(braycurtis([0, 1], [1, 1]), 1 / 3);
      assert.equal(braycurtis([3, 2, 1, 0], [1, 2, 3, 4]), .5);
    }
  }
});

suite.export(module);
