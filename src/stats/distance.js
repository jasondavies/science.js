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
  }
};
