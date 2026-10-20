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

## API Documentation

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

If the input or configuration is invalid, an object of the form `{error: "message"}` is thrown (not an `Error` instance). An invalid bandwidth, number of robustness iterations or accuracy is reported when the generator is invoked, not when it is set.

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
