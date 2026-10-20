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
      error = {error: "Values must be finite numbers."};
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
  assert.inDelta(science.stats.loess().bandwidth(1)(x, x), x, 1e-12);
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

test("science.stats.loess rejects x values that are not sorted", function() {
  var loess = science.stats.loess().bandwidth(.6),
      error = {error: "X values must be sorted in ascending order."};
  assert.throws(function() { loess([5, 1, 4, 2, 3], [5, 1, 4, 2, 3]); }, error);
  assert.throws(function() { loess([1, 2, 4, 3, 5], [1, 2, 3, 4, 5]); }, error);
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

test("science.stats.loess fits zero-weight points from their neighbours", function() {
  var loess = science.stats.loess().bandwidth(.6).robustnessIterations(0),
      res = loess([0, 1, 2, 3, 4], [100, -50, 4, 6, 8], [0, 0, 1, 1, 1]);
  assert.inDelta(res, [0, 2, 4, 6, 8], 1e-9);
});

test("science.stats.loess fits from the nearest weighted points after leading zero weights", function() {
  var xval = [],
      yval = [],
      weights = [],
      i = -1;
  while (++i < 30) {
    xval[i] = i;
    yval[i] = i >= 1 && i <= 8 ? 1000 : 2 * i + 1;
    weights[i] = i >= 1 && i <= 8 ? 0 : 1;
  }
  var res = science.stats.loess().bandwidth(.3).robustnessIterations(0)(xval, yval, weights);
  assert.inDelta(res, xval.map(function(x) { return 2 * x + 1; }), 1e-9);
});

test("science.stats.loess keeps the window centred after a gap in x", function() {
  var xval = [0, 1, 2, 3, 4, 5],
      yval = [1000, 1000, 1000, 1000, 1000, 1000],
      x = 99;
  while (++x < 114) xval.push(x), yval.push(x);
  var res = science.stats.loess().bandwidth(.25).robustnessIterations(0)(xval, yval);
  assert.inDelta(res.slice(6), xval.slice(6), 1e-9);
});

test("science.stats.loess keeps precision with large x values", function() {
  var xval = [],
      yval = [],
      i = -1;
  while (++i < 50) {
    xval[i] = 1.6e12 + i * 1000;
    yval[i] = i;
  }
  assert.inDelta(science.stats.loess()(xval, yval), yval, 1e-6);
});

test("science.stats.loess accepts tied x values", function() {
  var loess = science.stats.loess().robustnessIterations(0);
  assert.inDelta(
    loess.bandwidth(.5)([1, 1, 2, 2, 3, 3, 4, 4], [2, 2, 4, 4, 6, 6, 8, 8]),
    [2, 2, 4, 4, 6, 6, 8, 8],
    1e-9
  );
  assert.inDelta(
    loess.bandwidth(2 / 9)([1, 1, 1, 2, 2, 2, 3, 3, 3], [1, 2, 3, 4, 5, 6, 7, 8, 9]),
    [2, 2, 2, 5, 5, 5, 8, 8, 8],
    1e-9
  );
});

test("science.stats.loess rejects values that are not numbers", function() {
  var loess = science.stats.loess().bandwidth(.6),
      error = {error: "Values must be finite numbers."};
  assert.throws(function() { loess([1, 2, 3, 4, 5], [1, null, 3, 4, 5]); }, error);
  assert.throws(function() { loess(["1", "2", "3", "4", "5"], [1, 2, 3, 4, 5]); }, error);
  assert.throws(function() { loess([1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [1, true, 1, 1, 1]); }, error);
});

test("science.stats.loess rejects negative or all-zero weights", function() {
  var loess = science.stats.loess().bandwidth(.6),
      x = [1, 2, 3, 4, 5];
  assert.throws(function() { loess(x, x, [1, -.5, 1, 1, 1]); }, {error: "Weights must be non-negative."});
  assert.throws(function() { loess(x, x, [0, 0, 0, 0, 0]); }, {error: "At least one weight must be positive."});
});

test("science.stats.loess treats undefined weights as all 1", function() {
  var loess = science.stats.loess().bandwidth(.6),
      x = [1, 2, 3, 4, 5],
      y = [2, 1, 4, 3, 5];
  assert.deepEqual(loess(x, y, undefined), loess(x, y));
});

test("science.stats.loess validates accuracy", function() {
  var x = [0, 1, 2, 3, 4],
      error = {error: "Accuracy must be a non-negative number."};
  [-1, NaN].forEach(function(accuracy) {
    assert.throws(function() { science.stats.loess().bandwidth(.6).accuracy(accuracy)(x, x); }, error);
  });
  var res = science.stats.loess().bandwidth(.4).accuracy(0).robustnessIterations(0)(x, [0, 2, 4, 6, 8], [1, 0, 0, 0, 1]);
  assert.isTrue(res.every(isFinite));
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
    weights[Math.floor(random() * n)] = 1;
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
