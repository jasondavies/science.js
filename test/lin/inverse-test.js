require("../../science.v1");

const test = require("node:test");
const assert = require("../assert");

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
