import test from "node:test";
import { cross, determinant, dot, eigen, inverse, multiply, norm, normalize, quadratic, solve, solveTridiagonal, transpose } from "../src/index.js";
import assert from "./assert.js";
import { seededRandom } from "./random.js";

function randomMatrix(n, random, symmetric = false) {
  const m = Array.from({length: n}, () => Array.from({length: n}, () => 2 * random() - 1));
  if (symmetric) for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) m[i][j] = m[j][i];
  return m;
}

test("vectors", () => {
  assert.equal(dot([1, 2, 3], [4, 5, 6]), 32);
  assert.deepEqual(cross([1, 0, 0], [0, 1, 0]), [0, 0, 1]);
  assert.equal(norm([3, 4]), 5);
  assert.equal(norm([]), 0);
  assert.equal(norm([1e200, 1e200]), Math.SQRT2 * 1e200);
  assert.equal(norm([3e-200, 4e-200]), 5e-200);
  assert.deepEqual(normalize([3, 4]), [.6, .8]);
});

test("vectors validate their input", () => {
  assert.throws(() => dot([1, 2], [1]), {name: "RangeError"});
  assert.throws(() => cross([1, 2], [3, 4]), {name: "RangeError"});
  assert.throws(() => normalize([0, 0]), {name: "RangeError"});
  assert.throws(() => norm([1, NaN]), {name: "TypeError"});
});

test("transpose and multiply", () => {
  assert.deepEqual(transpose([[1, 2, 3], [4, 5, 6]]), [[1, 4], [2, 5], [3, 6]]);
  assert.deepEqual(multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]]), [[19, 22], [43, 50]]);
  assert.deepEqual(multiply([[1, 2], [3, 4]], [5, 6]), [17, 39]);
  assert.throws(() => multiply([[1, 2]], [[1, 2]]), {name: "RangeError"});
  assert.throws(() => multiply([[1, 2]], [1, 2, 3]), {name: "RangeError"});
  assert.throws(() => transpose([[1, 2], [3]]), {name: "RangeError"});
});

test("determinant", () => {
  assert.equal(determinant([[3]]), 3);
  assert.equal(determinant([[1, 2], [3, 4]]), -2);
  assert.equal(determinant([[2, 0, 0, 0], [0, 3, 0, 0], [0, 0, 4, 0], [0, 0, 0, 5]]), 120);
  assert.equal(determinant([[1, 2], [2, 4]]), 0);
  assert.equal(determinant([[0, 1], [1, 0]]), -1);
  assert.inDelta(determinant([[6, 1, 1], [4, -2, 5], [2, 8, 7]]), -306, 1e-12);
  assert.throws(() => determinant([[1, 2]]), {name: "RangeError"});
});

test("solve and inverse", () => {
  assert.deepEqual(solve([[2, 1], [1, 3]], [5, 10]), [1, 3]);
  assert.inDelta(solve([[2, 1], [1, 3]], [[5, 1], [10, 2]]), [[1, .2], [3, .6]], 1e-15);
  assert.inDelta(inverse([[4, 7], [2, 6]]), [[.6, -.7], [-.2, .4]], 1e-15);
  assert.inDelta(inverse([[1e-11, 0], [0, 1e-11]]), [[1e11, 0], [0, 1e11]], 1e-4);
  assert.inDelta(inverse([[1e10, 0], [0, 1]]), [[1e-10, 0], [0, 1]], 1e-25);
  for (const singular of [[[1, 2], [2, 4]], [[1, 2], [3, 6.000000000000001]], [[0, 0], [0, 0]]]) {
    assert.throws(() => inverse(singular), {name: "RangeError", message: "Matrix is singular."});
  }
  assert.throws(() => solve([[1, 0], [0, 1]], [1]), {name: "RangeError"});
});

test("solve and inverse satisfy their equations for random matrices", () => {
  const random = seededRandom(3);
  for (let t = 0; t < 50; t++) {
    const n = 1 + Math.floor(random() * 8),
          a = randomMatrix(n, random),
          b = Array.from({length: n}, () => random()),
          identity = Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => +(i === j)));
    assert.inDelta(multiply(a, solve(a, b)), b, 1e-9);
    assert.inDelta(multiply(a, inverse(a)), identity, 1e-9);
  }
});

test("solve does not modify its inputs", () => {
  const a = [[2, 1], [1, 3]],
        b = [5, 10];
  solve(a, b);
  assert.deepEqual(a, [[2, 1], [1, 3]]);
  assert.deepEqual(b, [5, 10]);
});

test("solveTridiagonal", () => {
  assert.inDelta(solveTridiagonal([1, 1], [2, 2, 2], [1, 1], [3, 4, 3]), [1, 1, 1], 1e-15);
  assert.deepEqual(solveTridiagonal([], [4], [], [8]), [2]);
  const random = seededRandom(4),
        n = 31,
        lower = Array.from({length: n - 1}, () => random()),
        upper = Array.from({length: n - 1}, () => random()),
        diagonal = Array.from({length: n}, () => 2 + random()),
        rhs = Array.from({length: n}, () => random()),
        x = solveTridiagonal(lower, diagonal, upper, rhs);
  for (let i = 0; i < n; i++) {
    const row = (i > 0 ? lower[i - 1] * x[i - 1] : 0) + diagonal[i] * x[i] + (i < n - 1 ? upper[i] * x[i + 1] : 0);
    assert.inDelta(row, rhs[i], 1e-14);
  }
  assert.throws(() => solveTridiagonal([1], [1, 1], [1, 1], [1, 1]), {name: "RangeError"});
  assert.throws(() => solveTridiagonal([1], [0, 1], [1], [1, 1]), {name: "RangeError"});
});

