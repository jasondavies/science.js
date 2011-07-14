require("./../lib/env-js/envjs/node");
require("./../science");

var max = Number.MAX_VALUE / Math.sqrt(2);
console.log("hypot", science.hypot(max, max));
