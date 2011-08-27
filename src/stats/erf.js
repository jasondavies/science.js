// Based on implementation in http://picomath.org/.
science.stats.erf = function(x) {
  var a1 =  0.254829592,
      a2 = -0.284496736,
      a3 =  1.421413741,
      a4 = -1.453152027,
      a5 =  1.061405429,
      p  =  0.3275911;

  // Save the sign of x
  var sign = x < 0 ? -1 : 1;
  if (x < 0) {
    sign = -1;
    x = -x;
  }

  // A&S formula 7.1.26
  var t = 1 / (1 + p * x);
  return sign * (
    1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1)
    * t * Math.exp(-x * x));
};