test("eigen of a symmetric matrix", () => {
  const {values, imaginary, vectors} = eigen([[2, 0], [0, 1]]);
  assert.deepEqual(values, [1, 2]);
  assert.deepEqual(imaginary, [0, 0]);
  assert.deepEqual(vectors, [[0, 1], [1, 0]]);
});

test("eigen of a rotation has complex eigenvalues", () => {
  const {values, imaginary} = eigen([[0, -1], [1, 0]]);
  assert.deepEqual(values, [0, 0]);
  assert.deepEqual(imaginary.slice().sort(), [-1, 1]);
});

test("eigen satisfies A V = V D for random matrices", () => {
  const random = seededRandom(5);
  for (let t = 0; t < 50; t++) {
    const n = 1 + Math.floor(random() * 7),
          symmetric = t % 2 === 0,
          a = randomMatrix(n, random, symmetric),
          {values, imaginary, vectors} = eigen(a),
          // D is block diagonal, with a 2 × 2 block for each complex pair.
          d = Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => i === j ? values[i] : 0));
    for (let i = 0; i < n; i++) {
      if (imaginary[i] > 0) d[i][i + 1] = imaginary[i];
      else if (imaginary[i] < 0) d[i][i - 1] = imaginary[i];
    }
    assert.inDelta(multiply(a, vectors), multiply(vectors, d), 1e-9);
    if (symmetric) {
      for (let i = 1; i < n; i++) assert.isTrue(values[i - 1] <= values[i]);
      assert.inDelta(multiply(transpose(vectors), vectors), d.map((row, i) => row.map((_, j) => +(i === j))), 1e-9);
    }
  }
});

test("quadratic", () => {
  assert.deepEqual(quadratic(1, 1, -2), [-2, 1]);
  assert.deepEqual(quadratic(-1, -1, 2), [-2, 1]);
  assert.deepEqual(quadratic(1, -2, 1), [1]);
  assert.deepEqual(quadratic(1, 0, 1), []);
  assert.deepEqual(quadratic(0, 2, -4), [2]);
  assert.deepEqual(quadratic(0, 0, 1), []);
  const [big, small] = quadratic(1, 1e8, 1);
  assert.inDelta(big, -1e8, 1e-6);
  assert.inDelta(small / -1e-8, 1, 1e-12);
});

test("quadratic with complex roots", () => {
  assert.deepEqual(quadratic(1, 0, 1, {complex: true}), [{re: 0, im: -1}, {re: 0, im: 1}]);
  assert.deepEqual(quadratic(-1, 0, -1, {complex: true}), [{re: 0, im: -1}, {re: 0, im: 1}]);
  assert.deepEqual(quadratic(4, 4, 5, {complex: true}), [{re: -.5, im: -1}, {re: -.5, im: 1}]);
  assert.deepEqual(quadratic(1, 1, -2, {complex: true}), [{re: -2, im: 0}, {re: 1, im: 0}]);
  assert.throws(() => quadratic(1, NaN, 1), {name: "TypeError"});
});

test("eigen does not hang when the QR iteration stalls", () => {
  const {values, imaginary} = eigen([[-1, 1, 0], [-1, -1, 1], [0, -1, -1]]),
        roots = values.map((v, i) => [v, imaginary[i]]).sort((p, q) => p[1] - q[1]);
  assert.inDelta(roots, [[-1, -Math.SQRT2], [-1, 0], [-1, Math.SQRT2]], 1e-12);
});

test("eigen scales very large and small matrices", () => {
  const big = eigen([[1e300, 1e300], [-1e300, 1e300]]);
  assert.inDelta(big.values.map((v) => v / 1e300), [1, 1], 1e-15);
  assert.inDelta(big.imaginary.map((v) => Math.abs(v) / 1e300), [1, 1], 1e-15);
  assert.deepEqual(eigen([[1e-300, 0], [0, 2e-300]]).values, [1e-300, 2e-300]);
});

test("eigen normalises the eigenvectors of a defective matrix", () => {
  // The triple eigenvalue may come out as a complex pair with tiny imaginary
  // parts, whose two columns are normalised together.
  const {imaginary, vectors} = eigen([[-1, -1, 1], [-1, -1, 0], [-1, 0, -1]]);
  for (let j = 0; j < 3; j++) {
    const column = vectors.map((row) => row[j]);
    if (imaginary[j] > 0) {
      const next = ++j;
      column.push(...vectors.map((row) => row[next]));
    }
    assert.inDelta(norm(column), 1, 1e-15);
  }
});

test("quadratic handles coefficients of large or small magnitude", () => {
  const [big, small] = quadratic(1, 1e200, 1);
  assert.inDelta(big / -1e200, 1, 1e-15);
  assert.inDelta(small / -1e-200, 1, 1e-15);
  assert.inDelta(quadratic(1e200, 3e200, 1e200), [(-3 - Math.sqrt(5)) / 2, (-3 + Math.sqrt(5)) / 2], 1e-15);
  assert.inDelta(quadratic(1e-200, 3e-200, 1e-200), [(-3 - Math.sqrt(5)) / 2, (-3 + Math.sqrt(5)) / 2], 1e-15);
  assert.deepEqual(quadratic(1e-200, 1e-200, 1e-200), []);
});

test("quadratic and determinant return 0 rather than -0", () => {
  assert.deepEqual(quadratic(1, 1, 0), [-1, 0]);
  assert.deepEqual(quadratic(0, 2, 0), [0]);
  assert.equal(determinant([[1, 2], [2, 4]]), 0);
});
