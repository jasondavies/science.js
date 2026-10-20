import test from "node:test";
import { erf, erfc, normal } from "../src/index.js";
import assert from "./assert.js";
import { seededRandom } from "./random.js";

// Reference values are from SciPy 1.16 (scipy.special and scipy.stats.norm).
function assertRelative(actual, expected, tolerance) {
  assert.isTrue(Math.abs(actual - expected) <= tolerance * Math.abs(expected), `expected ${actual} to be within a relative ${tolerance} of ${expected}`);
}

test("erf", () => {
  assertRelative(erf(.5), 0.5204998778130465, 1e-15);
  assertRelative(erf(1), 0.8427007929497148, 1e-15);
  assertRelative(erf(2), 0.9953222650189527, 1e-15);
  assertRelative(erf(3), 0.9999779095030014, 1e-15);
  assertRelative(erf(-1.5), -0.9661051464753108, 1e-15);
  assert.equal(erf(Infinity), 1);
  assert.equal(erf(-Infinity), -1);
  assert.isTrue(Object.is(erf(-0), -0));
  assert.isTrue(Number.isNaN(erf(NaN)));
});

test("erfc keeps its precision in the tail", () => {
  assertRelative(erfc(.5), 0.4795001221869535, 1e-15);
  assertRelative(erfc(2), 0.004677734981047266, 1e-14);
  assertRelative(erfc(5), 1.5374597944280353e-12, 1e-14);
  assertRelative(erfc(10), 2.0884875837625446e-45, 1e-13);
  assertRelative(erfc(26), 5.663192408856145e-296, 1e-13);
  assert.equal(erfc(Infinity), 0);
  assert.equal(erfc(-Infinity), 2);
});

test("normal cdf and pdf", () => {
  const standard = normal();
  assert.equal(standard.cdf(0), .5);
  assertRelative(standard.cdf(1), 0.8413447460685429, 1e-15);
  assertRelative(standard.cdf(-1.96), 0.024997895148220435, 1e-14);
  assertRelative(standard.cdf(-10), 7.619853024160474e-24, 1e-13);
  assertRelative(standard.pdf(0), 1 / Math.sqrt(2 * Math.PI), 1e-15);
  const n = normal({mean: 10, sd: 2});
  assert.equal(n.cdf(10), .5);
  assertRelative(n.pdf(12), standard.pdf(1) / 2, 1e-15);
});

test("normal quantile inverts the cdf", () => {
  const standard = normal();
  assertRelative(standard.quantile(.025), -1.9599639845400545, 1e-15);
  assertRelative(standard.quantile(.975), 1.959963984540054, 1e-15);
  assertRelative(standard.quantile(1e-10), -6.361340902404056, 1e-15);
  assert.equal(standard.quantile(.5), 0);
  assert.equal(standard.quantile(0), -Infinity);
  assert.equal(standard.quantile(1), Infinity);
  const n = normal({mean: 10, sd: 2});
  for (const p of [.001, .3, .5, .7, .999]) assert.inDelta(n.cdf(n.quantile(p)), p, 1e-15);
  for (const p of [-.1, 1.1, NaN]) assert.throws(() => standard.quantile(p), {name: "RangeError"});
});

test("normal samples have the right mean and standard deviation", () => {
  const n = normal({mean: 10, sd: 2}),
        random = seededRandom(7),
        samples = Array.from({length: 100000}, () => n.sample(random)),
        m = samples.reduce((a, b) => a + b) / samples.length,
        sd = Math.sqrt(samples.reduce((a, b) => a + (b - m) ** 2, 0) / (samples.length - 1));
  assert.inDelta(m, 10, .03);
  assert.inDelta(sd, 2, .03);
});

test("normal validates its parameters", () => {
  assert.throws(() => normal({sd: 0}), {name: "RangeError"});
  assert.throws(() => normal({sd: -1}), {name: "RangeError"});
  assert.throws(() => normal({mean: NaN}), {name: "TypeError"});
  assert.throws(() => normal().sample(5), {name: "TypeError"});
  assert.isTrue(Object.isFrozen(normal()));
});

test("erf, erfc and the normal cdf at extreme values", () => {
  assert.equal(erf(1e308), 1);
  assert.equal(erf(-1e308), -1);
  assert.equal(erfc(1.2e307), 0);
  assert.equal(erfc(-1.2e307), 2);
  assert.equal(normal().cdf(1e308), 1);
  assert.equal(normal().cdf(-1e308), 0);
});

test("normal quantile far into the tail", () => {
  assertRelative(normal().quantile(1e-300), -37.0470962993612, 1e-15);
  // Subnormal probabilities have only a few bits of precision.
  assertRelative(normal().quantile(1e-315), -37.967300351067365, 1e-8);
  assertRelative(normal().quantile(5e-324), -38.467405617144344, 1e-8);
});

test("normal sample rejects bad random sources instead of hanging", () => {
  assert.throws(() => normal().sample(() => .5), {name: "RangeError", message: "random does not appear to return uniform random numbers."});
  assert.throws(() => normal().sample(() => 1.5), {name: "RangeError"});
  assert.throws(() => normal().sample(5), {name: "TypeError"});
});
