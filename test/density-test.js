import test from "node:test";
import { bandwidths, kde, kernels } from "../src/index.js";
import assert from "./assert.js";

function integrate(f, from, to, step = 1e-3) {
  let s = 0;
  for (let x = from + step / 2; x < to; x += step) s += f(x) * step;
  return s;
}

test("each kernel integrates to 1", () => {
  for (const [name, kernel] of Object.entries(kernels)) {
    assert.inDelta(integrate(kernel, -10, 10), 1, 1e-5, name);
  }
});

test("kernels are zero outside [-1, 1], except the Gaussian", () => {
  for (const [name, kernel] of Object.entries(kernels)) {
    if (name !== "gaussian") assert.equal(kernel(1.5), 0, name);
  }
  assert.equal(kernels.epanechnikov(0), .75);
});

// Expected values are from R: bw.nrd0(c(1, 4, 3, 2)) and bw.nrd(c(1, 4, 3, 2)).
test("bandwidth selectors match R", () => {
  assert.inDelta(bandwidths.nrd0([1, 4, 3, 2]), .7635139420854616, 1e-15);
  assert.inDelta(bandwidths.nrd([1, 4, 3, 2]), .899249754011766, 1e-15);
});

test("nrd0 falls back when the spread is zero", () => {
  assert.equal(bandwidths.nrd0([5, 5]), .9 * 5 * Math.pow(2, -.2));
  assert.equal(bandwidths.nrd0([0, 0]), .9 * Math.pow(2, -.2));
  assert.equal(bandwidths.nrd([5, 5, 5, 5, 1]), 0);
});

test("bandwidth selectors need at least two values", () => {
  for (const f of Object.values(bandwidths)) assert.throws(() => f([5]), {name: "RangeError"});
});

test("kde computes the density with the given bandwidth", () => {
  const density = kde([1, 2, 4], {bandwidth: .5}),
        expected = [1, 2, 4].reduce((y, x) => y + kernels.gaussian((2 - x) / .5), 0) / (3 * .5);
  assert.inDelta(density(2), expected, 1e-15);
  assert.equal(density.bandwidth, .5);
});

test("kde uses nrd0 for the default bandwidth", () => {
  assert.equal(kde([1, 4, 3, 2]).bandwidth, bandwidths.nrd0([1, 4, 3, 2]));
  assert.equal(kde([1, 4, 3, 2], {bandwidth: bandwidths.nrd}).bandwidth, bandwidths.nrd([1, 4, 3, 2]));
});

test("kde handles samples with many repeated values", () => {
  const density = kde([1, 2, 3, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
  assert.inDelta(integrate(density, -5, 11, .01), 1, 1e-3);
});

test("kde validates its input", () => {
  assert.throws(() => kde([1, 2, 3], {bandwidth: 0}), {name: "RangeError"});
  assert.throws(() => kde([5, 5, 5, 5, 1], {bandwidth: bandwidths.nrd}), {name: "RangeError"});
  assert.throws(() => kde([]), {name: "RangeError"});
  assert.throws(() => kde([1, NaN]), {name: "TypeError"});
  assert.throws(() => kde([1, 2], {kernel: "gaussian"}), {name: "TypeError"});
});
