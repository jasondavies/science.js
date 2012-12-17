science.stats.mode = function(x) {
  var counts = {},
      mode = [],
      max = 0,
      n = x.length,
      i = -1,
      d,
      k;
  while (++i < n) {
    k = counts.hasOwnProperty(d = x[i]) ? ++counts[d] : counts[d] = 1;
    if (k === max) mode.push(d);
    else if (k > max) {
      max = k;
      mode = [d];
    }
  }
  if (mode.length === 1) return mode[0];
};
