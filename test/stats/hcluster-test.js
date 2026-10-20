import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.stats.hcluster simple", function() {
  var data = [],
      i;
  for (i = 0; i < 100; i++) {
    data.push([Math.random(), Math.random()]);
  }
  for (i = 0; i < 100; i++) {
    data.push([10 + Math.random(), 10 + Math.random()]);
  }
  var x = science.stats.hcluster()(data);
  assert.equal(x.left.size, 100);
  assert.equal(x.right.size, 100);
});

function mergeDistances(root) {
  var distances = [];
  (function walk(node) {
    if (!node.left) return;
    distances.push(node.dist);
    walk(node.left);
    walk(node.right);
  })(root);
  return distances.sort(function(a, b) { return a - b; });
}

// Expected distances are from https://github.com/jdfekete/reorder.js/pull/48.
test("science.stats.hcluster linkage distances", function() {
  var small = [[1], [2], [5]],
      large = [[1], [2], [5], [7], [50], [55]],
      hcluster = science.stats.hcluster().distance(science.stats.distance.manhattan);
  assert.equal(hcluster.linkage(), "single");
  assert.deepEqual(mergeDistances(hcluster.linkage("single")(small)), [1, 3]);
  assert.deepEqual(mergeDistances(hcluster.linkage("single")(large)), [1, 2, 3, 5, 43]);
  assert.deepEqual(mergeDistances(hcluster.linkage("complete")(small)), [1, 4]);
  assert.deepEqual(mergeDistances(hcluster.linkage("complete")(large)), [1, 2, 5, 6, 54]);
  assert.deepEqual(mergeDistances(hcluster.linkage("average")(small)), [1, 3.5]);
  assert.deepEqual(mergeDistances(hcluster.linkage("average")(large)), [1, 2, 4.5, 5, 48.75]);
});

test("science.stats.hcluster parents are never closer than their children", function() {
  var seed = 1,
      random = function() { return (seed = seed * 16807 % 2147483647) / 2147483647; },
      data = [],
      i;
  for (i = 0; i < 250; i++) data.push([random(), random(), random(), random()]);
  ["single", "complete", "average"].forEach(function(linkage) {
    (function walk(node) {
      if (!node.left) return;
      assert.isTrue(node.dist >= node.left.dist && node.dist >= node.right.dist, linkage);
      walk(node.left);
      walk(node.right);
    })(science.stats.hcluster().linkage(linkage)(data));
  });
});

test("science.stats.hcluster rejects an unknown linkage", function() {
  assert.throws(function() { science.stats.hcluster().linkage("ward")([[1], [2]]); }, {error: "Unknown linkage: ward"});
});
