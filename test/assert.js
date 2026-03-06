import assert from "node:assert";
import { inspect } from "node:util";

assert.isTrue = function(actual, message) {
  assert.equal(actual, true, message);
};

assert.isUndefined = function(actual, message) {
  assert.equal(actual, undefined, message);
};

assert.inDelta = function(actual, expected, delta, message) {
  if (!inDelta(actual, expected, delta)) {
    assert.fail(message || ("expected " + inspect(actual) + " to be within " + delta + " of " + inspect(expected)));
  }
};

function inDelta(actual, expected, delta) {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    var i = -1;
    while (++i < expected.length) {
      if (!inDelta(actual[i], expected[i], delta)) return false;
    }
    return true;
  }
  return actual >= expected - delta && actual <= expected + delta;
}

export default assert;
