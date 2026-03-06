require("../../science.v1");

const test = require("node:test");
const assert = require("../assert");

test("science.ascending sorts in ascending order", function() {
  var a = [1, 4, 5, 2, 3, 6];
  a.sort(science.ascending);
  assert.deepEqual(a, [1, 2, 3, 4, 5, 6]);
});
