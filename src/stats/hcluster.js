import { distances } from "./distances.js";
import { checkOptions, finiteDistance, requireMatrix, requireFunction } from "../validate.js";

// Agglomerative hierarchical clustering. Returns the root of the binary tree
// of merged clusters.
export function hcluster(vectors, options) {
  const {linkage = "single", distance = distances.euclidean} = checkOptions(options, ["linkage", "distance"], "hcluster");
  if (linkage !== "single" && linkage !== "complete" && linkage !== "average") {
    throw new RangeError(`Unknown linkage: ${linkage}`);
  }
  requireFunction(distance, "distance");
  const n = requireMatrix(vectors, "vectors")[0];

  // Leaves are numbered 0 to n - 1 in input order, and merged clusters n, n + 1,
  // ... in the order they are created.
  const clusters = [],
        distMatrix = [],
        dMin = [];
  for (let i = 0; i < n; i++) {
    clusters[i] = {left: null, right: null, height: 0, size: 1, depth: 0, index: i, centroid: Array.from(vectors[i])};
  }
  if (n === 1) return clusters[0];

  // The distance matrix (computing each distance once, as distances are
  // symmetric), and the closest cluster to each cluster.
  for (let i = 0; i < n; i++) {
    distMatrix[i] = new Array(n);
    distMatrix[i][i] = Infinity;
    for (let j = 0; j < i; j++) distMatrix[i][j] = distMatrix[j][i] = finiteDistance(distance, vectors[i], vectors[j]);
  }
  for (let i = 0; i < n; i++) {
    dMin[i] = 0;
    for (let j = 0; j < n; j++) if (distMatrix[i][dMin[i]] > distMatrix[i][j]) dMin[i] = j;
  }

  let root;
  for (let p = 0; p < n - 1; p++) {
    // Find the closest pair of clusters.
    let c1 = 0;
    for (let i = 0; i < n; i++) {
      if (distMatrix[i][dMin[i]] < distMatrix[c1][dMin[c1]]) c1 = i;
    }
    const c2 = dMin[c1],
          left = clusters[c1],
          right = clusters[c2];

    root = clusters[c1] = {
      left,
      right,
      height: distMatrix[c1][c2],
      size: left.size + right.size,
      depth: 1 + Math.max(left.depth, right.depth),
      index: n + p,
      centroid: mergeCentroids(left, right)
    };

    // Update the distances to the merged cluster, which replaces c1.
    for (let j = 0; j < n; j++) {
      if (j === c1 || j === c2) continue;
      if (linkage === "single") {
        if (distMatrix[c1][j] > distMatrix[c2][j]) distMatrix[j][c1] = distMatrix[c1][j] = distMatrix[c2][j];
      } else if (linkage === "complete") {
        if (distMatrix[c1][j] < distMatrix[c2][j]) distMatrix[j][c1] = distMatrix[c1][j] = distMatrix[c2][j];
      } else {
        distMatrix[j][c1] = distMatrix[c1][j] = (left.size * distMatrix[c1][j] + right.size * distMatrix[c2][j]) / root.size;
      }
    }

    // Remove c2.
    for (let i = 0; i < n; i++) distMatrix[i][c2] = distMatrix[c2][i] = Infinity;

    // Update the closest clusters. Complete and average linkage can move c1
    // further away, so the closest cluster is found again.
    for (let j = 0; j < n; j++) {
      if (linkage === "single") {
        if (dMin[j] === c2) dMin[j] = c1;
      } else if (dMin[j] === c1 || dMin[j] === c2) {
        for (let k = 0; k < n; k++) {
          if (distMatrix[j][k] < distMatrix[j][dMin[j]]) dMin[j] = k;
        }
      }
      if (distMatrix[c1][j] < distMatrix[c1][dMin[c1]]) dMin[c1] = j;
    }
  }

  return root;
}

// The mean of the vectors in clusters a and b, weighted by their sizes.
function mergeCentroids(a, b) {
  const n = a.centroid.length,
        size = a.size + b.size,
        centroid = new Array(n);
  for (let i = 0; i < n; i++) centroid[i] = (a.size * a.centroid[i] + b.size * b.centroid[i]) / size;
  return centroid;
}
