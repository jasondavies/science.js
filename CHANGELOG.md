# Changelog

## 2.0.0

Science.js 2.0 is a redesign. The API is now a set of plain functions that take
an options object, exported as ES modules, and many long-standing bugs are
fixed. Every function has changed, so see [Migrating from 1.x](#migrating-from-1x)
below. Changes before 2.0.0 are recorded only in the git history.

### Breaking changes

* **ESM-only, with named exports.** Import the functions you need, such as
  `import { mean, loess } from "science"`; unused functions are removed by
  bundlers. Node.js 18 or later is required. `require("science")` only works
  on Node.js 20.19+ or 22.12+.
* **Plain functions with options objects** replace the configurable D3-style
  functions: for example, `science.stats.loess().bandwidth(.2)(x, y)` is now
  `loess(x, y, {bandwidth: .2})`. Options are validated when the function is
  called, and options that are not an object (such as the positional arguments
  of 1.x) or that have unknown keys throw a `TypeError`, so that typos are not
  silently ignored.
* **Flat names.** `science.stats.*` and `science.lin.*` are now top-level
  exports, and several functions are renamed; see the table below.
* **Errors are `TypeError` or `RangeError` instances**, rather than plain
  `{error: "message"}` objects, with consistent validation of inputs throughout.
* **Inputs are never modified.** `solveTridiagonal`, which replaces `tridag`,
  returns its solution instead of writing it into an argument and modifying
  others.
* **Removed:** `expm1`, `hypot`, `functor`, `ascending` and `zeroes`, which
  duplicate `Math.expm1`, `Math.hypot` and other built-ins; `phi`, replaced by
  `normal().cdf`; and `gaussjordan`, replaced by `solve`.
* **Renamed bundles.** `science.v1.js` and `science.v1.min.js` are now
  `dist/science.js` and `dist/science.min.js`, which define a global `science`
  with the same names as the ES module, such as `science.mean`.
* **loess's `accuracy` is relative**, as in R's `lowess`: to the range of x and
  the mean absolute y value, so that results do not depend on their units.
* **Eigenvectors of non-symmetric matrices are normalised** to unit length, as
  in LAPACK.
* **Distance functions must return finite values** in `kmeans` and `hcluster`,
  which throw a `RangeError` otherwise, as SciPy does.
* **Results change** where 1.x was wrong; see Fixed below.

### Added

* Type definitions for TypeScript (`index.d.ts`).
* `solve`, for linear systems.
* `determinant` for matrices of any size (previously 4 × 4 only).
* `quantile`, `standardDeviation` and `erfc`.
* `normal` distributions now have a `quantile` method, and take a standard
  deviation (`sd`) rather than a variance.
* `kmeans` uses k-means++ initialisation, accepts a seeded random source, and
  reports the number of iterations.
* `hcluster` supports complete and average linkage, and numbers its nodes with
  an `index` (as requested in [#17](https://github.com/jasondavies/science.js/issues/17)).
* `loess` supports tied x values.
* Documentation of the whole API in the README.
* GitHub Actions CI, testing Node.js 18.0.0 to 24 and the packed package.

### Fixed

* **loess**
  * NaN results when robustness iterations or zero weights left a window with no
    weight ([#19](https://github.com/jasondavies/science.js/issues/19),
    reported by Feynman Liang in
    [#21](https://github.com/jasondavies/science.js/pull/21)).
  * The window could move at most one point at a time, so after a gap in x
    every later fit used neighbours from one side only. Windows are now centred
    on each x, as in R's `lowess`.
  * Leading zero weights collapsed the window to a single point, returning the
    input unchanged. Zero-weight points are now fitted from their neighbours.
  * Large x values lost precision; for example, millisecond timestamps with an
    exactly linear y gave errors of up to 11.5.
  * Invalid input, such as unsorted x values, was accepted silently.
* **hcluster** complete and average linkage gave wrong distances, and could
  produce parents closer than their children
  ([#34](https://github.com/jasondavies/science.js/issues/34); fix ported from
  Devin Lange's [jdfekete/reorder.js#48](https://github.com/jdfekete/reorder.js/pull/48)).
  A single vector now gives a leaf rather than undefined.
* **kde** returned NaN when most values were repeated
  ([#29](https://github.com/jasondavies/science.js/issues/29)); its default
  bandwidth is now nrd0, as in R's `density`.
* **erf** was accurate to only 1.5 × 10<sup>−7</sup>, so that, for example, the
  normal cdf at 0 was 0.5000000005. It is now accurate to about 1e-15.
* **mean** returned NaN when a value was infinite, and **median** and
  **quantile** could overflow for values of opposite sign and very large
  magnitude.
* **The Jaccard distance** returned the proportion of equal positions, which is
  a similarity, so it ranked vectors backwards when used as a distance.
* **quadratic** returned wrong roots for almost every equation with *b* ≠ 0
  (for example, [−2.5, 0.5] for *x*² + *x* − 2), returned non-finite roots when
  *a* was 0, lost precision when |*b*| was much larger than |*a*| and |*c*|, and
  overflowed for very large or small coefficients.
* **inverse** returned wrong results for well-conditioned matrices with small
  entries (the identity for 1e-11 × I), and a meaningless matrix for singular
  ones; it now throws for singular matrices.
* **The eigendecomposition** could loop forever when its iteration stalled (for
  example, for `[[-1, 1, 0], [-1, -1, 1], [0, -1, -1]]`), overflowed for very
  large entries, gave eigenvectors with entries as large as 10<sup>16</sup> for
  defective matrices, and left a stray `-1` property on its first row.
* **nrd0** used the second value instead of the first in its fallback. The
  bandwidth selectors now need at least two values, as in R.
* **mode** failed for values such as `"hasOwnProperty"` and `"__proto__"`, and
  treated `1` and `"1"` as the same value.
* **kmeans** crashed with a TypeError when there were fewer distinct vectors
  than clusters.
* The `bandwidth()`, `robustnessIterations()` and `accuracy()` getters of loess
  returned undefined, and implicit global variables leaked from several
  functions.

### Migrating from 1.x

| 1.x | 2.0 |
| --- | --- |
| `science.stats.mean(x)`, `median`, `variance`, `iqr` | `mean(x)`, `median`, `variance`, `iqr` (`variance` of one value is now NaN, as in R) |
| `science.stats.quantiles(x, ps)` | `quantiles(x, ps)`, or `quantile(x, p)` for one |
| `science.stats.mode(x)` | `modes(x)`, which returns every most frequent value |
| `science.stats.erf(x)` | `erf(x)` |
| `science.stats.phi(x)` | `normal().cdf(x)` |
| `science.stats.distribution.gaussian().mean(m).variance(v)` | `normal({mean: m, sd: Math.sqrt(v)})` |
| `gaussian()` (a sample) | `normal().sample()` |
| `science.stats.loess().bandwidth(b)(x, y, w)` | `loess(x, y, {bandwidth: b, weights: w})` |
| `science.stats.kde().sample(s).bandwidth(h)(points)` | `const density = kde(s, {bandwidth: h}); points.map(density)` (the density, not `[x, density]` pairs) |
| `science.stats.kernel.*`, `science.stats.bandwidth.*` | `kernels.*`, `bandwidths.*` |
| `science.stats.distance.*` | `distances.*` |
| `science.stats.kmeans().k(k)(vectors)` | `kmeans(vectors, {k})` |
| `science.stats.hcluster()(vectors)` | `hcluster(vectors)`; node `dist` is now `height` |
| `science.lin.dot`, `cross`, `transpose`, `multiply`, `normalize` | `dot`, `cross`, `transpose`, `multiply` (which also accepts a vector), `normalize` |
| `science.lin.length(v)` | `norm(v)` |
| `science.lin.determinant(m)` | `determinant(m)`, for any square matrix |
| `science.lin.inverse(m)` | `inverse(m)`, which throws for a singular matrix |
| `science.lin.gaussjordan(m)` | `solve(a, b)` |
| `science.lin.tridag(a, b, c, d, x, n)` | `x = solveTridiagonal(lower, diagonal, upper, rhs)`, where `lower` and `upper` have *n* − 1 elements |
| `science.lin.decompose()(a)` returning `{D, V}` | `eigen(a)` returning `{values, imaginary, vectors}` |
| `science.quadratic()(a, b, c)`, `.complex(true)` | `quadratic(a, b, c)`, `{complex: true}`; complex roots are `{re, im}` |
| `science.EULER` | `EULER_GAMMA` |
| `science.expm1`, `hypot` | `Math.expm1`, `Math.hypot` |
| `science.functor`, `ascending`, `zeroes` | Removed |

### Thanks

Thanks to Curran Kelleher for the first LOESS documentation
([#24](https://github.com/jasondavies/science.js/pull/24)), Feynman Liang for
the loess report and fix that pointed the way
([#21](https://github.com/jasondavies/science.js/pull/21)), Devin Lange for the
hcluster fix, Samuel Gratzl for the ES module fork that showed the way to named
exports, and everyone who reported issues.
