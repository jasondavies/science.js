(function(){science = {version: "1.5.0"}; // semver
science.functor = function(v) {
  return typeof v === "function" ? v : function() { return v; };
};
// Based on:
// http://www.johndcook.com/blog/2010/06/02/whats-so-hard-about-finding-a-hypotenuse/
science.hypot = function(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  var max,
      min;
  if (x > y) { max = x; min = y; }
  else       { max = y; min = x; }
  var r = min / max;
  return max * Math.sqrt(1 + r * r);
};
// Constructs a multi-dimensional array filled with zeroes.
science.zeroes = function(n) {
  var i = -1,
      a = [];
  if (arguments.length === 1)
    while (++i < n)
      a[i] = 0;
  else
    while (++i < n)
      a[i] = science.zeroes.apply(
        this, Array.prototype.slice.call(arguments, 1));
  return a;
};
})()