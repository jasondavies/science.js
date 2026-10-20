# Science.js

Science.js is a JavaScript library for scientific and statistical computing.

Currently, there are two modules:

 * `science.stats`, containing various implementations of statistical methods
   similar to those provided by [R](http://www.r-project.org/);
 * `science.lin`, for linear algebra.

## Installation

    npm install science

Then import it as an ES module:

```javascript
import science from "science";
```

The package is ESM-only. CommonJS code can still load it on Node.js 20.19+ or
22.12+, where `require` supports ES modules:

```javascript
const { science } = require("science");
```

In a browser, you can instead load `dist/science.min.js` with a `<script>` tag,
which defines a global `science`.

## API Reference

* [Core](#core)
* [Linear algebra](#linear-algebra)
* [Summary statistics](#summary-statistics)
* [Distributions](#distributions)
* [Distances](#distances)
* [Kernel density estimation](#kernel-density-estimation)
* [Clustering](#clustering)
* [Smoothing](#smoothing)

Configurable functions follow the same pattern as [D3](https://d3js.org/):
calling the constructor returns a function, whose settings are changed by
chained methods. Calling a setting method with no arguments returns its current
value.

Errors are thrown as plain objects of the form `{error: "message"}`, not as
`Error` instances.

### Core

<a name="version" href="#version">#</a> science.<b>version</b>

The version of Science.js, such as `"2.0.0"`.

<a name="EULER" href="#EULER">#</a> science.<b>EULER</b>

The [Euler–Mascheroni constant](https://en.wikipedia.org/wiki/Euler%E2%80%93Mascheroni_constant), γ ≈ 0.5772156649015329.

<a name="ascending" href="#ascending">#</a> science.<b>ascending</b>(<i>a</i>, <i>b</i>)

A comparator for sorting numbers in ascending order, returning *a* − *b*.

```javascript
[3, 1, 2].sort(science.ascending); // [1, 2, 3]
```

<a name="expm1" href="#expm1">#</a> science.<b>expm1</b>(<i>x</i>)

Returns *e*<sup>*x*</sup> − 1. When |*x*| < 1e-5, the second-order Taylor
approximation *x* + *x*²/2 is used, to avoid the cancellation in
`Math.exp(x) - 1`.

```javascript
science.expm1(0); // 0
```

<a name="functor" href="#functor">#</a> science.<b>functor</b>(<i>value</i>)

If *value* is a function, returns it; otherwise returns a function that always
returns *value*.

```javascript
science.functor(3)(); // 3
```

<a name="hypot" href="#hypot">#</a> science.<b>hypot</b>(<i>x</i>, <i>y</i>)

Returns √(*x*² + *y*²) without overflow or underflow in the intermediate
values, using `Math.hypot`.

```javascript
science.hypot(3, 4); // 5
```

<a name="quadratic" href="#quadratic">#</a> science.<b>quadratic</b>()

Constructs a solver for quadratic equations.

<a name="_quadratic" href="#_quadratic">#</a> <i>quadratic</i>(<i>a</i>, <i>b</i>, <i>c</i>)

Returns the roots of *a**x*² + *b**x* + *c* = 0 in ascending order: two roots,
one (a repeated root), or none. If *a* is 0, the equation is solved as linear
(*b**x* + *c* = 0), and if *b* is also 0, no roots are returned. The larger root
is computed first to avoid loss of precision.

```javascript
var quadratic = science.quadratic();
quadratic(1, 1, -2); // [-2, 1]
quadratic(1, -2, 1); // [1]
quadratic(1, 0, 1); // []
quadratic(0, 2, -4); // [2]
```

<a name="quadratic_complex" href="#quadratic_complex">#</a> <i>quadratic</i>.<b>complex</b>([<i>complex</i>])

If *complex* is true, roots are returned as objects of the form `{r, i}` (real
and imaginary parts), and complex roots are included, in ascending order of
their imaginary parts. Defaults to false. If *complex* is not specified, returns
the current setting.

```javascript
science.quadratic().complex(true)(1, 0, 1); // [{r: 0, i: -1}, {r: 0, i: 1}]
```

<a name="zeroes" href="#zeroes">#</a> science.<b>zeroes</b>(<i>n</i>[, <i>m</i>, …])

Returns an array of *n* zeroes. With more arguments, returns nested arrays: for
example, `science.zeroes(n, m)` returns an *n* × *m* matrix of zeroes.

```javascript
science.zeroes(2, 3); // [[0, 0, 0], [0, 0, 0]]
```

### Linear algebra

Vectors are arrays of numbers, and matrices are arrays of rows.

<a name="lin_dot" href="#lin_dot">#</a> science.lin.<b>dot</b>(<i>a</i>, <i>b</i>)

Returns the dot product of vectors *a* and *b*. If their lengths differ, the
extra elements of the longer one are ignored.

```javascript
science.lin.dot([1, 2, 3], [4, 5, 6]); // 32
```

<a name="lin_cross" href="#lin_cross">#</a> science.lin.<b>cross</b>(<i>a</i>, <i>b</i>)

Returns the cross product of three-dimensional vectors *a* and *b*.

```javascript
science.lin.cross([1, 0, 0], [0, 1, 0]); // [0, 0, 1]
```

<a name="lin_length" href="#lin_length">#</a> science.lin.<b>length</b>(<i>a</i>)

Returns the Euclidean length of vector *a*.

```javascript
science.lin.length([3, 4]); // 5
```

<a name="lin_normalize" href="#lin_normalize">#</a> science.lin.<b>normalize</b>(<i>a</i>)

Returns a new vector in the direction of *a* with length 1. A zero vector gives
NaN elements.

```javascript
science.lin.normalize([3, 4]); // [0.6, 0.8]
```

<a name="lin_transpose" href="#lin_transpose">#</a> science.lin.<b>transpose</b>(<i>a</i>)

Returns the transpose of matrix *a*.

```javascript
science.lin.transpose([[1, 2, 3], [4, 5, 6]]); // [[1, 4], [2, 5], [3, 6]]
```

<a name="lin_multiply" href="#lin_multiply">#</a> science.lin.<b>multiply</b>(<i>a</i>, <i>b</i>)

Returns the matrix product *a* × *b*. Throws if the number of columns of *a*
differs from the number of rows of *b*. To multiply a matrix by a vector, pass
the vector as a column, such as `[[x], [y]]`.

```javascript
science.lin.multiply([[1, 2], [3, 4]], [[5], [6]]); // [[17], [39]]
```

<a name="lin_determinant" href="#lin_determinant">#</a> science.lin.<b>determinant</b>(<i>m</i>)

Returns the determinant of the 4 × 4 matrix *m*. Other sizes are not supported.

```javascript
science.lin.determinant([[2, 0, 0, 0], [0, 3, 0, 0], [0, 0, 4, 0], [0, 0, 0, 5]]); // 120
```

<a name="lin_inverse" href="#lin_inverse">#</a> science.lin.<b>inverse</b>(<i>m</i>)

Returns the inverse of the square matrix *m*, computed by
[gaussjordan](#lin_gaussjordan) with the default tolerance. Returns undefined if
*m* is not square or is singular (to within that tolerance). *m* is not modified.

```javascript
science.lin.inverse([[4, 7], [2, 6]]); // [[0.6, -0.7], [-0.2, 0.4]]
science.lin.inverse([[1, 2], [2, 4]]); // undefined
```

<a name="lin_gaussjordan" href="#lin_gaussjordan">#</a> science.lin.<b>gaussjordan</b>(<i>m</i>[, <i>eps</i>])

Performs [Gauss–Jordan elimination](https://en.wikipedia.org/wiki/Gaussian_elimination)
with partial pivoting in place on *m*, an *n* × *w* matrix with *w* ≥ *n*,
typically a square matrix augmented with one or more right-hand sides. Returns
true on success, in which case the left *n* × *n* block of *m* is the identity
and the remaining columns hold the solutions. Returns false, leaving *m* partly
reduced, if a pivot's magnitude is at most *eps*. If *eps* is not specified (or
is 0), it defaults to *n* × `Number.EPSILON` × the largest magnitude in the left
*n* × *n* block, so that the tolerance scales with the matrix.

```javascript
// Solves 2x + y = 5 and x + 3y = 10.
var m = [[2, 1, 5], [1, 3, 10]];
science.lin.gaussjordan(m); // true
m; // [[1, 0, 1], [0, 1, 3]]
```

<a name="lin_tridag" href="#lin_tridag">#</a> science.lin.<b>tridag</b>(<i>a</i>, <i>b</i>, <i>c</i>, <i>d</i>, <i>x</i>, <i>n</i>)

Solves the tridiagonal system of *n* equations *a*<sub>*i*</sub>*x*<sub>*i*−1</sub>
+ *b*<sub>*i*</sub>*x*<sub>*i*</sub> + *c*<sub>*i*</sub>*x*<sub>*i*+1</sub> =
*d*<sub>*i*</sub>, using the
[Thomas algorithm](https://en.wikipedia.org/wiki/Tridiagonal_matrix_algorithm),
and writes the solution into the array *x*. *a*[0] and *c*[*n* − 1] are not
used. The arrays *b* and *d* are modified in place, so pass copies if you need
them afterwards. No pivoting is done, so the system should be, for example,
diagonally dominant.

```javascript
var x = [];
science.lin.tridag([0, 1, 1], [2, 2, 2], [1, 1, 0], [3, 4, 3], x, 3);
x; // [1, 1, 1]
```

<a name="lin_decompose" href="#lin_decompose">#</a> science.lin.<b>decompose</b>()

Constructs an eigendecomposition function, based on
[JAMA](https://math.nist.gov/javanumerics/jama/).

<a name="_lin_decompose" href="#_lin_decompose">#</a> <i>decompose</i>(<i>A</i>)

Returns the eigendecomposition of the square matrix *A* as an object `{D, V}`
such that *A* × *V* = *V* × *D*. If *A* is symmetric, *D* is diagonal with the
eigenvalues in ascending order, and the columns of *V* are the corresponding
orthonormal eigenvectors. Otherwise, *D* is block diagonal: each real eigenvalue
is on the diagonal, and each complex conjugate pair *a* ± *bi* forms a 2 × 2
block [[*a*, *b*], [−*b*, *a*]].

```javascript
var result = science.lin.decompose()([[2, 0], [0, 1]]);
result.D; // [[1, 0], [0, 2]]
result.V; // [[0, 1], [1, 0]]
```

### Summary statistics

<a name="mean" href="#mean">#</a> science.stats.<b>mean</b>(<i>x</i>)

Returns the arithmetic mean of the array *x*, or NaN if it is empty. It is
computed incrementally, which avoids overflow for large values.

```javascript
science.stats.mean([1, 2, 3, 4]); // 2.5
```

<a name="median" href="#median">#</a> science.stats.<b>median</b>(<i>x</i>)

Returns the median of the array *x*, or NaN if it is empty. Equivalent to
`science.stats.quantiles(x, [0.5])[0]`.

```javascript
science.stats.median([3, 1, 4, 2]); // 2.5
```

<a name="mode" href="#mode">#</a> science.stats.<b>mode</b>(<i>x</i>)

Returns the most frequent value in the array *x*, or undefined if there is no
single most frequent value. Values are compared by their string form, so `1`
and `"1"` count as the same value.

```javascript
science.stats.mode([1, 2, 2, 3]); // 2
science.stats.mode([1, 1, 2, 2]); // undefined
```

<a name="quantiles" href="#quantiles">#</a> science.stats.<b>quantiles</b>(<i>x</i>, <i>p</i>)

Returns the quantiles of the array *x* for each probability in the array *p*,
which should be between 0 and 1, using linear interpolation between the sorted
values (type 7 in R's `quantile`, its default). *x* is not modified.

```javascript
science.stats.quantiles([1, 2, 3, 4], [0, 0.25, 0.5, 1]); // [1, 1.75, 2.5, 4]
```

<a name="iqr" href="#iqr">#</a> science.stats.<b>iqr</b>(<i>x</i>)

Returns the interquartile range of the array *x*: the difference between its
0.75 and 0.25 [quantiles](#quantiles).

```javascript
science.stats.iqr([1, 2, 3, 4]); // 1.5
```

<a name="variance" href="#variance">#</a> science.stats.<b>variance</b>(<i>x</i>)

Returns the unbiased sample variance of the array *x* (with denominator
*n* − 1). Returns 0 for a single value, and NaN for an empty array.

```javascript
science.stats.variance([1, 2, 3, 4]); // 1.6666666666666667
```

### Distributions

<a name="erf" href="#erf">#</a> science.stats.<b>erf</b>(<i>x</i>)

Returns an approximation of the
[error function](https://en.wikipedia.org/wiki/Error_function) at *x*, using
formula 7.1.26 of Abramowitz and Stegun, whose maximum absolute error is
1.5 × 10<sup>−7</sup>.

```javascript
science.stats.erf(1); // ≈ 0.8427007
```

<a name="phi" href="#phi">#</a> science.stats.<b>phi</b>(<i>x</i>)

Returns the cumulative distribution function of the standard normal
distribution at *x*, computed from [erf](#erf).

```javascript
science.stats.phi(1.96); // ≈ 0.9750021
```

<a name="distribution_gaussian" href="#distribution_gaussian">#</a> science.stats.distribution.<b>gaussian</b>()

Constructs a normal (Gaussian) distribution with mean 0 and variance 1.

<a name="_distribution_gaussian" href="#_distribution_gaussian">#</a> <i>gaussian</i>()

Returns a random number drawn from the distribution, using the
[Marsaglia polar method](https://en.wikipedia.org/wiki/Marsaglia_polar_method).

<a name="distribution_gaussian_pdf" href="#distribution_gaussian_pdf">#</a> <i>gaussian</i>.<b>pdf</b>(<i>x</i>)

Returns the probability density function of the distribution at *x*.

```javascript
science.stats.distribution.gaussian().pdf(0); // ≈ 0.3989423
```

<a name="distribution_gaussian_cdf" href="#distribution_gaussian_cdf">#</a> <i>gaussian</i>.<b>cdf</b>(<i>x</i>)

Returns the cumulative distribution function of the distribution at *x*,
computed from [erf](#erf).

<a name="distribution_gaussian_mean" href="#distribution_gaussian_mean">#</a> <i>gaussian</i>.<b>mean</b>([<i>mean</i>])

Specifies the mean of the distribution, which defaults to 0. If *mean* is not
specified, returns the current mean.

<a name="distribution_gaussian_variance" href="#distribution_gaussian_variance">#</a> <i>gaussian</i>.<b>variance</b>([<i>variance</i>])

Specifies the variance of the distribution, which defaults to 1. If *variance*
is not specified, returns the current variance.

```javascript
var normal = science.stats.distribution.gaussian().mean(10).variance(4);
normal.cdf(10); // ≈ 0.5
```

<a name="distribution_gaussian_random" href="#distribution_gaussian_random">#</a> <i>gaussian</i>.<b>random</b>([<i>random</i>])

Specifies the source of uniform random numbers in [0, 1) used to generate
samples, which defaults to `Math.random`. Use a seeded generator for
reproducible samples. If *random* is not specified, returns the current source.

### Distances

Each distance function takes two arrays *a* and *b* of the same length. They can
be passed to [kmeans](#kmeans_distance) and [hcluster](#hcluster_distance).

<a name="distance_euclidean" href="#distance_euclidean">#</a> science.stats.distance.<b>euclidean</b>(<i>a</i>, <i>b</i>)

Returns the [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance)
between *a* and *b*.

```javascript
science.stats.distance.euclidean([0, 0], [3, 4]); // 5
```

<a name="distance_manhattan" href="#distance_manhattan">#</a> science.stats.distance.<b>manhattan</b>(<i>a</i>, <i>b</i>)

Returns the [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry),
the sum of the absolute differences.

```javascript
science.stats.distance.manhattan([0, 0], [3, 4]); // 7
```

<a name="distance_chebyshev" href="#distance_chebyshev">#</a> science.stats.distance.<b>chebyshev</b>(<i>a</i>, <i>b</i>)

Returns the [Chebyshev distance](https://en.wikipedia.org/wiki/Chebyshev_distance),
the largest absolute difference.

```javascript
science.stats.distance.chebyshev([0, 0], [3, 4]); // 4
```

<a name="distance_minkowski" href="#distance_minkowski">#</a> science.stats.distance.<b>minkowski</b>(<i>p</i>)

Returns a function that computes the
[Minkowski distance](https://en.wikipedia.org/wiki/Minkowski_distance) of order
*p* between two arrays. Order 1 is the Manhattan distance, and order 2 the
Euclidean distance.

```javascript
science.stats.distance.minkowski(3)([0, 0], [3, 4]); // ≈ 4.4979414
```

<a name="distance_hamming" href="#distance_hamming">#</a> science.stats.distance.<b>hamming</b>(<i>a</i>, <i>b</i>)

Returns the [Hamming distance](https://en.wikipedia.org/wiki/Hamming_distance),
the number of positions at which *a* and *b* differ (using `!==`).

```javascript
science.stats.distance.hamming([1, 2, 3], [1, 0, 3]); // 1
```

<a name="distance_jaccard" href="#distance_jaccard">#</a> science.stats.distance.<b>jaccard</b>(<i>a</i>, <i>b</i>)

Returns the proportion of positions at which *a* and *b* are equal (using
`===`), or NaN if they are empty.

```javascript
science.stats.distance.jaccard([1, 2, 3, 4], [1, 2, 0, 0]); // 0.5
```

<a name="distance_braycurtis" href="#distance_braycurtis">#</a> science.stats.distance.<b>braycurtis</b>(<i>a</i>, <i>b</i>)

Returns the [Bray–Curtis dissimilarity](https://en.wikipedia.org/wiki/Bray%E2%80%93Curtis_dissimilarity),
Σ|*a*<sub>*i*</sub> − *b*<sub>*i*</sub>| / Σ|*a*<sub>*i*</sub> + *b*<sub>*i*</sub>|,
for arrays of non-negative values. Returns NaN if both are all zeroes.

```javascript
science.stats.distance.braycurtis([0, 1], [1, 1]); // ≈ 0.3333333
```

### Kernel density estimation

<a name="kde" href="#kde">#</a> science.stats.<b>kde</b>()

Constructs a [kernel density estimator](https://en.wikipedia.org/wiki/Kernel_density_estimation)
with an empty sample, a Gaussian kernel and the [nrd0](#bandwidth_nrd0)
bandwidth.

<a name="_kde" href="#_kde">#</a> <i>kde</i>(<i>points</i>)

Returns the estimated density at each value in the array *points*, as an array
of `[x, density]` pairs. Throws if the bandwidth is not positive.

```javascript
var kde = science.stats.kde().sample([1, 2, 3, 4, 5]).bandwidth(1);
kde([3]); // ≈ [[3, 0.1981731]]
```

<a name="kde_sample" href="#kde_sample">#</a> <i>kde</i>.<b>sample</b>([<i>sample</i>])

Specifies the array of values whose density is estimated. If *sample* is not
specified, returns the current sample.

<a name="kde_kernel" href="#kde_kernel">#</a> <i>kde</i>.<b>kernel</b>([<i>kernel</i>])

Specifies the [kernel](#kernels) function, which defaults to
`science.stats.kernel.gaussian`. If *kernel* is not specified, returns the
current kernel.

<a name="kde_bandwidth" href="#kde_bandwidth">#</a> <i>kde</i>.<b>bandwidth</b>([<i>bandwidth</i>])

Specifies the bandwidth, either as a number or as a function that is passed the
sample and returns a number, such as one of the [bandwidth selectors](#bandwidth).
Defaults to [nrd0](#bandwidth_nrd0). If *bandwidth* is not specified, returns
the current bandwidth function.

<a name="kernels" href="#kernels">#</a> science.stats.<b>kernel</b>

[Kernel functions](https://en.wikipedia.org/wiki/Kernel_(statistics)#Kernel_functions_in_common_use)
for [kde](#kde_kernel). Each takes a value *u* and returns its weight; all but
the Gaussian kernel are zero outside [−1, 1].

* science.stats.kernel.<b>uniform</b>(<i>u</i>): ½.
* science.stats.kernel.<b>triangular</b>(<i>u</i>): 1 − |*u*|.
* science.stats.kernel.<b>epanechnikov</b>(<i>u</i>): ¾(1 − *u*²).
* science.stats.kernel.<b>quartic</b>(<i>u</i>): (15/16)(1 − *u*²)².
* science.stats.kernel.<b>triweight</b>(<i>u</i>): (35/32)(1 − *u*²)³.
* science.stats.kernel.<b>gaussian</b>(<i>u</i>): *e*<sup>−*u*²/2</sup> / √(2π).
* science.stats.kernel.<b>cosine</b>(<i>u</i>): (π/4) cos(π*u*/2).

```javascript
science.stats.kernel.epanechnikov(0); // 0.75
```

<a name="bandwidth" href="#bandwidth">#</a> science.stats.<b>bandwidth</b>

Bandwidth selectors for Gaussian kernels, based on R's `bw.nrd0` and `bw.nrd`.
Each takes an array *x* and returns a bandwidth.

<a name="bandwidth_nrd0" href="#bandwidth_nrd0">#</a> science.stats.bandwidth.<b>nrd0</b>(<i>x</i>)

Silverman's rule of thumb: 0.9 × min(*s*, IQR / 1.34) × *n*<sup>−1/5</sup>,
where *s* is the sample standard deviation and IQR the
[interquartile range](#iqr). If that minimum is 0, *s* is used instead, then
|*x*[0]|, then 1, so the result is always positive for finite values.

```javascript
science.stats.bandwidth.nrd0([1, 4, 3, 2]); // ≈ 0.7635139
```

<a name="bandwidth_nrd" href="#bandwidth_nrd">#</a> science.stats.bandwidth.<b>nrd</b>(<i>x</i>)

Scott's variation of the rule: 1.06 × min(*s*, IQR / 1.34) ×
*n*<sup>−1/5</sup>. Unlike nrd0, this is 0 when the interquartile range is 0,
such as when most values are repeated.

```javascript
science.stats.bandwidth.nrd([1, 4, 3, 2]); // ≈ 0.8992498
```

### Clustering

<a name="kmeans" href="#kmeans">#</a> science.stats.<b>kmeans</b>()

Constructs a [k-means](https://en.wikipedia.org/wiki/K-means_clustering)
clusterer with *k* = 1 and the Euclidean distance.

<a name="_kmeans" href="#_kmeans">#</a> <i>kmeans</i>(<i>vectors</i>)

Clusters the array of *vectors* (arrays of numbers) into *k* clusters, and
returns an object `{assignments, centroids}`: *assignments*[*i*] is the index of
the cluster of *vectors*[*i*], and *centroids*[*j*] is the mean of the vectors
in cluster *j*. The initial centroids are distinct vectors chosen at random
with `Math.random`, so results can vary between runs. Iterates until the
centroids stop changing, or for at most 1,000 iterations. Throws if there are
fewer than *k* distinct vectors.

```javascript
var result = science.stats.kmeans().k(2)([[0], [1], [10], [11]]);
result.assignments[0] === result.assignments[1]; // true
result.assignments[0] === result.assignments[2]; // false
```

<a name="kmeans_k" href="#kmeans_k">#</a> <i>kmeans</i>.<b>k</b>([<i>k</i>])

Specifies the number of clusters, which defaults to 1. If *k* is not specified,
returns the current number.

<a name="kmeans_distance" href="#kmeans_distance">#</a> <i>kmeans</i>.<b>distance</b>([<i>distance</i>])

Specifies the [distance](#distances) function used to assign vectors to the
nearest centroid, which defaults to the Euclidean distance. If *distance* is not
specified, returns the current function.

<a name="hcluster" href="#hcluster">#</a> science.stats.<b>hcluster</b>()

Constructs an agglomerative
[hierarchical clusterer](https://en.wikipedia.org/wiki/Hierarchical_clustering)
with single linkage and the Euclidean distance.

<a name="_hcluster" href="#_hcluster">#</a> <i>hcluster</i>(<i>vectors</i>)

Repeatedly merges the two closest clusters of the array of *vectors* (arrays of
numbers), and returns the root of the resulting binary tree, or undefined if
there are fewer than two vectors. Each node is an object with these properties:

* *left* and *right*: the two merged child nodes, or null for a leaf.
* *dist*: the [linkage](#hcluster_linkage) distance between the children, or 0
  for a leaf.
* *centroid*: the mean of the node's vectors (for a leaf, the input vector
  itself).
* *size*: the number of vectors in the node.
* *depth*: the height of the node above the leaves.

```javascript
var root = science.stats.hcluster()([[1], [2], [5]]);
root.dist; // 3
root.left.dist; // 1
root.size; // 3
```

<a name="hcluster_linkage" href="#hcluster_linkage">#</a> <i>hcluster</i>.<b>linkage</b>([<i>linkage</i>])

Specifies how the distance between two clusters is computed from the distances
between their vectors: `"single"` (the smallest), `"complete"` (the largest) or
`"average"` (the mean). Defaults to `"single"`. An unknown linkage is reported
when the clusterer is invoked. If *linkage* is not specified, returns the current
linkage.

```javascript
science.stats.hcluster().linkage("complete")([[1], [2], [5]]).dist; // 4
```

<a name="hcluster_distance" href="#hcluster_distance">#</a> <i>hcluster</i>.<b>distance</b>([<i>distance</i>])

Specifies the [distance](#distances) function between vectors, which defaults to
the Euclidean distance. If *distance* is not specified, returns the current
function.

### Smoothing

<a name="loess" href="#loess">#</a> science.stats.<b>loess</b>()

Constructs a [LOESS](https://en.wikipedia.org/wiki/Local_regression) curve generator instance.

```javascript
var myLoess = science.stats.loess();
```

<a name="loess_bandwidth" href="#loess_bandwidth">#</a> <i>loess</i>.<b>bandwidth</b>([<i>bandwidth</i>])

Specifies the [bandwidth (smoothing parameter)](https://en.wikipedia.org/wiki/Local_regression#Localized_subsets_of_data) that controls how fine or coarse the smoothing is. The bandwidth is the fraction of the input points used for each local regression (taken from the nearest points with a positive weight); it must be greater than 0 and at most 1, and defaults to 0.3. Lower values fit the curve closer to the data, higher values make the curve more straight. If *bandwidth* is not specified, returns the current bandwidth.

When the generator is invoked with three or more points, floor(*bandwidth* × *n*) must be at least 2, where *n* is the number of points, or an error is thrown. For example, the default bandwidth of 0.3 requires at least 7 points.

```javascript
myLoess.bandwidth(0.2);
```

<a name="loess_robustnessIterations" href="#loess_robustnessIterations">#</a> <i>loess</i>.<b>robustnessIterations</b>([<i>iterations</i>])

Specifies the number of robustness iterations performed after the initial fit; it must be a non-negative integer, and defaults to 2. Each iteration reduces the weight of points with large residuals, making the curve less sensitive to outliers. Use 0 for a plain locally weighted linear regression. If *iterations* is not specified, returns the current number of robustness iterations.

```javascript
myLoess.robustnessIterations(4);
```

<a name="loess_accuracy" href="#loess_accuracy">#</a> <i>loess</i>.<b>accuracy</b>([<i>accuracy</i>])

Specifies the tolerance below which values are treated as zero; it must be a non-negative number, and defaults to 1e-12. If the spread of x values in a local regression is below the tolerance, a flat line is fitted there instead of a sloped one; if the median residual falls below it, the remaining robustness iterations are skipped because the fit is already exact. If *accuracy* is not specified, returns the current accuracy.

```javascript
myLoess.accuracy(1e-9);
```

<a name="_loess" href="#_loess">#</a> <i>loess</i>(<i>xValues</i>, <i>yValues</i>[, <i>weights</i>])

Invokes the LOESS algorithm to generate the smoothed curve. Accepts as input two arrays of values in data space. These two arrays must be of the same length, all values must be finite numbers, and *xValues* must be sorted in ascending order (tied values are allowed). Returns an array of smoothed Y values that has the same number of elements as the input arrays.

The optional *weights* array gives a non-negative weight for each point, which scales its influence on the local regressions. Points with a weight of zero have no influence, but are still given a smoothed value from their neighbours. *weights* must have the same length as the other two arrays, and at least one weight must be positive. If *weights* is not specified (or is null or undefined), all points have a weight of 1.

If the input or configuration is invalid, an error is thrown. An invalid bandwidth, number of robustness iterations or accuracy is reported when the generator is invoked, not when it is set.

```javascript
var yValuesSmooth = myLoess(xValues, yValues);
```

## Development

To help develop Science.js, you need to have [Node.js](http://www.nodejs.org)
and [NPM](http://www.npmjs.org) installed. Once you have done that, run the
following from the root directory of this repository:

    npm install
    npm run build
    npm test

## Thanks

I originally started this in order to add a reusable statistics module to
[D3.js](http://mbostock.github.com/d3/), but now it's grown into a whole new
project of its own!

The project structure was inspired by D3, so a big thank you goes to
[Mike Bostock](http://bost.ocks.org/mike/) for this.
