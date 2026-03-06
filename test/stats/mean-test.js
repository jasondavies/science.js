import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.stats.mean returns correct means", function() {
  assert.isTrue(isNaN(science.stats.mean([])));
  assert.equal(science.stats.mean([1]), 1);
  assert.equal(science.stats.mean([1, 2]), 1.5);
  assert.equal(science.stats.mean([1, 2, 3]), 2);
  assert.equal(science.stats.mean([1, 2, 3, 4]), 2.5);
  assert.equal(science.stats.mean([1, 2, 3, 4, 5]), 3);
});
