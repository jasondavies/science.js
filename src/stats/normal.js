import { erfc } from "./erf.js";
import { requireFunction } from "../validate.js";

const SQRT_2PI = Math.sqrt(2 * Math.PI);

// A normal (Gaussian) distribution.
export function normal({mean = 0, sd = 1} = {}) {
  if (!Number.isFinite(mean)) throw new TypeError("mean must be a finite number.");
  if (!(sd > 0 && sd < Infinity)) throw new RangeError("sd must be a positive finite number.");

  return Object.freeze({
    mean,
    sd,
    pdf(x) {
      const z = (x - mean) / sd;
      return Math.exp(-.5 * z * z) / (sd * SQRT_2PI);
    },
    cdf(x) {
      return standardCdf((x - mean) / sd);
    },
    quantile(p) {
      if (!(p >= 0 && p <= 1)) throw new RangeError("Probabilities must be between 0 and 1.");
      return mean + sd * standardQuantile(p);
    },
    sample(random = Math.random) {
      requireFunction(random, "random");
      return mean + sd * standardSample(random);
    }
  });
}

function standardCdf(z) {
  // erfc keeps full relative precision in the lower tail.
  return .5 * erfc(-z / Math.SQRT2);
}

// Peter Acklam's rational approximation, refined with one step of Halley's
// method so that the result is accurate to full double precision.
const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00],
      b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01],
      c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00],
      d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00],
      pLow = .02425;

function standardQuantile(p) {
  if (p === 0) return -Infinity;
  if (p === 1) return Infinity;
  let x;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - pLow) {
    const q = p - .5,
          r = q * q;
    x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
         ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  // Refine using whichever tail keeps the error e precise.
  const e = x < 0 ? standardCdf(x) - p : (1 - p) - standardCdf(-x),
        u = e * SQRT_2PI * Math.exp(x * x / 2);
  return x - u / (1 + x * u / 2);
}

// The Marsaglia polar method.
function standardSample(random) {
  let x, y, s;
  do {
    x = 2 * random() - 1;
    y = 2 * random() - 1;
    s = x * x + y * y;
  } while (s >= 1 || s === 0);
  return x * Math.sqrt(-2 * Math.log(s) / s);
}
