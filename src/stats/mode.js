science.stats.mode = function(x) {
  if ((n = x.length) === 1) return x[0];
  x = x.slice().sort(science.ascending);
  var mode,
      n,
      i = -1,
      l = i,
      last,
      max = 0,
      tmp,
      v;
  while (++i < n) {
    if ((v = x[i]) !== last) {
      if ((tmp = i - l) > max) {
        max = tmp;
        mode = last;
      }
      last = v;
      l = i;
    }
  }
  return mode;
};
