// A seeded pseudo-random number generator (Park–Miller), for reproducible
// tests.
export function seededRandom(seed = 1) {
  return () => (seed = seed * 16807 % 2147483647) / 2147483647;
}
