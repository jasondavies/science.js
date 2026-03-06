import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.ascending sorts in ascending order", function() {
  var a = [1, 4, 5, 2, 3, 6];
  a.sort(science.ascending);
  assert.deepEqual(a, [1, 2, 3, 4, 5, 6]);
});
