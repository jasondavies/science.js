function variance_by_y(x, y) {
  var n = x.length;
  if (n < 1) return NaN;
  if (n === 1) return 0;
  var mean = science.stats.mean(x),
      i = -1,
      s = 0;
  while (++i < n) {
    var v = x[i] - mean;
    s += v * v;
  }
  return s / (n + y);
}
// Unbiased estimate of a sample's variance.
// Also known as the sample variance, where the denominator is n - 1.
science.stats.variance = function(x) {
  return variance_by_y(x, -1);
};

science.stats.population_variance = function(x) {
  return variance_by_y(x, 0);
}
