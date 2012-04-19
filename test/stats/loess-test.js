require("../../science.v1");
require("../../science.v1");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.stats.loess");

var loess = science.stats.loess();

suite.addBatch({
  "loess": {
    "one point": function() {
      var res = loess([.5], [.7]);
      assert.deepEqual([.7], res);
    },
    "two points": function() {
      var res = loess([.5, .6], [.7, .8]);
      assert.deepEqual([.7, .8], res);
    },
    "straight line": function() {
      var loess = science.stats.loess().bandwidth(.6),
          y = [2, 4, 6, 8, 10],
          res = loess([1, 2, 3, 4, 5], y);
      assert.deepEqual(y, res);
    },
    "distorted sine": function() {
      var numPoints = 100;
      var xval = [];
      var yval = [];
      var xnoise = .1;
      var ynoise = .2;

      generateSineData(numPoints, xval, yval, xnoise, ynoise);

      var loess = science.stats.loess().robustnessIterations(4);
      var res = loess(xval, yval);

      // Check that the resulting curve differs from
      // the "real" sine less than the jittered one

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
    },
    "increasing bandwidth increases smoothness": function() {
      var numPoints = 100,
          xval = [],
          yval = [],
          xnoise = .1,
          ynoise = .2;

      generateSineData(numPoints, xval, yval, xnoise, ynoise);

      // Check that variance decreases as bandwidth increases
      var loess = science.stats.loess().robustnessIterations(4);
      var bandwidths = [.1, .5, 1];
      var variances = [0, 0, 0];
      for (var i = 0; i < bandwidths.length; i++) {
        var res = loess.bandwidth(bandwidths[i])(xval, yval);
        for (var j = 1; j < res.length; ++j) {
          variances[i] += Math.pow(res[j] - res[j - 1], 2);
        }
      }

      for (var i = 1; i < variances.length; ++i) {
        assert.isTrue(variances[i] < variances[i - 1]);
      }
    },
    "increasing robustness iterations increases smoothness with outliers": function() {
      var numPoints = 100,
          xval = [],
          yval = [],
          xnoise = .1,
          ynoise = .1;

      generateSineData(numPoints, xval, yval, xnoise, ynoise);

      // Introduce a couple of outliers
      yval[Math.floor(numPoints / 3)] *= 100;
      yval[Math.floor(2 * numPoints / 3)] *= -100;

      // Check that variance decreases as the number of robustness
      // iterations increases

      var variances = [0, 0, 0, 0];
      var loess = science.stats.loess();
      for (var i = 0; i < 4; i++) {
        var res = loess.robustnessIterations(i)(xval, yval);

        for (var j = 1; j < res.length; ++j) {
          variances[i] += Math.abs(res[j] - res[j - 1]);
        }
      }

      for (var i = 1; i < variances.length; ++i) {
        assert.isTrue(variances[i] < variances[i - 1]);
      }
    },
    "math 296 without weights": function() {
      var xval = [
        0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
        1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0
      ];
      var yval = [
        0.47, 0.48, 0.55, 0.56, -0.08, -0.04, -0.07, -0.07,
        -0.56, -0.46, -0.56, -0.52, -3.03, -3.08, -3.09,
        -3.04, 3.54, 3.46, 3.36, 3.35
      ];

      // Output from R, rounded to .001
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
    }
  }
});

suite.export(module);

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
