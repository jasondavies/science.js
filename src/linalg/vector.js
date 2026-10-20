import { scaledNorm } from "../numeric.js";
import { requireFiniteNumbers, requireSameLength } from "../validate.js";

export function dot(a, b) {
  requireFiniteNumbers(a, "a");
  requireFiniteNumbers(b, "b");
  requireSameLength(a, b);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function cross(a, b) {
  requireFiniteNumbers(a, "a");
  requireFiniteNumbers(b, "b");
  if (a.length !== 3 || b.length !== 3) throw new RangeError("The cross product needs two vectors of length 3.");
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

// The Euclidean norm, scaled by the largest element so that it neither
// overflows nor underflows.
export function norm(a) {
  requireFiniteNumbers(a, "a");
  return scaledNorm(a.length, (i) => a[i]);
}

export function normalize(a) {
  const length = norm(a);
  if (length === 0) throw new RangeError("A zero vector cannot be normalised.");
  return Array.from(a, (x) => x / length);
}
