require("../../science.v1");

const test = require("node:test");
const assert = require("../assert");

test("science.stats.median returns correct medians", function() {
  assert.isTrue(isNaN(science.stats.median([])));
  assert.equal(science.stats.median([1]), 1);
  assert.equal(science.stats.median([1, 2]), 1.5);
  assert.equal(science.stats.median([1, 2, 3]), 2);
  assert.equal(science.stats.median([1, 2, 3, 4]), 2.5);
  assert.equal(science.stats.median([1, 2, 3, 4, 5]), 3);
});
