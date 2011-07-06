science.stats.mode = function(x) {
  x = x.slice().sort(science.ascending);
  var mode,
      n = x.length,
      i = -1,
      l = i,
      last = null,
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
