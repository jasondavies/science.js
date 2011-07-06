require("./../lib/env-js/envjs/node");
require("./../science");
require("./../science.stats");

var data = [1, 2, 3, 4, 5, 6];

for (var i = 0; i <= data.length; i++) {
  var d = data.slice(0, i);
  console.log("iqr [" + d + "]:");
  console.log("  ", science.stats.iqr(d));
  console.log("");
}
