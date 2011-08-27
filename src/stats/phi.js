science.stats.phi = function(x) {
  return .5 * (1 + science.stats.erf(x / Math.SQRT2));
};
