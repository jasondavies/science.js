require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.zeroes");

suite.addBatch({
  "zeroes": {
    "10": function() {
      assert.deepEqual(science.zeroes(10), [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ]);
    },
    "10, 10": function() {
      assert.deepEqual(science.zeroes(10, 10), [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]);
    }
  }
});

suite.export(module);
