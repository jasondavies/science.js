import assert from "node:assert";
import { inspect } from "node:util";

assert.isTrue = (actual, message) => {
  assert.equal(actual, true, message);
};

// Asserts that actual is within delta of expected, element by element for
// (nested) arrays.
assert.inDelta = (actual, expected, delta, message) => {
  if (!inDelta(actual, expected, delta)) {
    assert.fail(message || `expected ${inspect(actual)} to be within ${delta} of ${inspect(expected)}`);
  }
};

function inDelta(actual, expected, delta) {
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length && expected.every((e, i) => inDelta(actual[i], e, delta));
  }
  return actual >= expected - delta && actual <= expected + delta;
}

export default assert;
