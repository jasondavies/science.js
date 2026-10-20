science.quadratic = function() {
  var complex = false;

  // Returns the roots of ax^2 + bx + c in ascending order (of the
  // imaginary part, for complex roots).
  function quadratic(a, b, c) {
    var roots;
    if (a === 0) {
      // Linear, or no roots (or infinitely many) if b is also 0.
      roots = b === 0 ? [] : [-c / b];
    } else {
      var d = b * b - 4 * a * c,
          rb = -b / (2 * a);
      if (d > 0) {
        // Avoid cancellation by computing the larger root first.
        var q = -(b + (b < 0 ? -1 : 1) * Math.sqrt(d)) / 2,
            r1 = q / a,
            r2 = c / q;
        roots = r1 < r2 ? [r1, r2] : [r2, r1];
      } else if (d === 0) {
        roots = [rb];
      } else {
        if (complex) {
          d = Math.sqrt(-d) / (2 * Math.abs(a));
          return [
            {r: rb, i: -d},
            {r: rb, i: d}
          ];
        }
        return [];
      }
    }
    return complex
        ? roots.map(function(r) { return {r: r, i: 0}; })
        : roots;
  }

  quadratic.complex = function(x) {
    if (!arguments.length) return complex;
    complex = x;
    return quadratic;
  };

  return quadratic;
};
