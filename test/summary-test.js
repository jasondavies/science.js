import test from "node:test";
import { iqr, mean, median, modes, quantile, quantiles, standardDeviation, variance } from "../src/index.js";
import assert from "./assert.js";

test("mean", () => {
  assert.equal(mean([1, 2, 3, 4]), 2.5);
  assert.equal(mean(new Float64Array([1, 2])), 1.5);
  assert.equal(mean([Number.MAX_VALUE, Number.MAX_VALUE]), Number.MAX_VALUE);
  assert.isTrue(Number.isNaN(mean([])));
});

test("variance and standardDeviation", () => {
  assert.equal(variance([1, 2, 3, 4]), 5 / 3);
  assert.equal(variance([1, 2]), .5);
  assert.equal(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]), Math.sqrt(32 / 7));
  assert.inDelta(variance([1e9 + 1, 1e9 + 2, 1e9 + 3]), 1, 1e-6);
  assert.isTrue(Number.isNaN(variance([5])));
  assert.isTrue(Number.isNaN(variance([])));
});

test("quantile and quantiles use R's type 7", () => {
  assert.deepEqual(quantiles([1, 2, 3, 4], [0, .25, .5, 1]), [1, 1.75, 2.5, 4]);
  assert.equal(quantile([3, 1, 2], .5), 2);
  assert.equal(quantile([10], .3), 10);
  assert.isTrue(Number.isNaN(quantile([], .5)));
});

test("quantile does not modify its input", () => {
  const values = [3, 1, 2];
  quantile(values, .5);
  assert.deepEqual(values, [3, 1, 2]);
});

test("quantile rejects probabilities outside [0, 1]", () => {
  for (const p of [-.1, 1.1, NaN]) {
    assert.throws(() => quantile([1, 2], p), {name: "RangeError"});
    assert.throws(() => quantiles([1, 2], [p]), {name: "RangeError"});
  }
});

test("median and iqr", () => {
  assert.equal(median([3, 1, 4, 2]), 2.5);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(iqr([1, 2, 3, 4]), 1.5);
});

test("modes returns every most frequent value in order of appearance", () => {
  assert.deepEqual(modes([1, 2, 2, 3]), [2]);
  assert.deepEqual(modes([3, 3, 1, 1, 2]), [3, 1]);
  assert.deepEqual(modes([1, "1"]), [1, "1"]);
  assert.deepEqual(modes(["hasOwnProperty", "__proto__", "__proto__"]), ["__proto__"]);
  assert.deepEqual(modes([]), []);
});

test("summary statistics reject values that are not arrays", () => {
  for (const f of [mean, median, variance, iqr, modes]) assert.throws(() => f(5), {name: "TypeError"});
});

test("mean and median of infinite or very large values", () => {
  assert.equal(mean([Infinity, 1]), Infinity);
  assert.equal(mean([-Infinity, -Infinity]), -Infinity);
  assert.isTrue(Number.isNaN(mean([Infinity, -Infinity])));
  assert.isTrue(Number.isNaN(mean([NaN, 1])));
  assert.equal(median([-1.7e308, 1.7e308]), 0);
  assert.equal(quantile([-1e308, 1e308], .5), 0);
  assert.equal(median([1, Infinity]), Infinity);
});
