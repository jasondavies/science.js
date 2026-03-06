import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.stats.bandwidth.nrd0", function() {
  var data = [1, 4, 3, 2];
  assert.equal(science.stats.bandwidth.nrd0(data), .7635139420854616);
});

test("science.stats.bandwidth.nrd", function() {
  var data = [1, 4, 3, 2];
  assert.equal(science.stats.bandwidth.nrd(data), .899249754011766);
});
