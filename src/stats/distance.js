science.stats.distance = {
  euclidean: function(a, b) {
    var n = a.length,
        i = -1,
        s = 0,
        x;
    while (++i < n) {
      x = a[i] - b[i];
      s += x * x;
    }
    return Math.sqrt(s);
  },
  manhattan: function(a, b) {
    var n = a.length,
        i = -1,
        s = 0;
    while (++i < n) s += Math.abs(a[i] - b[i]);
    return s;
  },
  minkowski: function(p) {
    return function(a, b) {
      var n = a.length,
          i = -1,
          s = 0;
      while (++i < n) s += Math.pow(Math.abs(a[i] - b[i]), p);
      return Math.pow(s, 1 / p);
    };
  },
  chebyshev: function(a, b) {
    var n = a.length,
        i = -1,
        max = 0,
        x;
    while (++i < n) {
      x = Math.abs(a[i] - b[i]);
      if (x > max) max = x;
    }
    return max;
  },
  hamming: function(a, b) {
    var n = a.length,
        i = -1,
        d = 0;
    while (++i < n) if (a[i] !== b[i]) d++;
    return d;
  },
  jaccard: function(a, b) {
    var n = a.length,
        i = -1,
        s = 0;
    while (++i < n) if (a[i] === b[i]) s++;
    return s / n;
  }
};
