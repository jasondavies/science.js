# Science.js

Science.js is a JavaScript library for scientific and statistical computing.

Currently, there are two modules:

 * `science.stats`, containing various implementations of statistical methods
   similar to those provided by [R](http://www.r-project.org/);
 * `science.lin`, for linear algebra.

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
