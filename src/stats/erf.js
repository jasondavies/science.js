const TWO_OVER_SQRT_PI = 2 / Math.sqrt(Math.PI),
      ONE_OVER_SQRT_PI = 1 / Math.sqrt(Math.PI);

// erf is computed from a power series below ERF_SERIES_LIMIT, and erfc from a
// continued fraction above ERFC_FRACTION_LIMIT; otherwise each is computed from
// the other.
const ERF_SERIES_LIMIT = 2,
      ERFC_FRACTION_LIMIT = 1;

// The error function.
export function erf(x) {
  if (Number.isNaN(x) || x === 0) return x;
  const a = Math.abs(x),
        y = a < ERF_SERIES_LIMIT ? erfSeries(a) : 1 - erfcContinuedFraction(a);
  return x < 0 ? -y : y;
}

// The complementary error function, 1 - erf(x), accurate for large x where
// 1 - erf(x) would lose all precision.
export function erfc(x) {
  if (Number.isNaN(x)) return NaN;
  return x < ERFC_FRACTION_LIMIT ? 1 - erf(x) : erfcContinuedFraction(x);
}

// erf(x) = 2/sqrt(pi) exp(-x^2) sum 2^n x^(2n+1) / (1 3 5 ... (2n+1)), for
// x >= 0. Every term is positive, so there is no cancellation.
function erfSeries(x) {
  const x2 = 2 * x * x;
  let term = x,
      sum = x;
  for (let n = 1; term > sum * 1e-17; n++) {
    term *= x2 / (2 * n + 1);
    sum += term;
  }
  return TWO_OVER_SQRT_PI * Math.exp(-x * x) * sum;
}

// erfc(x) = exp(-x^2)/sqrt(pi) / (x + (1/2)/(x + 1/(x + (3/2)/(x + ...)))), for
// x > 0, evaluated with the modified Lentz algorithm.
function erfcContinuedFraction(x) {
  if (x === Infinity) return 0;
  const tiny = 1e-300;
  let f = x,
      c = x,
      d = 0;
  for (let k = 1; k < 1000; k++) {
    const a = k / 2;
    d = x + a * d;
    if (d === 0) d = tiny;
    c = x + a / c;
    if (c === 0) c = tiny;
    d = 1 / d;
    const delta = c * d;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }
  // Split x so that the square of the larger part is exact, keeping exp(-x^2)
  // accurate for large x.
  const xh = Math.round(x * 16) / 16;
  return ONE_OVER_SQRT_PI * Math.exp(-xh * xh) * Math.exp(-(x - xh) * (x + xh)) / f;
}
