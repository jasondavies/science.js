science.quadratic = function() {
  var complex = false;

  function quadratic(a, b, c) {
    var d = b * b - 4 * a * c;
    var rb = -b / (2 * a);
    if (d > 0) {
      d = Math.sqrt(d) / (2 * a);
      return complex
        ? [{r: rb - d, i: 0}, {r: rb + d, i: 0}]
        : [rb - d, rb + d];
    } else if (d === 0) {
      return complex ? [{r: rb, i: 0}] : [rb];
    } else {
      if (complex) {
        d = Math.sqrt(-d) / (2 * a);
        return [
          {r: rb, i: -d},
          {r: rb, i: d}
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
