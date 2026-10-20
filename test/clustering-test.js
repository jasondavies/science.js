import test from "node:test";
import { distances, hcluster, kmeans } from "../src/index.js";
import assert from "./assert.js";
import { seededRandom } from "./random.js";

test("distances", () => {
  const {euclidean, manhattan, chebyshev, minkowski, hamming, jaccard, braycurtis} = distances;
  assert.equal(euclidean([], []), 0);
  assert.equal(euclidean([0, 0], [3, 4]), 5);
  assert.equal(manhattan([0, 0], [3, 4]), 7);
  assert.equal(chebyshev([3, 2, 1], [1, 2, 3]), 2);
  assert.equal(minkowski(1)([0, 0], [3, 4]), 7);
  assert.equal(minkowski(2)([0, 0], [3, 4]), 5);
  assert.inDelta(minkowski(3)([0, 0], [3, 4]), Math.cbrt(91), 1e-15);
  assert.equal(minkowski(Infinity), chebyshev);
  assert.equal(hamming([3, 2, 1], [1, 2, 3]), 2);
  assert.equal(braycurtis([0, 1], [1, 1]), 1 / 3);
  assert.isTrue(Number.isNaN(braycurtis([0], [0])));
});

test("jaccard is the distance between sets of truthy positions", () => {
  assert.equal(distances.jaccard([1, 0, 1], [1, 1, 0]), 2 / 3);
  assert.equal(distances.jaccard([1, 1], [1, 1]), 0);
  assert.equal(distances.jaccard([1, 0], [0, 1]), 1);
  assert.equal(distances.jaccard([0, 0], [0, 0]), 0);
  assert.equal(distances.jaccard([true, false], [true, true]), .5);
});

test("distances reject arrays of different lengths", () => {
  for (const [name, f] of Object.entries(distances)) {
    if (name !== "minkowski") assert.throws(() => f([1, 2], [1]), {name: "RangeError"}, name);
  }
  assert.throws(() => distances.minkowski(0), {name: "RangeError"});
});

function twoBlobs(random) {
  const vectors = [];
  for (let i = 0; i < 100; i++) vectors.push([random(), random()]);
  for (let i = 0; i < 100; i++) vectors.push([10 + random(), 10 + random()]);
  return vectors;
}

test("kmeans separates two clusters", () => {
  const {assignments, centroids, iterations} = kmeans(twoBlobs(seededRandom(1)), {k: 2, random: seededRandom(2)});
  for (let i = 0; i < 200; i++) assert.equal(assignments[i], assignments[i < 100 ? 0 : 100]);
  assert.notEqual(assignments[0], assignments[100]);
  const low = centroids[assignments[0]];
  assert.inDelta(low, [.5, .5], .15);
  assert.isTrue(iterations >= 1);
});

test("kmeans is reproducible with a seeded random source", () => {
  const vectors = twoBlobs(seededRandom(3)).concat(twoBlobs(seededRandom(4)).map(([x, y]) => [x + 20, y]));
  assert.deepEqual(kmeans(vectors, {k: 3, random: seededRandom(5)}), kmeans(vectors, {k: 3, random: seededRandom(5)}));
});

test("kmeans validates its input", () => {
  assert.throws(() => kmeans([[1], [1], [1]], {k: 2}), {name: "RangeError", message: "There are fewer distinct vectors than clusters."});
  assert.throws(() => kmeans([[1], [2]], {}), {name: "RangeError"});
  assert.throws(() => kmeans([[1], [2]], {k: 1.5}), {name: "RangeError"});
  assert.throws(() => kmeans([[1], [2, 3]], {k: 1}), {name: "RangeError"});
  assert.throws(() => kmeans([], {k: 1}), {name: "RangeError"});
});

function heights(root) {
  const result = [];
  (function walk(node) {
    if (!node.left) return;
    result.push(node.height);
    walk(node.left);
    walk(node.right);
  })(root);
  return result.sort((a, b) => a - b);
}

// Expected heights are from https://github.com/jdfekete/reorder.js/pull/48.
test("hcluster linkage heights", () => {
  const small = [[1], [2], [5]],
        large = [[1], [2], [5], [7], [50], [55]],
        distance = distances.manhattan;
  assert.deepEqual(heights(hcluster(small, {distance})), [1, 3]);
  assert.deepEqual(heights(hcluster(large, {distance})), [1, 2, 3, 5, 43]);
  assert.deepEqual(heights(hcluster(small, {distance, linkage: "complete"})), [1, 4]);
  assert.deepEqual(heights(hcluster(large, {distance, linkage: "complete"})), [1, 2, 5, 6, 54]);
  assert.deepEqual(heights(hcluster(small, {distance, linkage: "average"})), [1, 3.5]);
  assert.deepEqual(heights(hcluster(large, {distance, linkage: "average"})), [1, 2, 4.5, 5, 48.75]);
});

test("hcluster parents are never closer than their children", () => {
  const random = seededRandom(1),
        vectors = Array.from({length: 250}, () => [random(), random(), random(), random()]);
  for (const linkage of ["single", "complete", "average"]) {
    (function walk(node) {
      if (!node.left) return;
      assert.isTrue(node.height >= node.left.height && node.height >= node.right.height, linkage);
      walk(node.left);
      walk(node.right);
    })(hcluster(vectors, {linkage}));
  }
});

test("hcluster nodes", () => {
  const root = hcluster([[1], [2], [5]]);
  assert.equal(root.size, 3);
  assert.equal(root.depth, 2);
  assert.equal(root.index, 4);
  assert.inDelta(root.centroid, [8 / 3], 1e-15);
  assert.equal(root.left.index, 3);
  assert.deepEqual([root.left.left.index, root.left.right.index].sort(), [0, 1]);
  assert.equal(root.right.index, 2);
  assert.deepEqual(hcluster([[7, 8]]), {left: null, right: null, height: 0, size: 1, depth: 0, index: 0, centroid: [7, 8]});
});

test("hcluster validates its input", () => {
  assert.throws(() => hcluster([[1], [2]], {linkage: "ward"}), {name: "RangeError", message: "Unknown linkage: ward"});
  assert.throws(() => hcluster([]), {name: "RangeError"});
  assert.throws(() => hcluster([[1], [2]], {distance: null}), {name: "TypeError"});
});
