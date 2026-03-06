require("../../science.v1");

const test = require("node:test");
const assert = require("../assert");

test("science.stats.iqr returns correct interquartile ranges", function() {
  assert.isTrue(isNaN(science.stats.iqr([])));
  assert.equal(science.stats.iqr([1]), 0);
  assert.equal(science.stats.iqr([1, 2]), .5);
  assert.equal(science.stats.iqr([1, 2, 3]), 1);
  assert.equal(science.stats.iqr([1, 2, 3, 4]), 1.5);
  assert.equal(science.stats.iqr([1, 2, 3, 4, 5]), 2);
  assert.equal(science.stats.iqr([1, 2, 3, 4, 5, 6]), 2.5);
});
