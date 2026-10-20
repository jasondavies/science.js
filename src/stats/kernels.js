// Module-local, as reading an imported binding in a hot function is slower.
const INVERSE_SQRT_2PI = 1 / Math.sqrt(2 * Math.PI);

// Kernel functions, each of which integrates to 1.
// See https://en.wikipedia.org/wiki/Kernel_(statistics).
export const kernels = Object.freeze({
  uniform(u) {
    return Math.abs(u) <= 1 ? .5 : 0;
  },

  triangular(u) {
    return Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0;
  },

  epanechnikov(u) {
    return Math.abs(u) <= 1 ? .75 * (1 - u * u) : 0;
  },

  quartic(u) {
    if (Math.abs(u) > 1) return 0;
    const t = 1 - u * u;
    return 15 / 16 * t * t;
  },

  triweight(u) {
    if (Math.abs(u) > 1) return 0;
    const t = 1 - u * u;
    return 35 / 32 * t * t * t;
  },

  gaussian(u) {
    return Math.exp(-.5 * u * u) * INVERSE_SQRT_2PI;
  },

  cosine(u) {
    return Math.abs(u) <= 1 ? Math.PI / 4 * Math.cos(Math.PI / 2 * u) : 0;
  }
});
