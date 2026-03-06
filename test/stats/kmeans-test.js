import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.stats.kmeans simple", function() {
  var data = [],
      i;
  for (i = 0; i < 100; i++) {
    data.push([Math.random(), Math.random()]);
  }
  for (i = 0; i < 100; i++) {
    data.push([10 + Math.random(), 10 + Math.random()]);
  }
  var x = science.stats.kmeans().k(2)(data);
  var cluster0 = x.assignments[0];
  for (i = 0; i < 100; i++) {
    assert.equal(x.assignments[i], cluster0);
  }
  for (i = 100; i < 200; i++) {
    assert.equal(x.assignments[i], 1 - cluster0);
  }
});

test("science.stats.kmeans fails with too few distinct vectors", function() {
  var threw = false;
  try {
    science.stats.kmeans().k(3)([[1], [1], [1]]);
  } catch (e) {
    threw = true;
    assert.equal(e.error, "Not enough distinct vectors for k clusters.");
  }
  assert.isTrue(threw);
});
