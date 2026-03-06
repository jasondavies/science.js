import science from "../../../index.js";
import test from "node:test";
import assert from "../../assert.js";

test("science.stats.distribution.gaussian.pdf", function() {
  var gaussian = science.stats.distribution.gaussian();
  assert.equal(gaussian.pdf(0), 1 / Math.sqrt(2 * Math.PI));
});
