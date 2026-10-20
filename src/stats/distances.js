import { powerOfTwoNear, scaledNorm } from "../numeric.js";
import { requireArray, requireSameLength } from "../validate.js";

function check(a, b) {
  requireArray(a, "a");
  requireArray(b, "b");
  requireSameLength(a, b);
}

// Whether a sum of powers can be used as it is: otherwise it overflowed, or may
// have underflowed, so the distance is computed again with scaling.
function safe(s) {
  return s > 1e-290 && s < 1e290;
}

// Distance functions between two arrays of the same length.
export const distances = Object.freeze({
  euclidean(a, b) {
    check(a, b);
    let s = 0;
    for (let i = 0; i < a.length; i++) {
      const x = a[i] - b[i];
      s += x * x;
    }
    return safe(s) ? Math.sqrt(s) : scaledNorm(a.length, (i) => a[i] - b[i]);
  },

  manhattan(a, b) {
    check(a, b);
    let s = 0;
    for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
    return s;
  },

  chebyshev(a, b) {
    check(a, b);
    let max = 0;
    for (let i = 0; i < a.length; i++) max = Math.max(max, Math.abs(a[i] - b[i]));
    return max;
  },

  // Returns the Minkowski distance function of order p.
  minkowski(p) {
    if (!(p > 0)) throw new RangeError("p must be positive.");
    if (p === Infinity) return distances.chebyshev;
    return function(a, b) {
      check(a, b);
      let s = 0;
      for (let i = 0; i < a.length; i++) s += Math.pow(Math.abs(a[i] - b[i]), p);
      return safe(s) ? Math.pow(s, 1 / p) : scaledNorm(a.length, (i) => a[i] - b[i], p);
    };
  },

  // The number of positions at which a and b differ.
  hamming(a, b) {
    check(a, b);
    let d = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
    return d;
  },

  // The Jaccard distance between a and b treated as sets, where a truthy value
  // at position i means that i is a member: 1 - |a ∩ b| / |a ∪ b|. Two empty
  // sets are at distance 0.
  jaccard(a, b) {
    check(a, b);
    let intersection = 0,
        union = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] || b[i]) union++;
      if (a[i] && b[i]) intersection++;
    }
    return union ? (union - intersection) / union : 0;
  },

  // The Bray–Curtis dissimilarity, for non-negative values.
  braycurtis(a, b) {
    check(a, b);
    let s0 = 0,
        s1 = 0;
    for (let i = 0; i < a.length; i++) {
      s0 += Math.abs(a[i] - b[i]);
      s1 += Math.abs(a[i] + b[i]);
    }
    if (Number.isFinite(s0) && Number.isFinite(s1)) return s0 / s1;
    // A sum overflowed; the ratio is the same with both arrays scaled down.
    let max = 0;
    for (let i = 0; i < a.length; i++) max = Math.max(max, Math.abs(a[i]), Math.abs(b[i]));
    if (!Number.isFinite(max)) return s0 / s1;
    const scale = powerOfTwoNear(max);
    s0 = s1 = 0;
    for (let i = 0; i < a.length; i++) {
      s0 += Math.abs(a[i] / scale - b[i] / scale);
      s1 += Math.abs(a[i] / scale + b[i] / scale);
    }
    return s0 / s1;
  }
});
