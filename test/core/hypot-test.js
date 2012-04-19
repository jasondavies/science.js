require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.hypot");

suite.addBatch({
  "hypot": {
    "maximum supported hypotenuse": function() {
      var max = Number.MAX_VALUE / Math.sqrt(2);
      assert.equal(science.hypot(max, max), 1.7976931348623155e+308);
    }
  }
});

suite.export(module);
