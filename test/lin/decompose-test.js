require("../../science.v1");

const test = require("node:test");
const assert = require("../assert");

test("science.lin.decompose symmetric matrix", function() {
  var A = [[1, 1, 1], [1, 2, 3], [1, 3, 6]];
  var decompose = science.lin.decompose();
  var result = decompose(A);
  assert.inDelta(
    science.lin.multiply(A, result.V),
    science.lin.multiply(result.V, result.D),
    1e-6
  );
});
