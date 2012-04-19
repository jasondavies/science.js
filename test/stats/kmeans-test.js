require("../../science.v1");
require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.kmeans");

suite.addBatch({
  "kmeans": {
    "simple": function() {
      var data = [],
          i;
      for (i=0; i<100; i++) {
        data.push([Math.random(), Math.random()]);
      }
      for (i=0; i<100; i++) {
        data.push([10 + Math.random(), 10 + Math.random()]);
      }
      var x = science.stats.kmeans().k(2)(data);
      var cluster0 = x.assignments[0];
      for (i=0; i<100; i++) {
        assert.equal(x.assignments[i], cluster0);
      }
      for (i=100; i<200; i++) {
        assert.equal(x.assignments[i], 1 - cluster0);
      }
    }
  }
});

suite.export(module);
