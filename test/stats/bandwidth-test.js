require("../../science");
require("../../science.stats");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.bandwidth");

suite.addBatch({
  "bandwidth": {
    "nrd0": function() {
      var data = [1, 2, 3, 4];
      assert.equal(science.stats.bandwidth.nrd0(data),
        .7635139420854616);
    },
    "nrd": function() {
      var data = [1, 2, 3, 4];
      assert.equal(science.stats.bandwidth.nrd(data),
        .899249754011766);
    }
  }
});

suite.export(module);
