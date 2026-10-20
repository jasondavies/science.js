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

test("science.lin.inverse matrices with small or badly scaled entries", function() {
  assert.inDelta(science.lin.inverse([[1e-11, 0], [0, 1e-11]]), [[1e11, 0], [0, 1e11]], 1e-1);
  assert.inDelta(science.lin.inverse([[1e10, 0], [0, 1]]), [[1e-10, 0], [0, 1]], 1e-20);
});

test("science.lin.inverse numerically singular matrix", function() {
  assert.isUndefined(science.lin.inverse([[1, 2], [3, 6.000000000000001]]));
});
