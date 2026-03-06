require("../../science.v1");

const test = require("node:test");
const assert = require("../assert");

test("science.stats.variance returns correct variances", function() {
  assert.isTrue(isNaN(science.stats.variance([])));
  assert.equal(science.stats.variance([1]), 0);
  assert.equal(science.stats.variance([1, 2]), .5);
  assert.equal(science.stats.variance([1, 2, 3]), 1);
  assert.equal(science.stats.variance([1, 2, 3, 4]), 5 / 3);
  assert.equal(science.stats.variance([1, 2, 3, 4, 5]), 2.5);
});
