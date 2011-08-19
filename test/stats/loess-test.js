require("../../science");
require("../../science.stats");

var rnd = [ 0.6939094110857695,
  0.6404423511121422,
  0.8878446461167186,
  0.6462079978082329,
  0.6637521795928478,
  0.24493950745090842,
  0.34250394022092223,
  0.9755479225423187,
  0.9374189365189523,
  0.6031865722034127,
  0.4876941950060427,
  0.6098125972785056,
  0.054338038666173816,
  0.11183926812373102,
  0.3354800436645746,
  0.4134549929294735,
  0.1017211398575455,
  0.538322759559378,
  0.017941900994628668,
  0.12372139329090714,
  0.7505403922405094,
  0.5633547634351999,
  0.0756064688321203,
  0.8799725740682334,
  0.2508433796465397,
  0.7720114327967167,
  0.32683586818166077,
  0.9399276652839035,
  0.31411432521417737,
  0.5734551984351128,
  0.7009459554683417,
  0.4849966967012733,
  0.8188675534911454,
  0.8166951918974519,
  0.33841507649049163,
  0.11869120015762746,
  0.777605889365077,
  0.2777763591147959,
  0.35460630315355957,
  0.32708863937295973,
  0.2942127166315913,
  0.6385190833825618,
  0.021380239631980658,
  0.6673290475737303,
  0.45648552291095257,
  0.05704299663193524,
  0.8714434707071632,
  0.9072632407769561,
  0.8785695717670023,
  0.82259655254893,
  0.6796266995370388,
  0.5748023404739797,
  0.1122367603238672,
  0.29573980369605124,
  0.9275350021198392,
  0.6814926667138934,
  0.45445852470584214,
  0.03944953461177647,
  0.460483989212662,
  0.49762112693861127,
  0.759811864932999,
  0.7484003549907357,
  0.9478790136054158,
  0.44914283021353185,
  0.8821582859382033,
  0.6922903275117278,
  0.24910925677977502,
  0.3584934144746512,
  0.15697992639616132,
  0.1212864457629621,
  0.5726316482760012,
  0.13065251475200057,
  0.1658324128948152,
  0.1720187719911337,
  0.21734452084638178,
  0.6042870571836829,
  0.6968479482457042,
  0.7589083178900182,
  0.014651404926553369,
  0.9661993009503931,
  0.9578495547175407,
  0.9307146456558257,
  0.952354334294796,
  0.8339324509724975,
  0.8491679783910513,
  0.3204401859547943,
  0.6246638908050954,
  0.8314075195230544,
  0.5874556733760983,
  0.8385522300377488,
  0.5662870837841183,
  0.43287460319697857,
  0.7698894322384149,
  0.019310907926410437,
  0.0235570278018713,
  0.4205535822547972,
  0.23326894780620933,
  0.667146461782977,
  0.8067880922462791,
  0.15052578458562493 ];

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("science.loess");

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
      yval[numPoints / 3] *= 100;
      yval[2 * numPoints / 3] *= -100;

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

      for (var i = 2; i < variances.length; ++i) {
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

/*

    @Test

    @Test(expected=MathException.class)
    public void testUnequalSizeArguments() throws MathException {
        new LoessInterpolator().smooth(new double[] {1,2,3}, new double[] {1,2,3,4});
    }

    @Test(expected=MathException.class)
    public void testEmptyData() throws MathException {
        new LoessInterpolator().smooth(new double[] {}, new double[] {});
    }

    @Test(expected=MathException.class)
    public void testNonStrictlyIncreasing1() throws MathException {
        new LoessInterpolator().smooth(new double[] {4,3,1,2}, new double[] {3,4,5,6});
    }

    @Test(expected=MathException.class)
    public void testNonStrictlyIncreasing2() throws MathException {
        new LoessInterpolator().smooth(new double[] {1,2,2,3}, new double[] {3,4,5,6});
    }

    @Test(expected=MathException.class)
    public void testNotAllFiniteReal1() throws MathException {
        new LoessInterpolator().smooth(new double[] {1,2,Double.NaN}, new double[] {3,4,5});
    }

    @Test(expected=MathException.class)
    public void testNotAllFiniteReal2() throws MathException {
        new LoessInterpolator().smooth(new double[] {1,2,Double.POSITIVE_INFINITY}, new double[] {3,4,5});
    }

    @Test(expected=MathException.class)
    public void testNotAllFiniteReal3() throws MathException {
        new LoessInterpolator().smooth(new double[] {1,2,Double.NEGATIVE_INFINITY}, new double[] {3,4,5});
    }

    @Test(expected=MathException.class)
    public void testNotAllFiniteReal4() throws MathException {
        new LoessInterpolator().smooth(new double[] {3,4,5}, new double[] {1,2,Double.NaN});
    }

    @Test(expected=MathException.class)
    public void testNotAllFiniteReal5() throws MathException {
        new LoessInterpolator().smooth(new double[] {3,4,5}, new double[] {1,2,Double.POSITIVE_INFINITY});
    }

    @Test(expected=MathException.class)
    public void testNotAllFiniteReal6() throws MathException {
        new LoessInterpolator().smooth(new double[] {3,4,5}, new double[] {1,2,Double.NEGATIVE_INFINITY});
    }

    @Test(expected=MathException.class)
    public void testInsufficientBandwidth() throws MathException {
        LoessInterpolator li = new LoessInterpolator(0.1, 3, 1e-12);
        li.smooth(new double[] {1,2,3,4,5,6,7,8,9,10,11,12}, new double[] {1,2,3,4,5,6,7,8,9,10,11,12});
    }

    @Test(expected=MathException.class)
    public void testCompletelyIncorrectBandwidth1() throws MathException {
        new LoessInterpolator(-0.2, 3, 1e-12);
    }

    @Test(expected=MathException.class)
    public void testCompletelyIncorrectBandwidth2() throws MathException {
        new LoessInterpolator(1.1, 3, 1e-12);
    }

    @Test

*/

suite.export(module);

function generateSineData(n, xval, yval, xnoise, ynoise) {
  var dx = 2 * Math.PI / n,
      x = 0,
      i = -1;
  while (++i < n) {
    xval[i] = x;
    yval[i] = Math.sin(x) + (2 * rnd[i] - 1) * ynoise;
    x += dx * (1 + (2 * rnd[i] - 1) * xnoise);
  }
}
