require("./../lib/env-js/envjs/node");
require("./../science");
require("./../science.stats");

var data = [
  [1, 2, 3, 4, 5],
  [1, 2, 2, 3, 4, 7, 9]
];

data.forEach(function(d) {
  console.log("mode [" + d + "]:");
  console.log("  ", science.stats.mode(d));
  console.log("");
});
