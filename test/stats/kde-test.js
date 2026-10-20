import science from "../../index.js";
import test from "node:test";
import assert from "../assert.js";

test("science.stats.kde computes the density with the given bandwidth", function() {
  var sample = [1, 2, 4],
      kde = science.stats.kde().sample(sample).bandwidth(.5),
      expected = sample.reduce(function(y, x) { return y + science.stats.kernel.gaussian((2 - x) / .5); }, 0) / (3 * .5);
  assert.inDelta(kde([2])[0], [2, expected], 1e-15);
});

test("science.stats.kde uses nrd0 for the default bandwidth", function() {
  var sample = [1, 4, 3, 2];
  assert.equal(science.stats.kde().bandwidth()(sample), science.stats.bandwidth.nrd0(sample));
});

test("science.stats.kde handles samples with many repeated values", function() {
  var sample = [1, 2, 3, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      points = [],
      x;
  for (x = -5; x <= 11; x += .01) points.push(x);
  var density = science.stats.kde().sample(sample)(points),
      area = 0;
  density.forEach(function(d) {
    assert.isTrue(isFinite(d[1]) && d[1] >= 0);
    area += d[1] * .01;
  });
  assert.inDelta(area, 1, 1e-3);
});

test("science.stats.kde rejects a bandwidth that is not positive", function() {
  var kde = science.stats.kde().sample([1, 2, 3]),
      error = {error: "Bandwidth must be positive."};
  assert.throws(function() { kde.bandwidth(0)([1]); }, error);
  assert.throws(function() { kde.bandwidth(science.stats.bandwidth.nrd).sample([5, 5, 5, 5, 1])([1]); }, error);
});
