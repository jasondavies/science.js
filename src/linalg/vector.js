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
  let max = 0;
  for (let i = 0; i < a.length; i++) max = Math.max(max, Math.abs(a[i]));
  if (max === 0) return 0;
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] / max;
    s += x * x;
  }
  return max * Math.sqrt(s);
}

export function normalize(a) {
  const length = norm(a);
  if (length === 0) throw new RangeError("A zero vector cannot be normalised.");
  return Array.from(a, (x) => x / length);
}
