require("../../../science.v1");

const test = require("node:test");
const assert = require("../../assert");

test("science.stats.distribution.gaussian.pdf", function() {
  var gaussian = science.stats.distribution.gaussian();
  assert.equal(gaussian.pdf(0), 1 / Math.sqrt(2 * Math.PI));
});
