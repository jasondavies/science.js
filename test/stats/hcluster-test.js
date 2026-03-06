import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.stats.hcluster simple", function() {
  var data = [],
      i;
  for (i = 0; i < 100; i++) {
    data.push([Math.random(), Math.random()]);
  }
  for (i = 0; i < 100; i++) {
    data.push([10 + Math.random(), 10 + Math.random()]);
  }
  var x = science.stats.hcluster()(data);
  assert.equal(x.left.size, 100);
  assert.equal(x.right.size, 100);
});
