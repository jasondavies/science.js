import { powerOfTwoNear } from "../numeric.js";
import { requireArray, requireProbability } from "../validate.js";

function requireNumber(v) {
  if (typeof v !== "number") throw new TypeError("values must contain only numbers.");
}

// The arithmetic mean. If the sum of finite values overflows, each value is
// divided by n before summing instead.
export function mean(values) {
  requireArray(values, "values");
  const n = values.length;
  if (n === 0) return NaN;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const v = values[i];
    requireNumber(v);
    sum += v;
  }
  if (Number.isFinite(sum) || !allFinite(values)) return sum / n;
  let m = 0;
  for (let i = 0; i < n; i++) m += values[i] / n;
  return m;
}

// The unbiased sample variance (with denominator n - 1), using Welford's
// algorithm. If that overflows for finite values, it is computed again from
// the values scaled by a power of 2.
export function variance(values) {
  requireArray(values, "values");
  const n = values.length;
  if (n < 2) return NaN;
  for (let i = 0; i < n; i++) requireNumber(values[i]);
  const v = welford(values, 1);
  if (Number.isFinite(v) || !allFinite(values)) return v;
  let max = 0;
  for (let i = 0; i < n; i++) max = Math.max(max, Math.abs(values[i]));
  const scale = powerOfTwoNear(max);
  return welford(values, scale) * scale * scale;
}

function welford(values, scale) {
  let m = 0,
      s = 0;
  for (let i = 0; i < values.length; i++) {
    const x = values[i] / scale,
          d = x - m;
    m += d / (i + 1);
    s += d * (x - m);
  }
  return s / (values.length - 1);
}

function allFinite(values) {
  for (let i = 0; i < values.length; i++) if (!Number.isFinite(values[i])) return false;
  return true;
}

export function standardDeviation(values) {
  return Math.sqrt(variance(values));
}

function sorted(values) {
  requireArray(values, "values");
  const s = Array.from(values);
  for (let i = 0; i < s.length; i++) requireNumber(s[i]);
  return s.sort((a, b) => a - b);
}

// R's quantile type 7: linear interpolation between the sorted values.
function quantileSorted(s, p) {
  const n = s.length;
  if (n === 0) return NaN;
  const index = p * (n - 1),
        lo = Math.floor(index),
        h = index - lo;
  if (h === 0) return s[lo];
  const d = s[lo + 1] - s[lo];
  // If the difference overflows (or the values are infinite), interpolate
  // without it.
  return Number.isFinite(d) ? s[lo] + h * d : (1 - h) * s[lo] + h * s[lo + 1];
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
