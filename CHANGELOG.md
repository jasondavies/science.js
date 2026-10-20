# Changelog

## 2.0.0

This release modernises the package and fixes many long-standing bugs. Several
of the fixes change results, so it is a major version. Changes before 2.0.0 are
recorded only in the git history.

### Breaking changes

* **ESM-only.** The package is now an ES module (`import science from
  "science"`, or `import { science } from "science"`), and requires Node.js 18
  or later. `require("science")` only works on Node.js 20.19+ or 22.12+, and
  returns `{ default, science }` rather than the `science` object itself.
* **Importing no longer sets a global.** `import "science"` no longer defines or
  replaces `globalThis.science`. The browser bundles still define a global
  `science`.
* **Renamed bundles.** `science.v1.js` and `science.v1.min.js` are now
  `dist/science.js` and `dist/science.min.js`. An ES module bundle,
  `dist/science.esm.js`, is also included.
* **loess validates its input**, and throws on input that was previously
  accepted silently: x values that are not sorted, values that are not finite
  numbers (including `null`, strings and booleans), weights of the wrong length,
  negative weights, all-zero weights, a bandwidth outside (0, 1], a number of
  robustness iterations that is not a non-negative integer, and a negative or
  NaN accuracy.
* **loess results change** for data with gaps in x, with zero weights, with
  large x values (such as timestamps), or whenever robustness iterations remove
  all the weight from a window; see Fixed below.
* **kde uses nrd0 for its default bandwidth** instead of nrd, as R's
  `density()` does, so default densities change slightly. Pass
  `kde.bandwidth(science.stats.bandwidth.nrd)` for the previous behaviour. kde
  now throws if the bandwidth is not positive.
* **quadratic returns roots in ascending order** whatever the sign of *a*
  (previously descending when *a* < 0), and solves linear equations when *a* is
  0.
* **gaussjordan's default pivot tolerance scales with the matrix** instead of
  being 1e-10, which changes which matrices gaussjordan and inverse treat as
  singular.
* **inverse returns undefined for singular matrices** instead of a meaningless
  matrix (for example, `[[0, 1], [1, -0.5]]` for `[[1, 2], [2, 4]]`).

### Added

* `hcluster.linkage()`, to choose single, complete or average linkage.
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
  * Tied x values are now supported.
  * The validation of finite and sorted input never took effect.
  * The `bandwidth()`, `robustnessIterations()` and `accuracy()` getters
    returned undefined.
* **hcluster** complete and average linkage gave wrong distances, and could
  produce parents closer than their children
  ([#34](https://github.com/jasondavies/science.js/issues/34); fix ported from
  Devin Lange's [jdfekete/reorder.js#48](https://github.com/jdfekete/reorder.js/pull/48)).
* **kde** returned NaN when most values were repeated
  ([#29](https://github.com/jasondavies/science.js/issues/29)).
* **quadratic** returned wrong roots for almost every equation with *b* ≠ 0
  (for example, [−2.5, 0.5] for *x*² + *x* − 2), returned non-finite roots when
  *a* was 0, and lost precision when |*b*| was much larger than |*a*| and |*c*|.
* **inverse** returned wrong results for well-conditioned matrices with small
  entries (the identity for 1e-11 × I).
* **kmeans** crashed with a TypeError when there were fewer distinct vectors
  than clusters; it now throws a clear error.
* **hypot** returned NaN for (0, 0) and for infinite values.
* **nrd0** used the second value instead of the first in its fallback, so
  `nrd0([5])` returned 0.9 instead of 4.5 (R's `bw.nrd0`).
* **mode** failed for values such as `"hasOwnProperty"` and `"__proto__"`.
* Implicit global variables leaked from `nrd0` and the Gaussian distribution.

### Thanks

Thanks to Curran Kelleher for the first LOESS documentation
([#24](https://github.com/jasondavies/science.js/pull/24)), Feynman Liang for
the loess report and fix that pointed the way
([#21](https://github.com/jasondavies/science.js/pull/21)), Devin Lange for the
hcluster fix, and everyone who reported issues.
