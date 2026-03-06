science.stats.mode = function(x) {
  var counts = Object.create(null),
      mode = [],
      max = 0,
      n = x.length,
      i = -1,
      d,
      k;
  while (++i < n) {
    d = x[i];
    k = Object.prototype.hasOwnProperty.call(counts, d) ? ++counts[d] : counts[d] = 1;
    if (k === max) mode.push(d);
    else if (k > max) {
      max = k;
      mode = [d];
    }
  }
  if (mode.length === 1) return mode[0];
};
