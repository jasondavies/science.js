require("../../../science");
require("../../../science.stats");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.distribution.gaussian");

suite.addBatch({
  "gaussian": {
    "simple": function() {
      var gaussian = science.stats.distribution.gaussian;
    }
  }
});

suite.export(module);
