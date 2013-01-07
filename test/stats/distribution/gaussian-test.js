require("../../../science.v1");
require("../../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.distribution.gaussian");

suite.addBatch({
  "gaussian": {
    topic: science.stats.distribution.gaussian,
    "pdf": function(gaussian) {
      assert.equal(gaussian.pdf(0), 1 / Math.sqrt(2 * Math.PI));
    }
  }
});

suite.export(module);
