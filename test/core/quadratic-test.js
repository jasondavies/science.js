import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

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

test("science.quadratic returns roots in ascending order for negative a", function() {
  var quadratic = science.quadratic();
  assert.deepEqual(quadratic(-1, -1, 2), [-2, 1]);
  assert.deepEqual(science.quadratic().complex(true)(-1, 0, -1), [{r: 0, i: -1}, {r: 0, i: 1}]);
});

test("science.quadratic linear equations", function() {
  var quadratic = science.quadratic();
  assert.deepEqual(quadratic(0, 2, -4), [2]);
  assert.deepEqual(quadratic(0, 0, 1), []);
  assert.deepEqual(science.quadratic().complex(true)(0, 2, -4), [{r: 2, i: 0}]);
});

test("science.quadratic avoids cancellation", function() {
  var roots = science.quadratic()(1, 1e8, 1);
  assert.inDelta(roots[0], -1e8, 1e-6);
  assert.inDelta(roots[1] / -1e-8, 1, 1e-12);
});
