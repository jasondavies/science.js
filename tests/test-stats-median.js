require("./../lib/env-js/envjs/node");
require("./../science");
require("./../science.stats");

var data = [1, 2, 3, 4, 5];

for (var i = 0; i <= data.length; i++) {
  var d = data.slice(0, i);
  console.log("median [" + d + "]:");
  console.log("  ", science.stats.median(d));
  console.log("");
}
