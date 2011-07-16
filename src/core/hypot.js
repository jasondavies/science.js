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
