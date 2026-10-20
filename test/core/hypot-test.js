import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.hypot zero vector", function() {
  assert.equal(science.hypot(0, 0), 0);
});

test("science.hypot maximum supported hypotenuse", function() {
  var max = Number.MAX_VALUE / Math.sqrt(2);
  assert.equal(science.hypot(max, max), 1.7976931348623155e+308);
});

test("science.hypot infinite values", function() {
  assert.equal(science.hypot(Infinity, Infinity), Infinity);
  assert.equal(science.hypot(-Infinity, 1), Infinity);
});
