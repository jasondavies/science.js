science.stats.hcluster = function() {
  var distance = science.stats.distance.euclidean,
      linkage = "";

  function hcluster(vectors) {
    var n = vectors.length;
    var dMin = [];
    var cSize = [];
    var distMatrix = [];
    var clusters = [];

    var c1, c2, c1Cluster, c2Cluster, p, root , newCentroid;

    var i,
        j;

    // Initialize distance matrix and vector of closest clusters
    i = -1; while (++i < n) {
      dMin[i] = 0;
      distMatrix[i] = [];
      j = -1; while (++j < n) {
        distMatrix[i][j] = i === j ? Infinity : distance(vectors[i] , vectors[j]);
        if (distMatrix[i][dMin[i]] > distMatrix[i][j]) dMin[i] = j ;
      }
    }

    // create leaves of the tree
    i = -1; while (++i < n) {
      clusters[i] = [];
      clusters[i][0] = {left: null, right: null, dist: 0, centroid: vectors[i], size: 1, depth: 0};
      cSize[i] = 1;
    }

    // Main loop
    for (p = 0; p < n-1; p++) {
      // find the closest pair of clusters
      c1 = 0 ;
      for (i = 0 ; i < n ; i++) {
        if (distMatrix[i][dMin[i]] < distMatrix[c1][dMin[c1]]) c1 = i;
      }
      c2 = dMin[c1];

      // create node to store cluster info 
      c1Cluster = clusters[c1][0] ;
      c2Cluster = clusters[c2][0] ;

      newCentroid = calculateCentroid(c1Cluster.size, c1Cluster.centroid, c2Cluster.size, c2Cluster.centroid) ;
      newCluster = {left: c1Cluster, right: c2Cluster, dist: distMatrix[c1][c2], centroid: newCentroid, size: c1Cluster.size + c2Cluster.size, depth: 1 + Math.max(c1Cluster.depth, c2Cluster.depth)};
      clusters[c1].splice(0, 0, newCluster);
      cSize[c1] += cSize[c2];

      // overwrite row c1 with respect to the linkage type
      for (j = 0 ; j < n ; j++) {
              if (linkage == "single") {
                      if (distMatrix[c1][j] > distMatrix[c2][j])
                              distMatrix[j][c1] = distMatrix[c1][j] = distMatrix[c2][j] ;
              } else if (linkage == "complete") {
                      if (distMatrix[c1][j] < distMatrix[c2][j])
                              distMatrix[j][c1] = distMatrix[c1][j] = distMatrix[c2][j] ;
              } else if (linkage == "average") {
                      var avg = ( cSize[c1] * distMatrix[c1][j] + cSize[c2] * distMatrix[c2][j])  / (cSize[c1] + cSize[j]) 
                      distMatrix[j][c1] = distMatrix[c1][j] = avg ;
              }
      }
      distMatrix[c1][c1] = Infinity;

      // infinity ­out old row c2 and column c2
      for (i = 0 ; i < n ; i++)
        distMatrix[i][c2] = distMatrix[c2][i] = Infinity;

      // update dmin and replace ones that previous pointed to c2 to point to c1
      for (j = 0; j < n ; j++) {
        if (dMin[j] == c2)
          dMin[j] = c1;
        if (distMatrix[c1][j] < distMatrix[c1][dMin[c1]]) 
          dMin[c1] = j;
      }

      // keep track of the last added cluster
      root = newCluster;
    }

    return root;
  }

  return hcluster;
};

function calculateCentroid(c1Size, c1Centroid, c2Size, c2Centroid) {
  var newCentroid = [];
  var newSize = c1Size + c2Size;
  for (var i = 0; i < c1Centroid.length; i++)
    newCentroid[i] = (c1Size * c1Centroid[i] + c2Size * c2Centroid[i]) / newSize;
  return newCentroid;
}
