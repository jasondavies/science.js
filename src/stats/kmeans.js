import { distances } from "./distances.js";
import { requireMatrix, requireFunction } from "../validate.js";

// k-means clustering with k-means++ initialisation (Arthur and Vassilvitskii,
// 2007), iterating until the assignments stop changing.
export function kmeans(vectors, {k, distance = distances.euclidean, maxIterations = 1000, random = Math.random} = {}) {
  const [n, dimensions] = requireMatrix(vectors, "vectors");
  if (!(Number.isInteger(k) && k >= 1)) throw new RangeError("k must be a positive integer.");
  if (!(Number.isInteger(maxIterations) && maxIterations >= 1)) throw new RangeError("maxIterations must be a positive integer.");
  requireFunction(distance, "distance");
  requireFunction(random, "random");
  if (distinctCount(vectors, k) < k) throw new RangeError("There are fewer distinct vectors than clusters.");

  let centroids = initialCentroids(vectors, k, distance, random),
      assignments = new Array(n).fill(-1),
      iterations = 0,
      changed = true;

  while (changed && iterations < maxIterations) {
    iterations++;
    changed = false;

    // Assign each vector to its closest centroid.
    for (let i = 0; i < n; i++) {
      let best = 0,
          min = Infinity;
      for (let j = 0; j < k; j++) {
        const d = distance(vectors[i], centroids[j]);
        if (d < min) {
          min = d;
          best = j;
        }
      }
      if (assignments[i] !== best) {
        assignments[i] = best;
        changed = true;
      }
    }

    // Move each centroid to the mean of its vectors; a centroid with no
    // vectors stays where it is.
    const sums = Array.from({length: k}, () => new Array(dimensions).fill(0)),
          counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const j = assignments[i];
      counts[j]++;
      for (let d = 0; d < dimensions; d++) sums[j][d] += vectors[i][d];
    }
    centroids = centroids.map((c, j) => counts[j] ? sums[j].map((s) => s / counts[j]) : c);
  }

  return {assignments, centroids, iterations};
}

// The number of distinct vectors, counting no further than limit.
function distinctCount(vectors, limit) {
  const seen = new Set();
  for (let i = 0; i < vectors.length && seen.size < limit; i++) seen.add(Array.from(vectors[i]).join());
  return seen.size;
}

// Chooses the first centroid uniformly at random, and each further centroid
// with probability proportional to its squared distance from the closest
// centroid chosen so far.
function initialCentroids(vectors, k, distance, random) {
  const n = vectors.length,
        closest = new Array(n).fill(Infinity),
        centroids = [Array.from(vectors[Math.min(n - 1, Math.floor(random() * n))])];
  while (centroids.length < k) {
    const last = centroids[centroids.length - 1];
    let total = 0;
    for (let i = 0; i < n; i++) {
      const d = distance(vectors[i], last);
      closest[i] = Math.min(closest[i], d * d);
      total += closest[i];
    }
    let target = random() * total,
        chosen = -1;
    for (let i = 0; i < n; i++) {
      if (closest[i] > 0) {
        chosen = i;
        target -= closest[i];
        if (target < 0) break;
      }
    }
    if (chosen < 0) throw new RangeError("There are fewer vectors at a positive distance from each other than clusters.");
    centroids.push(Array.from(vectors[chosen]));
  }
  return centroids;
}
