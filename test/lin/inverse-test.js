import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.lin.inverse nonsingular matrix", function() {
  assert.inDelta(
    science.lin.inverse([[4, 7], [2, 6]]),
    [[0.6, -0.7], [-0.2, 0.4]],
    1e-12
  );
});

test("science.lin.inverse singular matrix", function() {
  assert.isUndefined(science.lin.inverse([[1, 2], [2, 4]]));
});
