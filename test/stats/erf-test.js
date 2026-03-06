import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.stats.erf", function() {
  var erf = science.stats.erf;
  assert.inDelta(erf(-3), -0.999977909503, 1e-6);
  assert.inDelta(erf(-1), -0.842700792950, 1e-6);
  assert.inDelta(erf(0), 0, 1e-6);
  assert.inDelta(erf(0.5), 0.520499877813, 1e-6);
  assert.inDelta(erf(2.1), 0.997020533344, 1e-6);
});
