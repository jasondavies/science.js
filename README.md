# Science.js

Science.js is a JavaScript library for scientific and statistical computing:
summary statistics, distributions, kernel density estimation, clustering,
smoothing and linear algebra, with methods similar to those provided by
[R](https://www.r-project.org/).

## Installation

    npm install science

Science.js is an ES module, and works in Node.js 18 or later and in modern
browsers. Import the functions you need:

```javascript
import { mean, loess } from "science";
```

CommonJS code can load it on Node.js 20.19+ or 22.12+, where `require` supports
ES modules:

```javascript
const { mean, loess } = require("science");
```

In a browser, you can instead load `dist/science.min.js` with a `<script>` tag,
which defines a global `science` with the same functions, such as
`science.mean`.

Type definitions for TypeScript are included.

## API Reference

* [Summary statistics](#summary-statistics)
* [Distributions](#distributions)
* [Kernel density estimation](#kernel-density-estimation)
* [Smoothing](#smoothing)
* [Clustering](#clustering)
* [Distances](#distances)
* [Linear algebra](#linear-algebra)
* [Other](#other)

Functions take arrays (or typed arrays) of numbers, and never modify their
inputs. Optional settings are passed as an options object. Invalid input throws
a `TypeError` (for a value of the wrong type) or a `RangeError` (for a value out
of range, such as arrays of different lengths).

### Summary statistics

<a name="mean" href="#mean">#</a> <b>mean</b>(<i>values</i>)

Returns the arithmetic mean of *values*, or NaN if it is empty. It is computed
incrementally, so that large values do not overflow.

```javascript
mean([1, 2, 3, 4]); // 2.5
```

<a name="median" href="#median">#</a> <b>median</b>(<i>values</i>)

Returns the median of *values*, or NaN if it is empty.

```javascript
median([3, 1, 4, 2]); // 2.5
```

<a name="quantile" href="#quantile">#</a> <b>quantile</b>(<i>values</i>, <i>p</i>)

Returns the *p*-quantile of *values*, where *p* is between 0 and 1, using linear
interpolation between the sorted values (type 7 in R's `quantile`, its
default). Returns NaN if *values* is empty.

```javascript
quantile([1, 2, 3, 4], 0.25); // 1.75
```

<a name="quantiles" href="#quantiles">#</a> <b>quantiles</b>(<i>values</i>, <i>probabilities</i>)

Returns the quantile of *values* for each of the *probabilities*, sorting
*values* only once.

```javascript
quantiles([1, 2, 3, 4], [0, 0.5, 1]); // [1, 2.5, 4]
```

<a name="iqr" href="#iqr">#</a> <b>iqr</b>(<i>values</i>)

Returns the interquartile range of *values*: the difference between its 0.75
and 0.25 quantiles.

```javascript
iqr([1, 2, 3, 4]); // 1.5
```

<a name="variance" href="#variance">#</a> <b>variance</b>(<i>values</i>)

Returns the unbiased sample variance of *values* (with denominator *n* − 1), or
NaN if there are fewer than two values. It uses Welford's algorithm, which is
accurate even when the values are large compared with their spread.

```javascript
variance([1, 2, 3, 4]); // 1.6666666666666667
```

<a name="standardDeviation" href="#standardDeviation">#</a> <b>standardDeviation</b>(<i>values</i>)

Returns the sample standard deviation of *values*, the square root of its
[variance](#variance).

```javascript
standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]); // ≈ 2.1380899
```

<a name="modes" href="#modes">#</a> <b>modes</b>(<i>values</i>)

Returns all of the most frequent values in *values*, in the order they first
appear, or an empty array if *values* is empty. Values are compared as in a
`Map`, so `1` and `"1"` are different values.

```javascript
modes([1, 2, 2, 3]); // [2]
modes([3, 3, 1, 1, 2]); // [3, 1]
```

### Distributions

<a name="normal" href="#normal">#</a> <b>normal</b>([<i>options</i>])

Returns a [normal distribution](https://en.wikipedia.org/wiki/Normal_distribution)
with the given *options*:

* *mean*: the mean, which defaults to 0.
* *sd*: the standard deviation, which must be positive and defaults to 1.

The distribution is an object with these properties and methods:

* *mean* and *sd*: the parameters.
* *pdf*(*x*): the probability density at *x*.
* *cdf*(*x*): the cumulative probability at *x*, with a relative error of about
  1e-14 within 8 standard deviations of the mean, and about 1e-13 even far into
  the tails.
* *quantile*(*p*): the inverse of *cdf*, for a probability *p* between 0 and 1.
* *sample*([*random*]): a random number drawn from the distribution, using the
  [Marsaglia polar method](https://en.wikipedia.org/wiki/Marsaglia_polar_method).
  *random* is a source of uniform random numbers in [0, 1), which defaults to
  `Math.random`; pass a seeded generator for reproducible samples.

```javascript
const heights = normal({mean: 170, sd: 10});
heights.cdf(180); // ≈ 0.8413447
heights.quantile(0.975); // ≈ 189.5996398
normal().pdf(0); // ≈ 0.3989423
```

<a name="erf" href="#erf">#</a> <b>erf</b>(<i>x</i>)

Returns the [error function](https://en.wikipedia.org/wiki/Error_function) at
*x*, accurate to about 1e-15 relative error.

```javascript
erf(1); // ≈ 0.8427008
```

<a name="erfc" href="#erfc">#</a> <b>erfc</b>(<i>x</i>)

Returns the complementary error function, 1 − erf(*x*), computed directly so
that it stays accurate for large *x*, where 1 − erf(*x*) would round to 0.

```javascript
erfc(10); // ≈ 2.0884876e-45
```

### Kernel density estimation

<a name="kde" href="#kde">#</a> <b>kde</b>(<i>sample</i>[, <i>options</i>])

Returns the [kernel density estimate](https://en.wikipedia.org/wiki/Kernel_density_estimation)
for the array *sample*, as a function that takes a value *x* and returns the
estimated density there. Its *bandwidth* property is the bandwidth used. The
*options* are:

* *kernel*: the [kernel](#kernels) function, which defaults to
  `kernels.gaussian`.
* *bandwidth*: a positive number, or a function that is passed the sample and
  returns one, such as one of the [bandwidth selectors](#bandwidths). Defaults
  to `bandwidths.nrd0`, as in R's `density`.

```javascript
const density = kde([1, 2, 3, 4, 5], {bandwidth: 1});
density(3); // ≈ 0.1981731
density.bandwidth; // 1
```

<a name="kernels" href="#kernels">#</a> <b>kernels</b>

[Kernel functions](https://en.wikipedia.org/wiki/Kernel_(statistics)#Kernel_functions_in_common_use),
each of which takes a value *u* and returns its weight. All of them integrate to
1, and all but the Gaussian are zero outside [−1, 1].

* kernels.<b>uniform</b>: ½.
* kernels.<b>triangular</b>: 1 − |*u*|.
* kernels.<b>epanechnikov</b>: ¾(1 − *u*²).
* kernels.<b>quartic</b>: (15/16)(1 − *u*²)².
* kernels.<b>triweight</b>: (35/32)(1 − *u*²)³.
* kernels.<b>gaussian</b>: *e*<sup>−*u*²/2</sup> / √(2π).
* kernels.<b>cosine</b>: (π/4) cos(π*u*/2).

```javascript
kernels.epanechnikov(0); // 0.75
```

<a name="bandwidths" href="#bandwidths">#</a> <b>bandwidths</b>

Bandwidth selectors for Gaussian kernels, matching R's `bw.nrd0` and `bw.nrd`.
Each takes an array of at least two values and returns a bandwidth.

* bandwidths.<b>nrd0</b>: Silverman's rule of thumb, 0.9 × min(*s*, IQR / 1.34)
  × *n*<sup>−1/5</sup>, where *s* is the [standard deviation](#standardDeviation)
  and IQR the [interquartile range](#iqr). If that minimum is 0, it falls back
  to *s*, then to the absolute value of the first value, then to 1.
* bandwidths.<b>nrd</b>: Scott's variation, 1.06 × min(*s*, IQR / 1.34) ×
  *n*<sup>−1/5</sup>. Unlike nrd0, it is 0 when the interquartile range is 0,
  such as when most values are repeated.

```javascript
bandwidths.nrd0([1, 4, 3, 2]); // ≈ 0.7635139
bandwidths.nrd([1, 4, 3, 2]); // ≈ 0.8992498
```

### Smoothing

<a name="loess" href="#loess">#</a> <b>loess</b>(<i>x</i>, <i>y</i>[, <i>options</i>])

Smooths the points (*x*[*i*], *y*[*i*]) with
[LOESS](https://en.wikipedia.org/wiki/Local_regression), returning the smoothed
y value for each point. *x* and *y* must be arrays of finite numbers of the same
length, and *x* must be sorted in ascending order (tied values are allowed). It
follows R's `lowess`, and is accurate even for large x values such as
timestamps. The *options* are:

* *bandwidth*: the fraction of the points used for each local regression, which
  must be greater than 0 and at most 1, and defaults to 0.3. Lower values follow
  the data more closely; higher values give a smoother curve. With three or more
  points, floor(*bandwidth* × *n*) must be at least 2: for example, the default
  bandwidth needs at least 7 points.
* *robustnessIterations*: the number of iterations after the initial fit that
  reduce the weight of points with large residuals, making the curve less
  sensitive to outliers. Must be a non-negative integer, and defaults to 2; use 0
  for a plain locally weighted regression.
* *accuracy*: the tolerance below which values are treated as zero, which
  defaults to 1e-12. A local regression whose x values spread less than this
  fits a flat line, and the robustness iterations stop once the median residual
  falls below it.
* *weights*: an array with a non-negative weight for each point, scaling its
  influence. Points with a weight of 0 have no influence, but are still given a
  smoothed value from their neighbours. At least one weight must be positive.
  Defaults to all 1.

```javascript
loess([1, 2, 3, 4, 5], [2, 4, 6, 8, 10], {bandwidth: 0.6}); // [2, 4, 6, 8, 10]
```

### Clustering

<a name="kmeans" href="#kmeans">#</a> <b>kmeans</b>(<i>vectors</i>, <i>options</i>)

Clusters the array of *vectors* (arrays of numbers, all the same length) with
[k-means](https://en.wikipedia.org/wiki/K-means_clustering), choosing the
initial centroids with [k-means++](https://en.wikipedia.org/wiki/K-means%2B%2B)
and iterating until the assignments stop changing. The *options* are:

* *k*: the number of clusters, which is required. There must be at least *k*
  distinct vectors.
* *distance*: the [distance](#distances) function used to assign vectors to
  centroids, which defaults to `distances.euclidean`.
* *maxIterations*: the maximum number of iterations, which defaults to 1,000.
* *random*: a source of uniform random numbers in [0, 1) for the initial
  centroids, which defaults to `Math.random`; pass a seeded generator for
  reproducible results.

Returns an object with these properties:

* *assignments*: the index of the cluster of each vector.
* *centroids*: the mean of the vectors in each cluster.
* *iterations*: the number of iterations performed.

```javascript
const {assignments} = kmeans([[0], [1], [10], [11]], {k: 2});
assignments[0] === assignments[1]; // true
assignments[0] === assignments[2]; // false
```

<a name="hcluster" href="#hcluster">#</a> <b>hcluster</b>(<i>vectors</i>[, <i>options</i>])

Clusters the array of *vectors* (arrays of numbers, all the same length) with
agglomerative [hierarchical clustering](https://en.wikipedia.org/wiki/Hierarchical_clustering),
repeatedly merging the two closest clusters. The *options* are:

* *linkage*: how the distance between two clusters is computed from the
  distances between their vectors: `"single"` (the smallest, the default),
  `"complete"` (the largest) or `"average"` (the mean).
* *distance*: the [distance](#distances) function between vectors, which
  defaults to `distances.euclidean`.

Returns the root of the binary tree of clusters. Each node has these
properties:

* *left* and *right*: the two merged clusters, or null for a leaf.
* *height*: the linkage distance between *left* and *right*, or 0 for a leaf.
* *size*: the number of vectors in the cluster.
* *depth*: the number of merges below the node.
* *index*: for a leaf, the index of its vector in *vectors*. Merged clusters are
  numbered from *n* (the number of vectors) in the order they are merged, as in
  SciPy.
* *centroid*: the mean of the vectors in the cluster.

```javascript
const root = hcluster([[1], [2], [5]], {linkage: "average"});
root.height; // 3.5
root.left.height; // 1
root.size; // 3
```

### Distances

<a name="distances" href="#distances">#</a> <b>distances</b>

Distance functions, each of which takes two arrays of the same length, for use
with [kmeans](#kmeans) and [hcluster](#hcluster).

* distances.<b>euclidean</b>: the
  [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance).
* distances.<b>manhattan</b>: the
  [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry), the sum
  of the absolute differences.
* distances.<b>chebyshev</b>: the
  [Chebyshev distance](https://en.wikipedia.org/wiki/Chebyshev_distance), the
  largest absolute difference.
* distances.<b>minkowski</b>(*p*): returns the
  [Minkowski distance](https://en.wikipedia.org/wiki/Minkowski_distance)
  function of order *p*. Order 1 is the Manhattan distance, 2 the Euclidean and
  Infinity the Chebyshev.
* distances.<b>hamming</b>: the
  [Hamming distance](https://en.wikipedia.org/wiki/Hamming_distance), the number
  of positions at which the arrays differ.
* distances.<b>jaccard</b>: the
  [Jaccard distance](https://en.wikipedia.org/wiki/Jaccard_index) between the
  arrays treated as sets, where a truthy value at position *i* means that *i* is
  a member: 1 − |*a* ∩ *b*| / |*a* ∪ *b*|, or 0 if both are empty.
* distances.<b>braycurtis</b>: the
  [Bray–Curtis dissimilarity](https://en.wikipedia.org/wiki/Bray%E2%80%93Curtis_dissimilarity),
  Σ|*a*<sub>*i*</sub> − *b*<sub>*i*</sub>| / Σ|*a*<sub>*i*</sub> + *b*<sub>*i*</sub>|,
  for non-negative values.

```javascript
distances.euclidean([0, 0], [3, 4]); // 5
distances.jaccard([1, 0, 1], [1, 1, 0]); // ≈ 0.6666667
```

### Linear algebra

Vectors are arrays of numbers, and matrices are arrays of rows.

<a name="dot" href="#dot">#</a> <b>dot</b>(<i>a</i>, <i>b</i>)

Returns the dot product of the vectors *a* and *b*, which must have the same
length.

```javascript
dot([1, 2, 3], [4, 5, 6]); // 32
```

<a name="cross" href="#cross">#</a> <b>cross</b>(<i>a</i>, <i>b</i>)

Returns the cross product of the three-dimensional vectors *a* and *b*.

```javascript
cross([1, 0, 0], [0, 1, 0]); // [0, 0, 1]
```

<a name="norm" href="#norm">#</a> <b>norm</b>(<i>a</i>)

Returns the Euclidean length of the vector *a*, without overflow or underflow
for very large or small values.

```javascript
norm([3, 4]); // 5
```

<a name="normalize" href="#normalize">#</a> <b>normalize</b>(<i>a</i>)

Returns the vector in the direction of *a* with length 1. Throws for a zero
vector.

```javascript
normalize([3, 4]); // [0.6, 0.8]
```

<a name="transpose" href="#transpose">#</a> <b>transpose</b>(<i>a</i>)

Returns the transpose of the matrix *a*.

```javascript
transpose([[1, 2, 3], [4, 5, 6]]); // [[1, 4], [2, 5], [3, 6]]
```

<a name="multiply" href="#multiply">#</a> <b>multiply</b>(<i>a</i>, <i>b</i>)

Returns the product of the matrix *a* with *b*, which is either a matrix (giving
a matrix) or a vector (giving a vector). The number of columns of *a* must equal
the number of rows of *b*.

```javascript
multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]]); // [[19, 22], [43, 50]]
multiply([[1, 2], [3, 4]], [5, 6]); // [17, 39]
```

<a name="determinant" href="#determinant">#</a> <b>determinant</b>(<i>a</i>)

Returns the determinant of the square matrix *a*, computed by LU decomposition
with partial pivoting.

```javascript
determinant([[1, 2], [3, 4]]); // -2
```

<a name="solve" href="#solve">#</a> <b>solve</b>(<i>a</i>, <i>b</i>)

Solves the linear system *a* *x* = *b* for *x*, where *a* is a square matrix and
*b* is a vector or a matrix of right-hand sides, by LU decomposition with partial
pivoting. Throws a `RangeError` if *a* is singular, treating pivots no larger
than *n* × `Number.EPSILON` × the largest magnitude in *a* as zero.

```javascript
// 2x + y = 5 and x + 3y = 10.
solve([[2, 1], [1, 3]], [5, 10]); // [1, 3]
```

<a name="inverse" href="#inverse">#</a> <b>inverse</b>(<i>a</i>)

Returns the inverse of the square matrix *a*. Throws a `RangeError` if *a* is
singular, as for [solve](#solve). To solve a linear system, use
[solve](#solve) instead, which is faster and more accurate.

```javascript
inverse([[4, 7], [2, 6]]); // [[0.6, -0.7], [-0.2, 0.4]]
```

<a name="solveTridiagonal" href="#solveTridiagonal">#</a> <b>solveTridiagonal</b>(<i>lower</i>, <i>diagonal</i>, <i>upper</i>, <i>rhs</i>)

Solves a tridiagonal system of *n* linear equations with the
[Thomas algorithm](https://en.wikipedia.org/wiki/Tridiagonal_matrix_algorithm),
where equation *i* is *lower*[*i* − 1] *x*[*i* − 1] + *diagonal*[*i*] *x*[*i*] +
*upper*[*i*] *x*[*i* + 1] = *rhs*[*i*]. *diagonal* and *rhs* have *n* elements,
and *lower* and *upper* have *n* − 1. No pivoting is done, so the system should
be, for example, diagonally dominant.

```javascript
solveTridiagonal([1, 1], [2, 2, 2], [1, 1], [3, 4, 3]); // [1, 1, 1]
```

<a name="eigen" href="#eigen">#</a> <b>eigen</b>(<i>a</i>)

Returns the eigendecomposition of the square matrix *a*, based on
[JAMA](https://math.nist.gov/javanumerics/jama/), as an object with these
properties:

* *values*: the real parts of the eigenvalues.
* *imaginary*: the imaginary parts of the eigenvalues.
* *vectors*: a matrix whose columns are the eigenvectors.

If *a* is symmetric, the eigenvalues are real and in ascending order, and the
eigenvectors are orthonormal. Otherwise, for a complex conjugate pair of
eigenvalues at positions *i* and *i* + 1, columns *i* and *i* + 1 of *vectors*
hold the real and imaginary parts of the eigenvector for the eigenvalue at
position *i*.

```javascript
const {values, vectors} = eigen([[2, 0], [0, 1]]);
values; // [1, 2]
vectors; // [[0, 1], [1, 0]]
```

### Other

<a name="quadratic" href="#quadratic">#</a> <b>quadratic</b>(<i>a</i>, <i>b</i>, <i>c</i>[, <i>options</i>])

Returns the real roots of *a**x*² + *b**x* + *c* = 0 in ascending order: two
roots, one (a repeated root), or none. If *a* is 0, the equation is solved as a
linear equation. The roots are computed so as to avoid loss of precision. With
the option *complex* set to true, the roots are returned as objects `{re, im}`
and complex roots are included, in ascending order of their imaginary parts.

```javascript
quadratic(1, 1, -2); // [-2, 1]
quadratic(1, 0, 1); // []
quadratic(1, 0, 1, {complex: true}); // [{re: 0, im: -1}, {re: 0, im: 1}]
```

<a name="EULER_GAMMA" href="#EULER_GAMMA">#</a> <b>EULER_GAMMA</b>

The [Euler–Mascheroni constant](https://en.wikipedia.org/wiki/Euler%E2%80%93Mascheroni_constant),
γ ≈ 0.5772156649015329.

<a name="version" href="#version">#</a> <b>version</b>

The version of Science.js, such as `"2.0.0"`.

## Development

To help develop Science.js, you need to have [Node.js](https://nodejs.org/)
installed. Then run the following from the root directory of this repository:

    npm install
    npm test

`npm test` builds the browser bundles in `dist/` and runs the tests. The type
definitions in `index.d.ts` are maintained by hand; the tests check that they
declare every export.

The examples in `examples/` load [D3](https://d3js.org/) from a CDN and
Science.js from `src/` as ES modules, so they must be served over HTTP. For
example, run `python3 -m http.server` in the root directory and open
<http://localhost:8000/examples/loess/loess.html>.
