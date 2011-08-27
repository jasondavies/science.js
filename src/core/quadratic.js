science.quadratic = function() {
  var complex = false;

  function quadratic(a, b, c) {
    var d = b * b - 4 * a * c;
    if (d > 0) {
      d = Math.sqrt(d) / (2 * a);
      return complex
        ? [{r: -b - d, i: 0}, {r: -b + d, i: 0}]
        : [-b - d, -b + d];
    } else if (d === 0) {
      d = -b / (2 * a);
      return complex ? [{r: d, i: 0}] : [d];
    } else {
      if (complex) {
        d = Math.sqrt(-d) / (2 * a);
        return [
          {r: -b, i: -d},
          {r: -b, i: d}
        ];
      }
      return [];
    }
  }

  quadratic.complex = function(x) {
    if (!arguments.length) return complex;
    complex = x;
    return quadratic;
  };

  return quadratic;
};
