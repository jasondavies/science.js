import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.stats.mode returns correct modes", function() {
  assert.equal(science.stats.mode([1, 2, 2, 3, 4, 7, 9]), 2);
  assert.equal(science.stats.mode([1, 2, 2, 3, 4, 7, 9].reverse()), 2);
  assert.equal(science.stats.mode([1]), 1);
  assert.equal(science.stats.mode([1, 1, 1]), 1);
  assert.equal(science.stats.mode(["hasOwnProperty", "x", "x"]), "x");
  assert.isUndefined(science.stats.mode([1, 2, 3, 4, 5]));
  assert.isUndefined(science.stats.mode([]));
});
