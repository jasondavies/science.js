science.stats.median = function(x) {
  return science.stats.quantiles(x, [.5])[0];
};
