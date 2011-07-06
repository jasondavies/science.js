require("./../lib/env-js/envjs/node");
require("./../science");
require("./../science.stats");

var data = [1, 2, 3, 4];

console.log("nrd0:");
console.log("  ", science.stats.bandwidth.nrd0(data));
console.log("");

console.log("nrd:");
console.log("  ", science.stats.bandwidth.nrd(data));
console.log("");
