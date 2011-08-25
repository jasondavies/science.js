// Based on figue implementation by Jean-Yves Delort.
// http://code.google.com/p/figue/
science.stats.kmeans = function() {
  var distance = science.stats.distance.euclidean,
      maxIterations = 1000,
      k = 1;

  function kmeans(vectors) {
    var n = vectors.length,
        assignments = [],
        clusterSizes = [],
        repeat = 1,
        iterations = 0,
        centroids = science_stats_kmeansRandom(k, vectors),
        newCentroids,
        i,
        j,
        x,
        d,
        min,
        best;

    while (repeat && iterations < maxIterations) {
      // Assignment step.
      j = -1; while (++j < k) {
        clusterSizes[j] = 0;
      }

      i = -1; while (++i < n) {
        x = vectors[i];
        min = Infinity;
        j = -1; while (++j < k) {
          d = distance.call(this, centroids[j], x);
          if (d < min) {
            min = d;
            best = j;
          }
        }
        clusterSizes[assignments[i] = best]++;
      }

      // Update centroids step.
      newCentroids = [];
      i = -1; while (++i < n) {
        x = assignments[i];
        d = newCentroids[x];
        if (d == null) newCentroids[x] = vectors[i].slice();
        else {
          j = -1; while (++j < d.length) {
            d[j] += vectors[i][j];
          }
        }
      }
      j = -1; while (++j < k) {
        x = newCentroids[j];
        d = 1 / clusterSizes[j];
        i = -1; while (++i < x.length) x[i] *= d;
      }

      // Check convergence.
      repeat = 0;
      j = -1; while (++j < k) {
        if (!science_stats_kmeansCompare(newCentroids[j], centroids[j])) {
          repeat = 1;
          break;
        }
      }
      centroids = newCentroids;
      iterations++;
    }
    return {assignments: assignments, centroids: centroids};
  }

  kmeans.k = function(x) {
    if (!arguments.length) return k;
    k = x;
    return kmeans;
  };

  kmeans.distance = function(x) {
    if (!arguments.length) return distance;
    distance = x;
    return kmeans;
  };

  return kmeans;
};

function science_stats_kmeansCompare(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  var n = a.length,
      i = -1;
  while (++i < n) if (a[i] !== b[i]) return false;
  return true;
}

// Returns an array of k distinct vectors randomly selected from the input
// array of vectors. Returns null if k > n or if there are less than k distinct
// objects in vectors.
function science_stats_kmeansRandom(k, vectors) {
  var n = vectors.length;
  if (k > n) return null;
  
  var selected_vectors = [];
  var selected_indices = [];
  var tested_indices = {};
  var tested = 0;
  var selected = 0;
  var i,
      vector,
      select;

  while (selected < k) {
    if (tested === n) return null;
    
    var random_index = Math.floor(Math.random() * n);
    if (random_index in tested_indices) continue;
    
    tested_indices[random_index] = 1;
    tested++;
    vector = vectors[random_index];
    select = true;
    for (i = 0; i < selected; i++) {
      if (science_stats_kmeansCompare(vector, selected_vectors[i])) {
        select = false;
        break;
      }
    }
    if (select) {
      selected_vectors[selected] = vector;
      selected_indices[selected] = random_index;
      selected++;
    }
  }
  return selected_vectors;
}
