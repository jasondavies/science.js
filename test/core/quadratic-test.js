require("../../science.v1");

const test = require("node:test");
const assert = require("../assert");

test("science.quadratic real roots", function() {
  var quadratic = science.quadratic();
  assert.deepEqual(quadratic(1, 1, 1), []);
  assert.deepEqual(quadratic(1, -2, 1), [1]);
  assert.deepEqual(quadratic(1, 1, -2), [-2, 1]);
  assert.deepEqual(quadratic(2, 2, -4), [-2, 1]);
});

test("science.quadratic complex roots", function() {
  var quadratic = science.quadratic().complex(true);
  assert.deepEqual(quadratic(1, 0, 1), [{r: 0, i: -1}, {r: 0, i: 1}]);
  assert.deepEqual(quadratic(4, 4, 5), [{r: -0.5, i: -1}, {r: -0.5, i: 1}]);
});
