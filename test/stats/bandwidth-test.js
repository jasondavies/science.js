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

test("science.stats.bandwidth.nrd0 falls back to the first value when there is no spread", function() {
  // Matches R: bw.nrd0(5), bw.nrd0(c(5, 5)) and bw.nrd0(0).
  assert.equal(science.stats.bandwidth.nrd0([5]), 4.5);
  assert.equal(science.stats.bandwidth.nrd0([5, 5]), .9 * 5 * Math.pow(2, -.2));
  assert.equal(science.stats.bandwidth.nrd0([0]), .9);
});
