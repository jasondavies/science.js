const TWO_OVER_SQRT_PI = 2 / Math.sqrt(Math.PI);

// The error function.
export function erf(x) {
  if (Number.isNaN(x) || x === 0) return x;
  const a = Math.abs(x),
        y = a < .5 ? erfSeries(a) : 1 - erfcPositive(a);
  return x < 0 ? -y : y;
}

// The complementary error function, 1 - erf(x), accurate for large x where
// 1 - erf(x) would lose all precision.
export function erfc(x) {
  if (Number.isNaN(x)) return NaN;
  if (x <= -.5) return 2 - erfcPositive(-x);
  if (x < .5) return 1 - erf(x);
  return erfcPositive(x);
}

// erf(x) = 2/sqrt(pi) exp(-x^2) sum 2^n x^(2n+1) / (1 3 5 ... (2n+1)), for
// x >= 0. Every term is positive, so there is no cancellation; for x < 0.5 it
// converges within about 15 terms.
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

// Chebyshev coefficients of g(u) = ln(erfc(z) exp(z^2) / t), where t = 2/(2 + z)
// and u = 2t - 1, as in Numerical Recipes' erfccheb, but in four pieces
// covering u in [-1, 0.6] (z >= 0.5), each of width 0.4. They were computed with
// mpmath at 50 digits; the omitted terms are below 2e-18.
const G = [
  [
    -2.3194577541483, 0.10773148055689316, 0.0019579096098603574,
    7.6647902563401e-06, -2.122801400080643e-06, -1.1305154404718577e-07,
    -6.762761498894301e-10, 2.6138817645357993e-10, 1.4170816340307623e-11,
    -1.9981614162290126e-13, -5.821735255347536e-14, -1.6850633885159191e-15,
    1.6460316501217129e-16, 1.3207093734421784e-17
  ],
  [
    -1.8576530907291056, 0.12302299515368256, 0.0017771289704500788,
    -4.210821648466003e-05, -3.776632118610938e-06, -1.300310609753077e-08,
    8.810616835450316e-09, 1.9885336516158347e-10, -2.3476967438473282e-11,
    -8.967629855128368e-13, 7.243191744414293e-14, 3.397241565926125e-15,
    -2.603268781963852e-16, -1.1496959904090988e-17
  ],
  [
    -1.3417062129189457, 0.1342490198693356, 0.0009390205857296584,
    -9.291846698333768e-05, -1.9535147489760565e-06, 1.7326256785532582e-07,
    3.4936548212218308e-09, -4.572261996640394e-10, -3.1031989613964023e-12,
    1.3095062244049796e-12, -1.7087385345951227e-14, -3.403537234895309e-15,
    1.3455374073326626e-16, 6.345670160970927e-18
  ],
  [
    -0.7971386149285049, 0.1370419470797222, -0.0002457635734330582,
    -9.598165327468248e-05, 1.4065261981649073e-06, 1.2625440891936126e-07,
    -5.609519603377978e-09, -9.751993377779212e-11, 1.511495020128536e-11,
    -2.9670018619853556e-13, -2.4028482526024857e-14, 1.6078046430711497e-15,
    -6.526577633450537e-18, -3.5570449501543785e-18
  ]
];

// erfc(z) = t exp(-z^2 + g(u)), for z >= 0.5.
function erfcPositive(z) {
  if (z === Infinity) return 0;
  const t = 2 / (2 + z),
        u = 2 * t - 1,
        piece = Math.min(3, Math.floor((u + 1) / .4)),
        s = (u + .8 - .4 * piece) / .2,
        c = G[piece];
  // Clenshaw's recurrence for the sum of c[j] T_j(s), with the first term
  // halved.
  let b1 = 0,
      b2 = 0;
  for (let j = c.length - 1; j > 0; j--) {
    const b = 2 * s * b1 - b2 + c[j];
    b2 = b1;
    b1 = b;
  }
  const g = s * b1 - b2 + c[0] / 2;
  if (z < 2) return t * Math.exp(g - z * z);
  // Split z so that the square of the larger part is exact, keeping exp(-z^2)
  // accurate for large z.
  const zh = Math.round(z * 16) / 16;
  return t * Math.exp(-zh * zh) * Math.exp(g - (z - zh) * (z + zh));
}
