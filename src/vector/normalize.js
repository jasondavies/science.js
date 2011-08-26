science.vector.normalize = function(p) {
  var length = science.vector.length(p);
  return p.map(function(d) { return d / length; });
};
