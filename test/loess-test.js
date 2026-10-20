import test from "node:test";
import { loess } from "../src/index.js";
import assert from "./assert.js";
import { seededRandom } from "./random.js";

const x5 = [1, 2, 3, 4, 5];

test("loess returns one or two points unchanged", () => {
  assert.deepEqual(loess([.5], [.7]), [.7]);
  assert.deepEqual(loess([.5, .6], [.7, .8]), [.7, .8]);
});

test("loess fits a straight line exactly", () => {
  const y = [2, 4, 6, 8, 10];
  assert.deepEqual(loess(x5, y, {bandwidth: .6}), y);
  assert.inDelta(loess(x5, x5, {bandwidth: 1}), x5, 1e-12);
  assert.deepEqual(loess(x5, x5, {bandwidth: .6, robustnessIterations: 0}), x5);
});

test("loess does not modify its inputs", () => {
  const x = [1, 2, 3, 4, 5, 6, 7],
        y = [3, 1, 4, 1, 5, 9, 2],
        weights = [1, 1, 0, 1, 1, 1, 1];
  loess(x, y, {weights});
  assert.deepEqual(x, [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(y, [3, 1, 4, 1, 5, 9, 2]);
  assert.deepEqual(weights, [1, 1, 0, 1, 1, 1, 1]);
});

test("loess rejects values that are not finite numbers", () => {
  const error = {name: "TypeError"};
  assert.throws(() => loess([1, 2, NaN, 4, 5], x5), error);
  assert.throws(() => loess(x5, [1, Infinity, 3, 4, 5]), error);
  assert.throws(() => loess(x5, [1, null, 3, 4, 5]), error);
  assert.throws(() => loess(["1", "2", "3", "4", "5"], x5), error);
  assert.throws(() => loess(x5, x5, {weights: [1, 1, NaN, 1, 1]}), error);
  assert.throws(() => loess(x5, x5, {weights: [1, true, 1, 1, 1]}), error);
  assert.throws(() => loess(1, x5), error);
});

test("loess rejects arrays of different lengths", () => {
  const error = {name: "RangeError", message: "Arrays must have the same length."};
  assert.throws(() => loess(x5, [1, 2, 3]), error);
  assert.throws(() => loess(x5, x5, {weights: [1, 1, 1]}), error);
});

test("loess rejects invalid options", () => {
  for (const bandwidth of [0, -.5, 1.5, NaN]) {
    assert.throws(() => loess(x5, x5, {bandwidth}), {name: "RangeError", message: "bandwidth must be greater than 0 and at most 1."});
    assert.throws(() => loess([1], [1], {bandwidth}), {name: "RangeError"});
  }
  for (const robustnessIterations of [-1, 1.5, NaN]) {
    assert.throws(() => loess(x5, x5, {bandwidth: .6, robustnessIterations}), {name: "RangeError", message: "robustnessIterations must be a non-negative integer."});
  }
  for (const accuracy of [-1, NaN]) {
    assert.throws(() => loess(x5, x5, {bandwidth: .6, accuracy}), {name: "RangeError", message: "accuracy must be a non-negative number."});
  }
  assert.throws(() => loess(x5, x5), {name: "RangeError", message: "bandwidth is too small for the number of points."});
  assert.throws(() => loess([], []), {name: "RangeError"});
});

test("loess rejects x values that are not sorted", () => {
  const error = {name: "RangeError", message: "x must be sorted in ascending order."};
  assert.throws(() => loess([5, 1, 4, 2, 3], [5, 1, 4, 2, 3], {bandwidth: .6}), error);
  assert.throws(() => loess([1, 2, 4, 3, 5], x5, {bandwidth: .6}), error);
});

test("loess rejects negative or all-zero weights", () => {
  assert.throws(() => loess(x5, x5, {bandwidth: .6, weights: [1, -.5, 1, 1, 1]}), {name: "RangeError", message: "weights must be non-negative."});
  assert.throws(() => loess(x5, x5, {bandwidth: .6, weights: [0, 0, 0, 0, 0]}), {name: "RangeError", message: "At least one weight must be positive."});
});

test("loess treats null or undefined weights as all 1", () => {
  const y = [2, 1, 4, 3, 5];
  assert.deepEqual(loess(x5, y, {bandwidth: .6, weights: undefined}), loess(x5, y, {bandwidth: .6}));
  assert.deepEqual(loess(x5, y, {bandwidth: .6, weights: null}), loess(x5, y, {bandwidth: .6}));
});

test("loess falls back to y when robustness weights empty a window", () => {
  assert.inDelta(loess([0, 1, 2, 3, 4, 5, 6], [0, 2, 5, 0, 4, 2, 0], {bandwidth: 4 / 7}), [0, 2, 2, 0, 2, 2, 0], 1e-9);
});

test("loess fits zero-weight points from their neighbours", () => {
  const res = loess([0, 1, 2, 3, 4], [100, -50, 4, 6, 8], {bandwidth: .6, robustnessIterations: 0, weights: [0, 0, 1, 1, 1]});
  assert.inDelta(res, [0, 2, 4, 6, 8], 1e-9);
});

test("loess fits from the nearest weighted points after leading zero weights", () => {
  const x = Array.from({length: 30}, (_, i) => i),
        masked = (i) => i >= 1 && i <= 8,
        y = x.map((v, i) => masked(i) ? 1000 : 2 * v + 1),
        weights = x.map((v, i) => masked(i) ? 0 : 1);
  assert.inDelta(loess(x, y, {bandwidth: .3, robustnessIterations: 0, weights}), x.map((v) => 2 * v + 1), 1e-9);
});

test("loess keeps the window centred after a gap in x", () => {
  const x = [0, 1, 2, 3, 4, 5],
        y = [1000, 1000, 1000, 1000, 1000, 1000];
  for (let v = 100; v < 114; v++) x.push(v), y.push(v);
  assert.inDelta(loess(x, y, {bandwidth: .25, robustnessIterations: 0}).slice(6), x.slice(6), 1e-9);
});

test("loess keeps precision with large x values", () => {
  const y = Array.from({length: 50}, (_, i) => i),
        x = y.map((i) => 1.6e12 + i * 1000);
  assert.inDelta(loess(x, y), y, 1e-6);
});

test("loess accepts tied x values", () => {
  assert.inDelta(loess([1, 1, 2, 2, 3, 3, 4, 4], [2, 2, 4, 4, 6, 6, 8, 8], {bandwidth: .5, robustnessIterations: 0}), [2, 2, 4, 4, 6, 6, 8, 8], 1e-9);
  assert.inDelta(loess([1, 1, 1, 2, 2, 2, 3, 3, 3], [1, 2, 3, 4, 5, 6, 7, 8, 9], {bandwidth: 2 / 9, robustnessIterations: 0}), [2, 2, 2, 5, 5, 5, 8, 8, 8], 1e-9);
});

test("loess with zero accuracy returns finite values", () => {
  const res = loess([0, 1, 2, 3, 4], [0, 2, 4, 6, 8], {bandwidth: .4, accuracy: 0, robustnessIterations: 0, weights: [1, 0, 0, 0, 1]});
  assert.isTrue(res.every(Number.isFinite));
});

test("loess never returns NaN for valid input", () => {
  const random = seededRandom(42);
  for (let t = 0; t < 2000; t++) {
    const n = 3 + Math.floor(random() * 30),
          x = [],
          y = [],
          weights = [];
    let v = random();
    for (let i = 0; i < n; i++) {
      x[i] = v;
      y[i] = random() < .1 ? random() * 100 : random();
      weights[i] = random() < .3 ? 0 : random();
      v += 1e-9 + random() * (random() < .2 ? 1e-6 : 1);
    }
    weights[Math.floor(random() * n)] = 1;
    const options = {
      bandwidth: Math.min(1, (2 + Math.floor(random() * n)) / n),
      robustnessIterations: Math.floor(random() * 4),
      weights: random() < .5 ? weights : undefined
    };
    assert.isTrue(loess(x, y, options).every(Number.isFinite), `non-finite result for input ${t}`);
  }
});

function sineData(n, xNoise, yNoise, random) {
  const dx = 2 * Math.PI / n,
        x = [],
        y = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    x[i] = v;
    y[i] = Math.sin(v) + (2 * random() - 1) * yNoise;
    v += dx * (1 + (2 * random() - 1) * xNoise);
  }
  return {x, y};
}

test("loess smooths a noisy sine", () => {
  const {x, y} = sineData(100, .1, .2, seededRandom(1)),
        res = loess(x, y, {robustnessIterations: 4});
  let noisy = 0,
      fit = 0;
  for (let i = 0; i < x.length; i++) {
    noisy += (y[i] - Math.sin(x[i])) ** 2;
    fit += (res[i] - Math.sin(x[i])) ** 2;
  }
  assert.isTrue(fit < noisy);
});

test("loess is smoother with a larger bandwidth", () => {
  const {x, y} = sineData(100, .1, .2, seededRandom(2)),
        roughness = [.1, .5, 1].map((bandwidth) => {
          const res = loess(x, y, {bandwidth, robustnessIterations: 4});
          let s = 0;
          for (let i = 1; i < res.length; i++) s += (res[i] - res[i - 1]) ** 2;
          return s;
        });
  assert.isTrue(roughness[1] < roughness[0] && roughness[2] < roughness[1]);
});

test("loess is smoother with more robustness iterations when there are outliers", () => {
  const {x, y} = sineData(100, .1, .1, seededRandom(3));
  y[33] *= 100;
  y[66] *= -100;
  const roughness = [0, 1, 2, 3].map((robustnessIterations) => {
    const res = loess(x, y, {robustnessIterations});
    let s = 0;
    for (let i = 1; i < res.length; i++) s += Math.abs(res[i] - res[i - 1]);
    return s;
  });
  for (let k = 1; k < roughness.length; k++) assert.isTrue(roughness[k] < roughness[k - 1]);
});

// From Apache Commons Math issue MATH-296.
test("loess matches the Apache Commons Math reference values", () => {
  const x = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0],
        y = [0.47, 0.48, 0.55, 0.56, -0.08, -0.04, -0.07, -0.07, -0.56, -0.46, -0.56, -0.52, -3.03, -3.08, -3.09, -3.04, 3.54, 3.46, 3.36, 3.35],
        expected = [0.461, 0.499, 0.541, 0.308, 0.175, -0.042, -0.072, -0.196, -0.311, -0.446, -0.557, -1.497, -2.133, -3.08, -3.09, -0.621, 0.982, 3.449, 3.389, 3.336];
  assert.inDelta(loess(x, y, {robustnessIterations: 3}), expected, .02);
});
