require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.quadratic");

suite.addBatch({
  "real roots": {
    topic: function() {
      return science.quadratic();
    },
    "no roots": function(quadratic) {
      assert.deepEqual(quadratic(1, 1, 1), []);
    },
    "single root": function(quadratic) {
      assert.deepEqual(quadratic(1, -2, 1), [1]);
    },
    "two roots": function(quadratic) {
      assert.deepEqual(quadratic(1, 1, -2), [-2.5, .5]);
    }
  },
  "complex roots": {
    topic: function() {
      return science.quadratic().complex(true);
    },
    "imaginary parts": function(quadratic) {
      assert.deepEqual(quadratic(1, 0, 1), [{r: 0, i: -1}, {r: 0, i: 1}]);
    }
  }
});

suite.export(module);
