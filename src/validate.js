// Input checks shared by the public functions.

export function requireArray(values, name) {
  if (values == null || typeof values !== "object" || typeof values.length !== "number") {
    throw new TypeError(`${name} must be an array.`);
  }
}

export function requireFiniteNumbers(values, name) {
  requireArray(values, name);
  for (let i = 0; i < values.length; i++) {
    if (!Number.isFinite(values[i])) throw new TypeError(`${name} must contain only finite numbers.`);
  }
}

export function requireFunction(f, name) {
  if (typeof f !== "function") throw new TypeError(`${name} must be a function.`);
}

export function requireSameLength(a, b) {
  if (a.length !== b.length) throw new RangeError("Arrays must have the same length.");
}

// Requires a non-empty rectangular matrix of finite numbers, returning its
// dimensions.
export function requireMatrix(m, name) {
  requireArray(m, name);
  if (!m.length) throw new RangeError(`${name} must have at least one row.`);
  const columns = m[0] == null ? undefined : m[0].length;
  for (let i = 0; i < m.length; i++) {
    requireFiniteNumbers(m[i], `Each row of ${name}`);
    if (m[i].length !== columns) throw new RangeError(`All rows of ${name} must have the same length.`);
  }
  if (!columns) throw new RangeError(`${name} must have at least one column.`);
  return [m.length, columns];
}

export function requireSquareMatrix(m, name) {
  const [rows, columns] = requireMatrix(m, name);
  if (rows !== columns) throw new RangeError(`${name} must be square.`);
  return rows;
}

// Requires options to be undefined or an object with only the given keys, so
// that misspelt options and positional arguments are not silently ignored.
// Returns the options, or an empty object.
export function checkOptions(options, keys, name) {
  if (options === undefined) return {};
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError(`The options for ${name} must be an object.`);
  }
  for (const key in options) {
    if (!keys.includes(key)) throw new TypeError(`Unknown option for ${name}: ${key}`);
  }
  return options;
}

export function requireProbability(p) {
  if (!(p >= 0 && p <= 1)) throw new RangeError("Probabilities must be between 0 and 1.");
}

// Calls the distance function, requiring a finite result: a NaN or infinite
// distance would leave no well-defined closest cluster. SciPy's linkage rejects
// them too.
export function finiteDistance(distance, a, b) {
  const d = distance(a, b);
  if (!Number.isFinite(d)) throw new RangeError(`The distance between two vectors is ${d}; distances must be finite.`);
  return d;
}
