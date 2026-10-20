import { requireArray } from "../validate.js";

// The arithmetic mean, computed incrementally so that large values do not
// overflow.
export function mean(values) {
  requireArray(values, "values");
  const n = values.length;
  if (n === 0) return NaN;
  let m = 0;
  for (let i = 0; i < n; i++) m += (values[i] - m) / (i + 1);
  return m;
}

// The unbiased sample variance (with denominator n - 1), using Welford's
// algorithm.
export function variance(values) {
  requireArray(values, "values");
  const n = values.length;
  if (n < 2) return NaN;
  let m = 0,
      s = 0;
  for (let i = 0; i < n; i++) {
    const d = values[i] - m;
    m += d / (i + 1);
    s += d * (values[i] - m);
  }
  return s / (n - 1);
}

export function standardDeviation(values) {
  return Math.sqrt(variance(values));
}

function sorted(values) {
  requireArray(values, "values");
  return Array.from(values).sort((a, b) => a - b);
}

function requireProbability(p) {
  if (!(p >= 0 && p <= 1)) throw new RangeError("Probabilities must be between 0 and 1.");
}

// R's quantile type 7: linear interpolation between the sorted values.
function quantileSorted(s, p) {
  const n = s.length;
  if (n === 0) return NaN;
  const index = p * (n - 1),
        lo = Math.floor(index),
        h = index - lo;
  return h === 0 ? s[lo] : s[lo] + h * (s[lo + 1] - s[lo]);
}

export function quantile(values, p) {
  requireProbability(p);
  return quantileSorted(sorted(values), p);
}

export function quantiles(values, probabilities) {
  requireArray(probabilities, "probabilities");
  for (let i = 0; i < probabilities.length; i++) requireProbability(probabilities[i]);
  const s = sorted(values);
  return Array.from(probabilities, (p) => quantileSorted(s, p));
}

export function median(values) {
  return quantile(values, .5);
}

export function iqr(values) {
  const [q1, q3] = quantiles(values, [.25, .75]);
  return q3 - q1;
}

// All of the most frequent values, in the order they first appear. Values are
// compared with SameValueZero, as in a Map.
export function modes(values) {
  requireArray(values, "values");
  const counts = new Map();
  let max = 0;
  for (let i = 0; i < values.length; i++) {
    const count = (counts.get(values[i]) || 0) + 1;
    counts.set(values[i], count);
    if (count > max) max = count;
  }
  const result = [];
  for (const [value, count] of counts) if (count === max) result.push(value);
  return result;
}
