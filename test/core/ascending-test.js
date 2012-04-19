require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.ascending");

suite.addBatch({
  "ascending": {
    "simple": function() {
      var a = [1, 4, 5, 2, 3, 6];
      a.sort(science.ascending);
      assert.deepEqual(a, [1, 2, 3, 4, 5, 6]);
    }
  }
});

suite.export(module);
