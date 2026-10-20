import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.stats.loess configuration getters", function() {
  var configured = science.stats.loess()
    .bandwidth(.6)
    .robustnessIterations(4)
    .accuracy(1e-9);
  assert.equal(configured.bandwidth(), .6);
  assert.equal(configured.robustnessIterations(), 4);
  assert.equal(configured.accuracy(), 1e-9);
});

test("science.stats.loess one point", function() {
  var loess = science.stats.loess();
  var res = loess([.5], [.7]);
  assert.deepEqual([.7], res);
});

test("science.stats.loess two points", function() {
  var loess = science.stats.loess();
  var res = loess([.5, .6], [.7, .8]);
  assert.deepEqual([.7, .8], res);
});

test("science.stats.loess rejects non-finite values", function() {
  var loess = science.stats.loess().bandwidth(.6),
      error = {error: "Values must be finite."};
  assert.throws(function() { loess([1, 2, NaN, 4, 5], [1, 2, 3, 4, 5]); }, error);
  assert.throws(function() { loess([1, 2, 3, 4, 5], [1, Infinity, 3, 4, 5]); }, error);
  assert.throws(function() { loess([1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [1, 1, NaN, 1, 1]); }, error);
});

test("science.stats.loess rejects weights of the wrong length", function() {
  var loess = science.stats.loess().bandwidth(.6),
      error = {error: "Mismatched array lengths"};
  assert.throws(function() { loess([1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [1, 1, 1]); }, error);
  assert.throws(function() { loess([1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [1, 1, 1, 1, 1, 1]); }, error);
});

test("science.stats.loess rejects bandwidth outside (0, 1]", function() {
  var x = [1, 2, 3, 4, 5],
      error = {error: "Bandwidth must be greater than 0 and at most 1."};
  [0, -.5, 1.5, NaN].forEach(function(bandwidth) {
    var loess = science.stats.loess().bandwidth(bandwidth);
    assert.throws(function() { loess(x, x); }, error);
    assert.throws(function() { loess([1], [1]); }, error);
  });
  assert.deepEqual(science.stats.loess().bandwidth(1)(x, x), x);
});

test("science.stats.loess rejects invalid robustness iterations", function() {
  var x = [1, 2, 3, 4, 5],
      error = {error: "Robustness iterations must be a non-negative integer."};
  [-1, 1.5, NaN].forEach(function(iterations) {
    var loess = science.stats.loess().bandwidth(.6).robustnessIterations(iterations);
    assert.throws(function() { loess(x, x); }, error);
  });
  assert.deepEqual(science.stats.loess().bandwidth(.6).robustnessIterations(0)(x, x), x);
});

test("science.stats.loess rejects x values that are not strictly increasing", function() {
  var loess = science.stats.loess().bandwidth(.6),
      error = {error: "X values must be strictly increasing."};
  assert.throws(function() { loess([5, 1, 4, 2, 3], [5, 1, 4, 2, 3]); }, error);
  assert.throws(function() { loess([1, 1, 2, 3, 4], [1, 2, 3, 4, 5]); }, error);
});

test("science.stats.loess straight line", function() {
  var loess = science.stats.loess().bandwidth(.6),
      y = [2, 4, 6, 8, 10],
      res = loess([1, 2, 3, 4, 5], y);
  assert.deepEqual(y, res);
});

test("science.stats.loess falls back to y when robustness weights empty a window", function() {
  var loess = science.stats.loess().bandwidth(4 / 7),
      res = loess([0, 1, 2, 3, 4, 5, 6], [0, 2, 5, 0, 4, 2, 0]);
  assert.inDelta(res, [0, 2, 2, 0, 2, 2, 0], 1e-9);
});

test("science.stats.loess falls back to y when weights empty a window", function() {
  var loess = science.stats.loess().bandwidth(.4).robustnessIterations(0),
      res = loess([0, 1, 2, 3, 4], [0, 2, 4, 6, 8], [0, 0, 1, 1, 1]);
  assert.inDelta(res, [0, 2, 4, 6, 8], 1e-9);
});

test("science.stats.loess never returns NaN for valid input", function() {
  var seed = 42,
      random = function() { return (seed = seed * 16807 % 2147483647) / 2147483647; },
      t = -1;
  while (++t < 2000) {
    var n = 3 + Math.floor(random() * 30),
        xval = [],
        yval = [],
        weights = [],
        x = random(),
        i = -1;
    while (++i < n) {
      xval[i] = x;
      yval[i] = random() < .1 ? random() * 100 : random();
      weights[i] = random() < .3 ? 0 : random();
      x += 1e-9 + random() * (random() < .2 ? 1e-6 : 1);
    }
    var loess = science.stats.loess()
          .bandwidth(Math.min(1, (2 + Math.floor(random() * n)) / n))
          .robustnessIterations(Math.floor(random() * 4)),
        res = random() < .5 ? loess(xval, yval) : loess(xval, yval, weights);
    assert.isTrue(res.every(isFinite), "non-finite result for input " + t);
  }
});

test("science.stats.loess distorted sine", function() {
  var numPoints = 100;
  var xval = [];
  var yval = [];
  var xnoise = .1;
  var ynoise = .2;

  generateSineData(numPoints, xval, yval, xnoise, ynoise);

  var loess = science.stats.loess().robustnessIterations(4);
  var res = loess(xval, yval);

  var noisyResidualSum = 0,
      fitResidualSum = 0,
      i = -1;
  while (++i < numPoints) {
    var expected = Math.sin(xval[i]),
        noisy = yval[i],
        fit = res[i];

    noisyResidualSum += Math.pow(noisy - expected, 2);
    fitResidualSum += Math.pow(fit - expected, 2);
  }

  assert.isTrue(fitResidualSum < noisyResidualSum);
});

test("science.stats.loess increasing bandwidth increases smoothness", function() {
  var numPoints = 100,
      xval = [],
      yval = [],
      xnoise = .1,
      ynoise = .2;

  generateSineData(numPoints, xval, yval, xnoise, ynoise);

  var loess = science.stats.loess().robustnessIterations(4);
  var bandwidths = [.1, .5, 1];
  var variances = [0, 0, 0];
  for (var i = 0; i < bandwidths.length; i++) {
    var res = loess.bandwidth(bandwidths[i])(xval, yval);
    for (var j = 1; j < res.length; ++j) {
      variances[i] += Math.pow(res[j] - res[j - 1], 2);
    }
  }

  for (var k = 1; k < variances.length; ++k) {
    assert.isTrue(variances[k] < variances[k - 1]);
  }
});

test("science.stats.loess increasing robustness iterations increases smoothness with outliers", function() {
  var numPoints = 100,
      xval = [],
      yval = [],
      xnoise = .1,
      ynoise = .1;

  generateSineData(numPoints, xval, yval, xnoise, ynoise);

  yval[Math.floor(numPoints / 3)] *= 100;
  yval[Math.floor(2 * numPoints / 3)] *= -100;

  var variances = [0, 0, 0, 0];
  var loess = science.stats.loess();
  for (var i = 0; i < 4; i++) {
    var res = loess.robustnessIterations(i)(xval, yval);

    for (var j = 1; j < res.length; ++j) {
      variances[i] += Math.abs(res[j] - res[j - 1]);
    }
  }

  for (var k = 1; k < variances.length; ++k) {
    assert.isTrue(variances[k] < variances[k - 1]);
  }
});

test("science.stats.loess math 296 without weights", function() {
  var xval = [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
    1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0
  ];
  var yval = [
    0.47, 0.48, 0.55, 0.56, -0.08, -0.04, -0.07, -0.07,
    -0.56, -0.46, -0.56, -0.52, -3.03, -3.08, -3.09,
    -3.04, 3.54, 3.46, 3.36, 3.35
  ];

  var yref = [
    0.461, 0.499, 0.541, 0.308, 0.175, -0.042, -0.072,
    -0.196, -0.311, -0.446, -0.557, -1.497, -2.133,
    -3.08, -3.09, -0.621, 0.982, 3.449, 3.389, 3.336
  ];
  var loess = science.stats.loess().robustnessIterations(3);
  var res = loess(xval, yval);
  assert.equal(xval.length, res.length);
  for (var i = 0; i < res.length; ++i) {
    assert.isTrue(Math.abs(yref[i] - res[i]) < .02);
  }
});

function generateSineData(n, xval, yval, xnoise, ynoise) {
  var dx = 2 * Math.PI / n,
      x = 0,
      i = -1;
  while (++i < n) {
    xval[i] = x;
    yval[i] = Math.sin(x) + (2 * Math.random() - 1) * ynoise;
    x += dx * (1 + (2 * Math.random() - 1) * xnoise);
  }
}
