require("../../science.v1");

const test = require("node:test");
const assert = require("../assert");

test("science.hypot zero vector", function() {
  assert.equal(science.hypot(0, 0), 0);
});

test("science.hypot maximum supported hypotenuse", function() {
  var max = Number.MAX_VALUE / Math.sqrt(2);
  assert.equal(science.hypot(max, max), 1.7976931348623155e+308);
});
