# Science.js

Science.js is a JavaScript library for scientific and statistical computing.

Currently, there are two modules:

 * `science.stats`, containing various implementations of statistical methods
   similar to those provided by [R](http://www.r-project.org/);
 * `science.lin`, for linear algebra.

## API Documentation

<a name="loess" href="#loess">#</a>stats.<b>loess</b>()

Constructs a [LOESS](https://en.wikipedia.org/wiki/Local_regression) curve generator instance.

```javascript
var myLoess = science.stats.loess();
```

<a name="loess_bandwidth" href="#loess_bandwidth">#</a> <i>loess</i>.<b>bandwidth</b>(<i>bandwidth</i>)

Specifies the [bandwidth (smoothing parameter)](https://en.wikipedia.org/wiki/Local_regression#Localized_subsets_of_data) that controls how fine or coarse the smoothing is. Lower values fit the curve closer to the data, higher values make the curve more straight.

```javascript
myLoess.bandwidth(0.2);
```

<a name="_loess" href="#_loess">#</a> <i>loess</i>(<i>xValues</i>,<i>yValues</i>)

Invokes the LOESS algorithm to generate the smoothed curve. Accepts as input two arrays of values in data space. These two arrays must be of the same length. Returns an array of smoothed Y values that has the same number of elements as the input arrays.

```javascript
var yValuesSmooth = myLoess(xValues, yValues);
```

## Development

To help develop Science.js, you need to have [Node.js](http://www.nodejs.org)
and [NPM](http://www.npmjs.org) installed. Once you have done that, run the
following from the root directory of this repository to install the development
dependencies:

    make install

## Thanks

I originally started this in order to add a reusable statistics module to
[D3.js](http://mbostock.github.com/d3/), but now it's grown into a whole new
project of its own!

The project structure and Makefile is based on that of D3, so a big thank you
goes to [Mike Bostock](http://bost.ocks.org/mike/) for this.
