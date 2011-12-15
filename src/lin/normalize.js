science.lin.normalize = function(p) {
  var length = science.lin.length(p);
  return p.map(function(d) { return d / length; });
};
