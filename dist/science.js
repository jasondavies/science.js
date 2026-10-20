var science = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    EULER_GAMMA: () => EULER_GAMMA,
    bandwidths: () => bandwidths,
    cross: () => cross,
    determinant: () => determinant,
    distances: () => distances,
    dot: () => dot,
    eigen: () => eigen,
    erf: () => erf,
    erfc: () => erfc,
    hcluster: () => hcluster,
    inverse: () => inverse,
    iqr: () => iqr,
    kde: () => kde,
    kernels: () => kernels,
    kmeans: () => kmeans,
    loess: () => loess,
    mean: () => mean,
    median: () => median,
    modes: () => modes,
    multiply: () => multiply,
    norm: () => norm,
    normal: () => normal,
    normalize: () => normalize,
    quadratic: () => quadratic,
    quantile: () => quantile,
    quantiles: () => quantiles,
    solve: () => solve,
    solveTridiagonal: () => solveTridiagonal,
    standardDeviation: () => standardDeviation,
    transpose: () => transpose,
    variance: () => variance,
    version: () => version
  });

  // src/version.js
  var version = "2.0.0";

  // src/constants.js
  var EULER_GAMMA = 0.5772156649015329;

  // src/quadratic.js
  function quadratic(a2, b2, c2, { complex = false } = {}) {
    if (!Number.isFinite(a2) || !Number.isFinite(b2) || !Number.isFinite(c2)) {
      throw new TypeError("Coefficients must be finite numbers.");
    }
    const real = (roots) => complex ? roots.map((re) => ({ re, im: 0 })) : roots;
    if (a2 === 0) {
      return real(b2 === 0 ? [] : [-c2 / b2]);
    }
    const d2 = b2 * b2 - 4 * a2 * c2, rb = -b2 / (2 * a2);
    if (d2 > 0) {
      const q = -(b2 + (b2 < 0 ? -1 : 1) * Math.sqrt(d2)) / 2, r1 = q / a2, r2 = c2 / q;
      return real(r1 < r2 ? [r1, r2] : [r2, r1]);
    }
    if (d2 === 0) return real([rb]);
    if (!complex) return [];
    const im = Math.sqrt(-d2) / (2 * Math.abs(a2));
    return [{ re: rb, im: -im }, { re: rb, im }];
  }

  // src/validate.js
  function requireArray(values, name) {
    if (values == null || typeof values !== "object" || typeof values.length !== "number") {
      throw new TypeError(`${name} must be an array.`);
    }
  }
  function requireFiniteNumbers(values, name) {
    requireArray(values, name);
    for (let i = 0; i < values.length; i++) {
      if (!Number.isFinite(values[i])) throw new TypeError(`${name} must contain only finite numbers.`);
    }
  }
  function requireFunction(f, name) {
    if (typeof f !== "function") throw new TypeError(`${name} must be a function.`);
  }
  function requireSameLength(a2, b2) {
    if (a2.length !== b2.length) throw new RangeError("Arrays must have the same length.");
  }
  function requireMatrix(m, name) {
    requireArray(m, name);
    if (!m.length) throw new RangeError(`${name} must have at least one row.`);
    const columns = m[0] == null ? void 0 : m[0].length;
    for (let i = 0; i < m.length; i++) {
      requireFiniteNumbers(m[i], `Each row of ${name}`);
      if (m[i].length !== columns) throw new RangeError(`All rows of ${name} must have the same length.`);
    }
    if (!columns) throw new RangeError(`${name} must have at least one column.`);
    return [m.length, columns];
  }
  function requireSquareMatrix(m, name) {
    const [rows, columns] = requireMatrix(m, name);
    if (rows !== columns) throw new RangeError(`${name} must be square.`);
    return rows;
  }

  // src/linalg/vector.js
  function dot(a2, b2) {
    requireFiniteNumbers(a2, "a");
    requireFiniteNumbers(b2, "b");
    requireSameLength(a2, b2);
    let s = 0;
    for (let i = 0; i < a2.length; i++) s += a2[i] * b2[i];
    return s;
  }
  function cross(a2, b2) {
    requireFiniteNumbers(a2, "a");
    requireFiniteNumbers(b2, "b");
    if (a2.length !== 3 || b2.length !== 3) throw new RangeError("The cross product needs two vectors of length 3.");
    return [
      a2[1] * b2[2] - a2[2] * b2[1],
      a2[2] * b2[0] - a2[0] * b2[2],
      a2[0] * b2[1] - a2[1] * b2[0]
    ];
  }
  function norm(a2) {
    requireFiniteNumbers(a2, "a");
    let max = 0;
    for (let i = 0; i < a2.length; i++) max = Math.max(max, Math.abs(a2[i]));
    if (max === 0) return 0;
    let s = 0;
    for (let i = 0; i < a2.length; i++) {
      const x = a2[i] / max;
      s += x * x;
    }
    return max * Math.sqrt(s);
  }
  function normalize(a2) {
    const length = norm(a2);
    if (length === 0) throw new RangeError("A zero vector cannot be normalised.");
    return Array.from(a2, (x) => x / length);
  }

  // src/linalg/matrix.js
  function transpose(a2) {
    const [rows, columns] = requireMatrix(a2, "a");
    return Array.from({ length: columns }, (_, j) => Array.from({ length: rows }, (_2, i) => a2[i][j]));
  }
  function multiply(a2, b2) {
    const [rows, inner] = requireMatrix(a2, "a");
    requireArray(b2, "b");
    if (b2.length && typeof b2[0] === "number") {
      requireFiniteNumbers(b2, "b");
      if (b2.length !== inner) throw new RangeError(`Cannot multiply a ${rows}\xD7${inner} matrix by a vector of length ${b2.length}.`);
      const ab2 = new Array(rows);
      for (let i = 0; i < rows; i++) {
        const ai = a2[i];
        let s = 0;
        for (let k = 0; k < inner; k++) s += ai[k] * b2[k];
        ab2[i] = s;
      }
      return ab2;
    }
    const [bRows, columns] = requireMatrix(b2, "b");
    if (bRows !== inner) throw new RangeError(`Cannot multiply a ${rows}\xD7${inner} matrix by a ${bRows}\xD7${columns} matrix.`);
    const ab = new Array(rows);
    for (let i = 0; i < rows; i++) {
      const ai = a2[i], row = new Array(columns).fill(0);
      for (let k = 0; k < inner; k++) {
        const f = ai[k], bk = b2[k];
        for (let j = 0; j < columns; j++) row[j] += f * bk[j];
      }
      ab[i] = row;
    }
    return ab;
  }
  function lu(a2) {
    const n = a2.length, m = a2.map((row) => Array.from(row)), permutation = Array.from({ length: n }, (_, i) => i);
    let sign = 1, max = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) max = Math.max(max, Math.abs(m[i][j]));
    for (let k = 0; k < n; k++) {
      let p = k;
      for (let i = k + 1; i < n; i++) if (Math.abs(m[i][k]) > Math.abs(m[p][k])) p = i;
      if (p !== k) {
        [m[p], m[k]] = [m[k], m[p]];
        [permutation[p], permutation[k]] = [permutation[k], permutation[p]];
        sign = -sign;
      }
      if (m[k][k] === 0) continue;
      for (let i = k + 1; i < n; i++) {
        const f = m[i][k] /= m[k][k];
        for (let j = k + 1; j < n; j++) m[i][j] -= f * m[k][j];
      }
    }
    return { m, permutation, sign, max };
  }
  function determinant(a2) {
    const n = requireSquareMatrix(a2, "a"), { m, sign } = lu(a2);
    let d2 = sign;
    for (let i = 0; i < n; i++) d2 *= m[i][i];
    return d2;
  }
  function solve(a2, b2) {
    const n = requireSquareMatrix(a2, "a");
    requireArray(b2, "b");
    const vector = !b2.length || typeof b2[0] === "number", columns = vector ? 1 : requireMatrix(b2, "b")[1];
    if (vector) requireFiniteNumbers(b2, "b");
    if (b2.length !== n) throw new RangeError(`b must have ${n} rows.`);
    const { m, permutation, max } = lu(a2), tolerance = n * Number.EPSILON * max;
    for (let i = 0; i < n; i++) {
      if (!(Math.abs(m[i][i]) > tolerance)) throw new RangeError("Matrix is singular.");
    }
    const x = new Array(n);
    for (let i = 0; i < n; i++) {
      const xi = x[i] = vector ? [b2[permutation[i]]] : Array.from(b2[permutation[i]]), mi = m[i];
      for (let k = 0; k < i; k++) {
        const f = mi[k], xk = x[k];
        if (f !== 0) for (let c2 = 0; c2 < columns; c2++) xi[c2] -= f * xk[c2];
      }
    }
    for (let i = n - 1; i >= 0; i--) {
      const xi = x[i], mi = m[i];
      for (let k = i + 1; k < n; k++) {
        const f = mi[k], xk = x[k];
        if (f !== 0) for (let c2 = 0; c2 < columns; c2++) xi[c2] -= f * xk[c2];
      }
      for (let c2 = 0; c2 < columns; c2++) xi[c2] /= mi[i];
    }
    return vector ? x.map((row) => row[0]) : x;
  }
  function inverse(a2) {
    const n = requireSquareMatrix(a2, "a");
    return solve(a2, Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_2, j) => +(i === j))));
  }

  // src/linalg/tridiagonal.js
  function solveTridiagonal(lower, diagonal, upper, rhs) {
    requireFiniteNumbers(lower, "lower");
    requireFiniteNumbers(diagonal, "diagonal");
    requireFiniteNumbers(upper, "upper");
    requireFiniteNumbers(rhs, "rhs");
    const n = diagonal.length;
    if (!n) throw new RangeError("diagonal must not be empty.");
    if (rhs.length !== n || lower.length !== n - 1 || upper.length !== n - 1) {
      throw new RangeError("diagonal and rhs must have the same length, and lower and upper one fewer.");
    }
    const c2 = new Array(n), d2 = new Array(n);
    let b2 = diagonal[0];
    if (b2 === 0) throw new RangeError("Zero pivot; the system needs pivoting.");
    c2[0] = n > 1 ? upper[0] / b2 : 0;
    d2[0] = rhs[0] / b2;
    for (let i = 1; i < n; i++) {
      b2 = diagonal[i] - lower[i - 1] * c2[i - 1];
      if (b2 === 0) throw new RangeError("Zero pivot; the system needs pivoting.");
      c2[i] = i < n - 1 ? upper[i] / b2 : 0;
      d2[i] = (rhs[i] - lower[i - 1] * d2[i - 1]) / b2;
    }
    const x = new Array(n);
    x[n - 1] = d2[n - 1];
    for (let i = n - 2; i >= 0; i--) x[i] = d2[i] - c2[i] * x[i + 1];
    return x;
  }

  // src/linalg/eigen.js
  function eigen(a2) {
    const n = requireSquareMatrix(a2, "a"), V = Array.from({ length: n }, () => new Array(n).fill(0)), d2 = new Array(n).fill(0), e = new Array(n).fill(0);
    let symmetric = true;
    for (let i = 0; i < n && symmetric; i++) {
      for (let j = 0; j < i; j++) {
        if (a2[i][j] !== a2[j][i]) {
          symmetric = false;
          break;
        }
      }
    }
    if (symmetric) {
      for (let i = 0; i < n; i++) V[i] = Array.from(a2[i]);
      tred2(d2, e, V);
      tql2(d2, e, V);
      e.fill(0);
    } else {
      const H = a2.map((row) => Array.from(row));
      orthes(H, V);
      hqr2(d2, e, H, V);
    }
    return { values: d2, imaginary: e, vectors: V };
  }
  function tred2(d2, e, V) {
    var n = V.length;
    for (var j = 0; j < n; j++) d2[j] = V[n - 1][j];
    for (var i = n - 1; i > 0; i--) {
      var scale = 0, h = 0;
      for (var k = 0; k < i; k++) scale += Math.abs(d2[k]);
      if (scale === 0) {
        e[i] = d2[i - 1];
        for (var j = 0; j < i; j++) {
          d2[j] = V[i - 1][j];
          V[i][j] = 0;
          V[j][i] = 0;
        }
      } else {
        for (var k = 0; k < i; k++) {
          d2[k] /= scale;
          h += d2[k] * d2[k];
        }
        var f = d2[i - 1];
        var g = Math.sqrt(h);
        if (f > 0) g = -g;
        e[i] = scale * g;
        h = h - f * g;
        d2[i - 1] = f - g;
        for (var j = 0; j < i; j++) e[j] = 0;
        for (var j = 0; j < i; j++) {
          f = d2[j];
          V[j][i] = f;
          g = e[j] + V[j][j] * f;
          for (var k = j + 1; k <= i - 1; k++) {
            g += V[k][j] * d2[k];
            e[k] += V[k][j] * f;
          }
          e[j] = g;
        }
        f = 0;
        for (var j = 0; j < i; j++) {
          e[j] /= h;
          f += e[j] * d2[j];
        }
        var hh = f / (h + h);
        for (var j = 0; j < i; j++) e[j] -= hh * d2[j];
        for (var j = 0; j < i; j++) {
          f = d2[j];
          g = e[j];
          for (var k = j; k <= i - 1; k++) V[k][j] -= f * e[k] + g * d2[k];
          d2[j] = V[i - 1][j];
          V[i][j] = 0;
        }
      }
      d2[i] = h;
    }
    for (var i = 0; i < n - 1; i++) {
      V[n - 1][i] = V[i][i];
      V[i][i] = 1;
      var h = d2[i + 1];
      if (h != 0) {
        for (var k = 0; k <= i; k++) d2[k] = V[k][i + 1] / h;
        for (var j = 0; j <= i; j++) {
          var g = 0;
          for (var k = 0; k <= i; k++) g += V[k][i + 1] * V[k][j];
          for (var k = 0; k <= i; k++) V[k][j] -= g * d2[k];
        }
      }
      for (var k = 0; k <= i; k++) V[k][i + 1] = 0;
    }
    for (var j = 0; j < n; j++) {
      d2[j] = V[n - 1][j];
      V[n - 1][j] = 0;
    }
    V[n - 1][n - 1] = 1;
    e[0] = 0;
  }
  function tql2(d2, e, V) {
    var n = V.length;
    for (var i = 1; i < n; i++) e[i - 1] = e[i];
    e[n - 1] = 0;
    var f = 0;
    var tst1 = 0;
    var eps = 1e-12;
    for (var l = 0; l < n; l++) {
      tst1 = Math.max(tst1, Math.abs(d2[l]) + Math.abs(e[l]));
      var m = l;
      while (m < n) {
        if (Math.abs(e[m]) <= eps * tst1) {
          break;
        }
        m++;
      }
      if (m > l) {
        var iter = 0;
        do {
          iter++;
          var g = d2[l];
          var p = (d2[l + 1] - g) / (2 * e[l]);
          var r = Math.hypot(p, 1);
          if (p < 0) r = -r;
          d2[l] = e[l] / (p + r);
          d2[l + 1] = e[l] * (p + r);
          var dl1 = d2[l + 1];
          var h = g - d2[l];
          for (var i = l + 2; i < n; i++) d2[i] -= h;
          f += h;
          p = d2[m];
          var c2 = 1;
          var c22 = c2;
          var c3 = c2;
          var el1 = e[l + 1];
          var s = 0;
          var s2 = 0;
          for (var i = m - 1; i >= l; i--) {
            c3 = c22;
            c22 = c2;
            s2 = s;
            g = c2 * e[i];
            h = c2 * p;
            r = Math.hypot(p, e[i]);
            e[i + 1] = s * r;
            s = e[i] / r;
            c2 = p / r;
            p = c2 * d2[i] - s * g;
            d2[i + 1] = h + s * (c2 * g + s * d2[i]);
            for (var k = 0; k < n; k++) {
              h = V[k][i + 1];
              V[k][i + 1] = s * V[k][i] + c2 * h;
              V[k][i] = c2 * V[k][i] - s * h;
            }
          }
          p = -s * s2 * c3 * el1 * e[l] / dl1;
          e[l] = s * p;
          d2[l] = c2 * p;
        } while (Math.abs(e[l]) > eps * tst1);
      }
      d2[l] = d2[l] + f;
      e[l] = 0;
    }
    for (var i = 0; i < n - 1; i++) {
      var k = i;
      var p = d2[i];
      for (var j = i + 1; j < n; j++) {
        if (d2[j] < p) {
          k = j;
          p = d2[j];
        }
      }
      if (k != i) {
        d2[k] = d2[i];
        d2[i] = p;
        for (var j = 0; j < n; j++) {
          p = V[j][i];
          V[j][i] = V[j][k];
          V[j][k] = p;
        }
      }
    }
  }
  function orthes(H, V) {
    var n = H.length;
    var ort = [];
    var low = 0;
    var high = n - 1;
    for (var m = low + 1; m < high; m++) {
      var scale = 0;
      for (var i = m; i <= high; i++) scale += Math.abs(H[i][m - 1]);
      if (scale !== 0) {
        var h = 0;
        for (var i = high; i >= m; i--) {
          ort[i] = H[i][m - 1] / scale;
          h += ort[i] * ort[i];
        }
        var g = Math.sqrt(h);
        if (ort[m] > 0) g = -g;
        h = h - ort[m] * g;
        ort[m] = ort[m] - g;
        for (var j = m; j < n; j++) {
          var f = 0;
          for (var i = high; i >= m; i--) f += ort[i] * H[i][j];
          f /= h;
          for (var i = m; i <= high; i++) H[i][j] -= f * ort[i];
        }
        for (var i = 0; i <= high; i++) {
          var f = 0;
          for (var j = high; j >= m; j--) f += ort[j] * H[i][j];
          f /= h;
          for (var j = m; j <= high; j++) H[i][j] -= f * ort[j];
        }
        ort[m] = scale * ort[m];
        H[m][m - 1] = scale * g;
      }
    }
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) V[i][j] = i === j ? 1 : 0;
    }
    for (var m = high - 1; m >= low + 1; m--) {
      if (H[m][m - 1] !== 0) {
        for (var i = m + 1; i <= high; i++) ort[i] = H[i][m - 1];
        for (var j = m; j <= high; j++) {
          var g = 0;
          for (var i = m; i <= high; i++) g += ort[i] * V[i][j];
          g = g / ort[m] / H[m][m - 1];
          for (var i = m; i <= high; i++) V[i][j] += g * ort[i];
        }
      }
    }
  }
  function hqr2(d2, e, H, V) {
    var nn = H.length, n = nn - 1, low = 0, high = nn - 1, eps = 1e-12, exshift = 0, p = 0, q = 0, r = 0, s = 0, z = 0, t, w, x, y;
    var norm2 = 0;
    for (var i = 0; i < nn; i++) {
      if (i < low || i > high) {
        d2[i] = H[i][i];
        e[i] = 0;
      }
      for (var j = Math.max(i - 1, 0); j < nn; j++) norm2 += Math.abs(H[i][j]);
    }
    var iter = 0;
    while (n >= low) {
      var l = n;
      while (l > low) {
        s = Math.abs(H[l - 1][l - 1]) + Math.abs(H[l][l]);
        if (s === 0) s = norm2;
        if (Math.abs(H[l][l - 1]) < eps * s) break;
        l--;
      }
      if (l === n) {
        H[n][n] = H[n][n] + exshift;
        d2[n] = H[n][n];
        e[n] = 0;
        n--;
        iter = 0;
      } else if (l === n - 1) {
        w = H[n][n - 1] * H[n - 1][n];
        p = (H[n - 1][n - 1] - H[n][n]) / 2;
        q = p * p + w;
        z = Math.sqrt(Math.abs(q));
        H[n][n] = H[n][n] + exshift;
        H[n - 1][n - 1] = H[n - 1][n - 1] + exshift;
        x = H[n][n];
        if (q >= 0) {
          z = p + (p >= 0 ? z : -z);
          d2[n - 1] = x + z;
          d2[n] = d2[n - 1];
          if (z !== 0) d2[n] = x - w / z;
          e[n - 1] = 0;
          e[n] = 0;
          x = H[n][n - 1];
          s = Math.abs(x) + Math.abs(z);
          p = x / s;
          q = z / s;
          r = Math.sqrt(p * p + q * q);
          p /= r;
          q /= r;
          for (var j = n - 1; j < nn; j++) {
            z = H[n - 1][j];
            H[n - 1][j] = q * z + p * H[n][j];
            H[n][j] = q * H[n][j] - p * z;
          }
          for (var i = 0; i <= n; i++) {
            z = H[i][n - 1];
            H[i][n - 1] = q * z + p * H[i][n];
            H[i][n] = q * H[i][n] - p * z;
          }
          for (var i = low; i <= high; i++) {
            z = V[i][n - 1];
            V[i][n - 1] = q * z + p * V[i][n];
            V[i][n] = q * V[i][n] - p * z;
          }
        } else {
          d2[n - 1] = x + p;
          d2[n] = x + p;
          e[n - 1] = z;
          e[n] = -z;
        }
        n = n - 2;
        iter = 0;
      } else {
        x = H[n][n];
        y = 0;
        w = 0;
        if (l < n) {
          y = H[n - 1][n - 1];
          w = H[n][n - 1] * H[n - 1][n];
        }
        if (iter == 10) {
          exshift += x;
          for (var i = low; i <= n; i++) {
            H[i][i] -= x;
          }
          s = Math.abs(H[n][n - 1]) + Math.abs(H[n - 1][n - 2]);
          x = y = 0.75 * s;
          w = -0.4375 * s * s;
        }
        if (iter == 30) {
          s = (y - x) / 2;
          s = s * s + w;
          if (s > 0) {
            s = Math.sqrt(s);
            if (y < x) {
              s = -s;
            }
            s = x - w / ((y - x) / 2 + s);
            for (var i = low; i <= n; i++) {
              H[i][i] -= s;
            }
            exshift += s;
            x = y = w = 0.964;
          }
        }
        iter++;
        var m = n - 2;
        while (m >= l) {
          z = H[m][m];
          r = x - z;
          s = y - z;
          p = (r * s - w) / H[m + 1][m] + H[m][m + 1];
          q = H[m + 1][m + 1] - z - r - s;
          r = H[m + 2][m + 1];
          s = Math.abs(p) + Math.abs(q) + Math.abs(r);
          p = p / s;
          q = q / s;
          r = r / s;
          if (m == l) break;
          if (Math.abs(H[m][m - 1]) * (Math.abs(q) + Math.abs(r)) < eps * (Math.abs(p) * (Math.abs(H[m - 1][m - 1]) + Math.abs(z) + Math.abs(H[m + 1][m + 1])))) {
            break;
          }
          m--;
        }
        for (var i = m + 2; i <= n; i++) {
          H[i][i - 2] = 0;
          if (i > m + 2) H[i][i - 3] = 0;
        }
        for (var k = m; k <= n - 1; k++) {
          var notlast = k != n - 1;
          if (k != m) {
            p = H[k][k - 1];
            q = H[k + 1][k - 1];
            r = notlast ? H[k + 2][k - 1] : 0;
            x = Math.abs(p) + Math.abs(q) + Math.abs(r);
            if (x != 0) {
              p /= x;
              q /= x;
              r /= x;
            }
          }
          if (x == 0) break;
          s = Math.sqrt(p * p + q * q + r * r);
          if (p < 0) {
            s = -s;
          }
          if (s != 0) {
            if (k != m) H[k][k - 1] = -s * x;
            else if (l != m) H[k][k - 1] = -H[k][k - 1];
            p += s;
            x = p / s;
            y = q / s;
            z = r / s;
            q /= p;
            r /= p;
            for (var j = k; j < nn; j++) {
              p = H[k][j] + q * H[k + 1][j];
              if (notlast) {
                p = p + r * H[k + 2][j];
                H[k + 2][j] = H[k + 2][j] - p * z;
              }
              H[k][j] = H[k][j] - p * x;
              H[k + 1][j] = H[k + 1][j] - p * y;
            }
            for (var i = 0; i <= Math.min(n, k + 3); i++) {
              p = x * H[i][k] + y * H[i][k + 1];
              if (notlast) {
                p += z * H[i][k + 2];
                H[i][k + 2] = H[i][k + 2] - p * r;
              }
              H[i][k] = H[i][k] - p;
              H[i][k + 1] = H[i][k + 1] - p * q;
            }
            for (var i = low; i <= high; i++) {
              p = x * V[i][k] + y * V[i][k + 1];
              if (notlast) {
                p = p + z * V[i][k + 2];
                V[i][k + 2] = V[i][k + 2] - p * r;
              }
              V[i][k] = V[i][k] - p;
              V[i][k + 1] = V[i][k + 1] - p * q;
            }
          }
        }
      }
    }
    if (norm2 == 0) {
      return;
    }
    for (n = nn - 1; n >= 0; n--) {
      p = d2[n];
      q = e[n];
      if (q == 0) {
        var l = n;
        H[n][n] = 1;
        for (var i = n - 1; i >= 0; i--) {
          w = H[i][i] - p;
          r = 0;
          for (var j = l; j <= n; j++) {
            r = r + H[i][j] * H[j][n];
          }
          if (e[i] < 0) {
            z = w;
            s = r;
          } else {
            l = i;
            if (e[i] === 0) {
              H[i][n] = -r / (w !== 0 ? w : eps * norm2);
            } else {
              x = H[i][i + 1];
              y = H[i + 1][i];
              q = (d2[i] - p) * (d2[i] - p) + e[i] * e[i];
              t = (x * s - z * r) / q;
              H[i][n] = t;
              if (Math.abs(x) > Math.abs(z)) {
                H[i + 1][n] = (-r - w * t) / x;
              } else {
                H[i + 1][n] = (-s - y * t) / z;
              }
            }
            t = Math.abs(H[i][n]);
            if (eps * t * t > 1) {
              for (var j = i; j <= n; j++) H[j][n] = H[j][n] / t;
            }
          }
        }
      } else if (q < 0) {
        var l = n - 1;
        if (Math.abs(H[n][n - 1]) > Math.abs(H[n - 1][n])) {
          H[n - 1][n - 1] = q / H[n][n - 1];
          H[n - 1][n] = -(H[n][n] - p) / H[n][n - 1];
        } else {
          var zz = cdiv(0, -H[n - 1][n], H[n - 1][n - 1] - p, q);
          H[n - 1][n - 1] = zz[0];
          H[n - 1][n] = zz[1];
        }
        H[n][n - 1] = 0;
        H[n][n] = 1;
        for (var i = n - 2; i >= 0; i--) {
          var ra = 0, sa = 0, vr, vi;
          for (var j = l; j <= n; j++) {
            ra = ra + H[i][j] * H[j][n - 1];
            sa = sa + H[i][j] * H[j][n];
          }
          w = H[i][i] - p;
          if (e[i] < 0) {
            z = w;
            r = ra;
            s = sa;
          } else {
            l = i;
            if (e[i] == 0) {
              var zz = cdiv(-ra, -sa, w, q);
              H[i][n - 1] = zz[0];
              H[i][n] = zz[1];
            } else {
              x = H[i][i + 1];
              y = H[i + 1][i];
              vr = (d2[i] - p) * (d2[i] - p) + e[i] * e[i] - q * q;
              vi = (d2[i] - p) * 2 * q;
              if (vr == 0 & vi == 0) {
                vr = eps * norm2 * (Math.abs(w) + Math.abs(q) + Math.abs(x) + Math.abs(y) + Math.abs(z));
              }
              var zz = cdiv(x * r - z * ra + q * sa, x * s - z * sa - q * ra, vr, vi);
              H[i][n - 1] = zz[0];
              H[i][n] = zz[1];
              if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
                H[i + 1][n - 1] = (-ra - w * H[i][n - 1] + q * H[i][n]) / x;
                H[i + 1][n] = (-sa - w * H[i][n] - q * H[i][n - 1]) / x;
              } else {
                var zz = cdiv(-r - y * H[i][n - 1], -s - y * H[i][n], z, q);
                H[i + 1][n - 1] = zz[0];
                H[i + 1][n] = zz[1];
              }
            }
            t = Math.max(Math.abs(H[i][n - 1]), Math.abs(H[i][n]));
            if (eps * t * t > 1) {
              for (var j = i; j <= n; j++) {
                H[j][n - 1] = H[j][n - 1] / t;
                H[j][n] = H[j][n] / t;
              }
            }
          }
        }
      }
    }
    for (var i = 0; i < nn; i++) {
      if (i < low || i > high) {
        for (var j = i; j < nn; j++) V[i][j] = H[i][j];
      }
    }
    for (var j = nn - 1; j >= low; j--) {
      for (var i = low; i <= high; i++) {
        z = 0;
        for (var k = low; k <= Math.min(j, high); k++) z += V[i][k] * H[k][j];
        V[i][j] = z;
      }
    }
  }
  function cdiv(xr, xi, yr, yi) {
    if (Math.abs(yr) > Math.abs(yi)) {
      var r = yi / yr, d2 = yr + r * yi;
      return [(xr + r * xi) / d2, (xi - r * xr) / d2];
    } else {
      var r = yr / yi, d2 = yi + r * yr;
      return [(r * xr + xi) / d2, (r * xi - xr) / d2];
    }
  }

  // src/stats/summary.js
  function mean(values) {
    requireArray(values, "values");
    const n = values.length;
    if (n === 0) return NaN;
    let m = 0;
    for (let i = 0; i < n; i++) m += (values[i] - m) / (i + 1);
    return m;
  }
  function variance(values) {
    requireArray(values, "values");
    const n = values.length;
    if (n < 2) return NaN;
    let m = 0, s = 0;
    for (let i = 0; i < n; i++) {
      const d2 = values[i] - m;
      m += d2 / (i + 1);
      s += d2 * (values[i] - m);
    }
    return s / (n - 1);
  }
  function standardDeviation(values) {
    return Math.sqrt(variance(values));
  }
  function sorted(values) {
    requireArray(values, "values");
    return Array.from(values).sort((a2, b2) => a2 - b2);
  }
  function requireProbability(p) {
    if (!(p >= 0 && p <= 1)) throw new RangeError("Probabilities must be between 0 and 1.");
  }
  function quantileSorted(s, p) {
    const n = s.length;
    if (n === 0) return NaN;
    const index = p * (n - 1), lo = Math.floor(index), h = index - lo;
    return h === 0 ? s[lo] : s[lo] + h * (s[lo + 1] - s[lo]);
  }
  function quantile(values, p) {
    requireProbability(p);
    return quantileSorted(sorted(values), p);
  }
  function quantiles(values, probabilities) {
    requireArray(probabilities, "probabilities");
    for (let i = 0; i < probabilities.length; i++) requireProbability(probabilities[i]);
    const s = sorted(values);
    return Array.from(probabilities, (p) => quantileSorted(s, p));
  }
  function median(values) {
    return quantile(values, 0.5);
  }
  function iqr(values) {
    const [q1, q3] = quantiles(values, [0.25, 0.75]);
    return q3 - q1;
  }
  function modes(values) {
    requireArray(values, "values");
    const counts = /* @__PURE__ */ new Map();
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

  // src/stats/erf.js
  var TWO_OVER_SQRT_PI = 2 / Math.sqrt(Math.PI);
  function erf(x) {
    if (Number.isNaN(x) || x === 0) return x;
    const a2 = Math.abs(x), y = a2 < 0.5 ? erfSeries(a2) : 1 - erfcPositive(a2);
    return x < 0 ? -y : y;
  }
  function erfc(x) {
    if (Number.isNaN(x)) return NaN;
    if (x <= -0.5) return 2 - erfcPositive(-x);
    if (x < 0.5) return 1 - erf(x);
    return erfcPositive(x);
  }
  function erfSeries(x) {
    const x2 = 2 * x * x;
    let term = x, sum = x;
    for (let n = 1; term > sum * 1e-17; n++) {
      term *= x2 / (2 * n + 1);
      sum += term;
    }
    return TWO_OVER_SQRT_PI * Math.exp(-x * x) * sum;
  }
  var G = [
    [
      -2.3194577541483,
      0.10773148055689316,
      0.0019579096098603574,
      76647902563401e-19,
      -2122801400080643e-21,
      -11305154404718577e-23,
      -6762761498894301e-25,
      26138817645357993e-26,
      14170816340307623e-27,
      -19981614162290126e-29,
      -5821735255347536e-29,
      -16850633885159191e-31,
      16460316501217129e-32,
      13207093734421784e-33
    ],
    [
      -1.8576530907291056,
      0.12302299515368256,
      0.0017771289704500788,
      -4210821648466003e-20,
      -3776632118610938e-21,
      -1300310609753077e-23,
      8810616835450316e-24,
      19885336516158347e-26,
      -23476967438473282e-27,
      -8967629855128368e-28,
      7243191744414293e-29,
      3397241565926125e-30,
      -2603268781963852e-31,
      -11496959904090988e-33
    ],
    [
      -1.3417062129189457,
      0.1342490198693356,
      9390205857296584e-19,
      -9291846698333768e-20,
      -19535147489760565e-22,
      17326256785532582e-23,
      34936548212218308e-25,
      -4572261996640394e-25,
      -31031989613964023e-28,
      13095062244049796e-28,
      -17087385345951227e-30,
      -3403537234895309e-30,
      13455374073326626e-32,
      6345670160970927e-33
    ],
    [
      -0.7971386149285049,
      0.1370419470797222,
      -2457635734330582e-19,
      -9598165327468248e-20,
      14065261981649073e-22,
      12625440891936126e-23,
      -5609519603377978e-24,
      -9751993377779212e-26,
      1511495020128536e-26,
      -29670018619853556e-29,
      -24028482526024857e-30,
      16078046430711497e-31,
      -6526577633450537e-33,
      -35570449501543785e-34
    ]
  ];
  function erfcPositive(z) {
    if (z === Infinity) return 0;
    const t = 2 / (2 + z), u = 2 * t - 1, piece = Math.min(3, Math.floor((u + 1) / 0.4)), s = (u + 0.8 - 0.4 * piece) / 0.2, c2 = G[piece];
    let b1 = 0, b2 = 0;
    for (let j = c2.length - 1; j > 0; j--) {
      const b3 = 2 * s * b1 - b2 + c2[j];
      b2 = b1;
      b1 = b3;
    }
    const g = s * b1 - b2 + c2[0] / 2;
    if (z < 2) return t * Math.exp(g - z * z);
    const zh = Math.round(z * 16) / 16;
    return t * Math.exp(-zh * zh) * Math.exp(g - (z - zh) * (z + zh));
  }

  // src/stats/normal.js
  var SQRT_2PI = Math.sqrt(2 * Math.PI);
  function normal({ mean: mean2 = 0, sd = 1 } = {}) {
    if (!Number.isFinite(mean2)) throw new TypeError("mean must be a finite number.");
    if (!(sd > 0 && sd < Infinity)) throw new RangeError("sd must be a positive finite number.");
    return Object.freeze({
      mean: mean2,
      sd,
      pdf(x) {
        const z = (x - mean2) / sd;
        return Math.exp(-0.5 * z * z) / (sd * SQRT_2PI);
      },
      cdf(x) {
        return standardCdf((x - mean2) / sd);
      },
      quantile(p) {
        if (!(p >= 0 && p <= 1)) throw new RangeError("Probabilities must be between 0 and 1.");
        return mean2 + sd * standardQuantile(p);
      },
      sample(random = Math.random) {
        requireFunction(random, "random");
        return mean2 + sd * standardSample(random);
      }
    });
  }
  function standardCdf(z) {
    return 0.5 * erfc(-z / Math.SQRT2);
  }
  var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  var b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  var c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  var d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  var pLow = 0.02425;
  function standardQuantile(p) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    let x;
    if (p < pLow) {
      const q = Math.sqrt(-2 * Math.log(p));
      x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= 1 - pLow) {
      const q = p - 0.5, r = q * q;
      x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    const e = x < 0 ? standardCdf(x) - p : 1 - p - standardCdf(-x), u = e * SQRT_2PI * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }
  function standardSample(random) {
    let x, y, s;
    do {
      x = 2 * random() - 1;
      y = 2 * random() - 1;
      s = x * x + y * y;
    } while (s >= 1 || s === 0);
    return x * Math.sqrt(-2 * Math.log(s) / s);
  }

  // src/stats/distances.js
  function check(a2, b2) {
    requireArray(a2, "a");
    requireArray(b2, "b");
    requireSameLength(a2, b2);
  }
  var distances = Object.freeze({
    euclidean(a2, b2) {
      check(a2, b2);
      let s = 0;
      for (let i = 0; i < a2.length; i++) {
        const x = a2[i] - b2[i];
        s += x * x;
      }
      return Math.sqrt(s);
    },
    manhattan(a2, b2) {
      check(a2, b2);
      let s = 0;
      for (let i = 0; i < a2.length; i++) s += Math.abs(a2[i] - b2[i]);
      return s;
    },
    chebyshev(a2, b2) {
      check(a2, b2);
      let max = 0;
      for (let i = 0; i < a2.length; i++) max = Math.max(max, Math.abs(a2[i] - b2[i]));
      return max;
    },
    // Returns the Minkowski distance function of order p.
    minkowski(p) {
      if (!(p > 0)) throw new RangeError("p must be positive.");
      if (p === Infinity) return distances.chebyshev;
      return function(a2, b2) {
        check(a2, b2);
        let s = 0;
        for (let i = 0; i < a2.length; i++) s += Math.pow(Math.abs(a2[i] - b2[i]), p);
        return Math.pow(s, 1 / p);
      };
    },
    // The number of positions at which a and b differ.
    hamming(a2, b2) {
      check(a2, b2);
      let d2 = 0;
      for (let i = 0; i < a2.length; i++) if (a2[i] !== b2[i]) d2++;
      return d2;
    },
    // The Jaccard distance between a and b treated as sets, where a truthy value
    // at position i means that i is a member: 1 - |a ∩ b| / |a ∪ b|. Two empty
    // sets are at distance 0.
    jaccard(a2, b2) {
      check(a2, b2);
      let intersection = 0, union = 0;
      for (let i = 0; i < a2.length; i++) {
        if (a2[i] || b2[i]) union++;
        if (a2[i] && b2[i]) intersection++;
      }
      return union ? (union - intersection) / union : 0;
    },
    // The Bray–Curtis dissimilarity, for non-negative values.
    braycurtis(a2, b2) {
      check(a2, b2);
      let s0 = 0, s1 = 0;
      for (let i = 0; i < a2.length; i++) {
        s0 += Math.abs(a2[i] - b2[i]);
        s1 += Math.abs(a2[i] + b2[i]);
      }
      return s0 / s1;
    }
  });

  // src/stats/kernels.js
  var kernels = Object.freeze({
    uniform(u) {
      return Math.abs(u) <= 1 ? 0.5 : 0;
    },
    triangular(u) {
      return Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0;
    },
    epanechnikov(u) {
      return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0;
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
      return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
    },
    cosine(u) {
      return Math.abs(u) <= 1 ? Math.PI / 4 * Math.cos(Math.PI / 2 * u) : 0;
    }
  });

  // src/stats/bandwidths.js
  function check2(x) {
    requireArray(x, "x");
    if (x.length < 2) throw new RangeError("At least two values are needed to select a bandwidth.");
  }
  var bandwidths = Object.freeze({
    // Silverman's rule of thumb. Silverman, B. W. (1986) Density Estimation.
    // London: Chapman and Hall.
    nrd0(x) {
      check2(x);
      const hi = standardDeviation(x);
      let lo = Math.min(hi, iqr(x) / 1.34);
      if (!lo) lo = hi || Math.abs(x[0]) || 1;
      return 0.9 * lo * Math.pow(x.length, -0.2);
    },
    // Scott's variation of Silverman's rule. Scott, D. W. (1992) Multivariate
    // Density Estimation: Theory, Practice, and Visualization. Wiley.
    nrd(x) {
      check2(x);
      return 1.06 * Math.min(standardDeviation(x), iqr(x) / 1.34) * Math.pow(x.length, -0.2);
    }
  });

  // src/stats/kde.js
  function kde(sample, { kernel = kernels.gaussian, bandwidth = bandwidths.nrd0 } = {}) {
    requireFiniteNumbers(sample, "sample");
    if (!sample.length) throw new RangeError("sample must not be empty.");
    requireFunction(kernel, "kernel");
    const values = Array.from(sample), n = values.length, h = typeof bandwidth === "function" ? bandwidth(values) : bandwidth;
    if (!(h > 0 && h < Infinity)) throw new RangeError("Bandwidth must be a positive finite number.");
    function density(x) {
      let y = 0;
      for (let i = 0; i < n; i++) y += kernel((x - values[i]) / h);
      return y / (h * n);
    }
    density.bandwidth = h;
    return density;
  }

  // src/stats/kmeans.js
  function kmeans(vectors, { k, distance = distances.euclidean, maxIterations = 1e3, random = Math.random } = {}) {
    const [n, dimensions] = requireMatrix(vectors, "vectors");
    if (!(Number.isInteger(k) && k >= 1)) throw new RangeError("k must be a positive integer.");
    if (!(Number.isInteger(maxIterations) && maxIterations >= 1)) throw new RangeError("maxIterations must be a positive integer.");
    requireFunction(distance, "distance");
    requireFunction(random, "random");
    if (distinctCount(vectors, k) < k) throw new RangeError("There are fewer distinct vectors than clusters.");
    let centroids = initialCentroids(vectors, k, distance, random), assignments = new Array(n).fill(-1), iterations = 0, changed = true;
    while (changed && iterations < maxIterations) {
      iterations++;
      changed = false;
      for (let i = 0; i < n; i++) {
        let best = 0, min = Infinity;
        for (let j = 0; j < k; j++) {
          const d2 = distance(vectors[i], centroids[j]);
          if (d2 < min) {
            min = d2;
            best = j;
          }
        }
        if (assignments[i] !== best) {
          assignments[i] = best;
          changed = true;
        }
      }
      const sums = Array.from({ length: k }, () => new Array(dimensions).fill(0)), counts = new Array(k).fill(0);
      for (let i = 0; i < n; i++) {
        const j = assignments[i];
        counts[j]++;
        for (let d2 = 0; d2 < dimensions; d2++) sums[j][d2] += vectors[i][d2];
      }
      centroids = centroids.map((c2, j) => counts[j] ? sums[j].map((s) => s / counts[j]) : c2);
    }
    return { assignments, centroids, iterations };
  }
  function distinctCount(vectors, limit) {
    const seen = /* @__PURE__ */ new Set();
    for (let i = 0; i < vectors.length && seen.size < limit; i++) seen.add(Array.from(vectors[i]).join());
    return seen.size;
  }
  function initialCentroids(vectors, k, distance, random) {
    const n = vectors.length, closest = new Array(n).fill(Infinity), centroids = [Array.from(vectors[Math.min(n - 1, Math.floor(random() * n))])];
    while (centroids.length < k) {
      const last = centroids[centroids.length - 1];
      let total = 0;
      for (let i = 0; i < n; i++) {
        const d2 = distance(vectors[i], last);
        closest[i] = Math.min(closest[i], d2 * d2);
        total += closest[i];
      }
      let target = random() * total, chosen = -1;
      for (let i = 0; i < n; i++) {
        if (closest[i] > 0) {
          chosen = i;
          target -= closest[i];
          if (target < 0) break;
        }
      }
      if (chosen < 0) throw new RangeError("There are fewer vectors at a positive distance from each other than clusters.");
      centroids.push(Array.from(vectors[chosen]));
    }
    return centroids;
  }

  // src/stats/hcluster.js
  function hcluster(vectors, { linkage = "single", distance = distances.euclidean } = {}) {
    if (linkage !== "single" && linkage !== "complete" && linkage !== "average") {
      throw new RangeError(`Unknown linkage: ${linkage}`);
    }
    requireFunction(distance, "distance");
    const n = requireMatrix(vectors, "vectors")[0];
    const clusters = [], sizes = [], distMatrix = [], dMin = [];
    for (let i = 0; i < n; i++) {
      clusters[i] = { left: null, right: null, height: 0, size: 1, depth: 0, index: i, centroid: Array.from(vectors[i]) };
      sizes[i] = 1;
    }
    if (n === 1) return clusters[0];
    for (let i = 0; i < n; i++) {
      distMatrix[i] = new Array(n);
      distMatrix[i][i] = Infinity;
      for (let j = 0; j < i; j++) distMatrix[i][j] = distMatrix[j][i] = distance(vectors[i], vectors[j]);
    }
    for (let i = 0; i < n; i++) {
      dMin[i] = 0;
      for (let j = 0; j < n; j++) if (distMatrix[i][dMin[i]] > distMatrix[i][j]) dMin[i] = j;
    }
    let root;
    for (let p = 0; p < n - 1; p++) {
      let c1 = 0;
      for (let i = 0; i < n; i++) {
        if (distMatrix[i][dMin[i]] < distMatrix[c1][dMin[c1]]) c1 = i;
      }
      const c2 = dMin[c1], left = clusters[c1], right = clusters[c2];
      root = clusters[c1] = {
        left,
        right,
        height: distMatrix[c1][c2],
        size: left.size + right.size,
        depth: 1 + Math.max(left.depth, right.depth),
        index: n + p,
        centroid: mergeCentroids(left, right)
      };
      for (let j = 0; j < n; j++) {
        if (j === c1 || j === c2) continue;
        if (linkage === "single") {
          if (distMatrix[c1][j] > distMatrix[c2][j]) distMatrix[j][c1] = distMatrix[c1][j] = distMatrix[c2][j];
        } else if (linkage === "complete") {
          if (distMatrix[c1][j] < distMatrix[c2][j]) distMatrix[j][c1] = distMatrix[c1][j] = distMatrix[c2][j];
        } else {
          distMatrix[j][c1] = distMatrix[c1][j] = (sizes[c1] * distMatrix[c1][j] + sizes[c2] * distMatrix[c2][j]) / (sizes[c1] + sizes[c2]);
        }
      }
      sizes[c1] += sizes[c2];
      for (let i = 0; i < n; i++) distMatrix[i][c2] = distMatrix[c2][i] = Infinity;
      for (let j = 0; j < n; j++) {
        if (linkage === "single") {
          if (dMin[j] === c2) dMin[j] = c1;
        } else if (dMin[j] === c1 || dMin[j] === c2) {
          for (let k = 0; k < n; k++) {
            if (distMatrix[j][k] < distMatrix[j][dMin[j]]) dMin[j] = k;
          }
        }
        if (distMatrix[c1][j] < distMatrix[c1][dMin[c1]]) dMin[c1] = j;
      }
    }
    return root;
  }
  function mergeCentroids(a2, b2) {
    const n = a2.centroid.length, size = a2.size + b2.size, centroid = new Array(n);
    for (let i = 0; i < n; i++) centroid[i] = (a2.size * a2.centroid[i] + b2.size * b2.centroid[i]) / size;
    return centroid;
  }

  // src/stats/loess.js
  function loess(x, y, { bandwidth = 0.3, robustnessIterations = 2, accuracy = 1e-12, weights } = {}) {
    requireFiniteNumbers(x, "x");
    requireFiniteNumbers(y, "y");
    requireSameLength(x, y);
    const n = x.length;
    if (n === 0) throw new RangeError("At least one point is required.");
    if (!(bandwidth > 0 && bandwidth <= 1)) throw new RangeError("bandwidth must be greater than 0 and at most 1.");
    if (!(Number.isInteger(robustnessIterations) && robustnessIterations >= 0)) throw new RangeError("robustnessIterations must be a non-negative integer.");
    if (!(accuracy >= 0)) throw new RangeError("accuracy must be a non-negative number.");
    if (weights == null) {
      weights = new Array(n).fill(1);
    } else {
      requireFiniteNumbers(weights, "weights");
      requireSameLength(x, weights);
    }
    for (let i = 1; i < n; i++) {
      if (x[i - 1] > x[i]) throw new RangeError("x must be sorted in ascending order.");
    }
    const points = [];
    for (let i = 0; i < n; i++) {
      if (weights[i] < 0) throw new RangeError("weights must be non-negative.");
      if (weights[i] > 0) points.push(i);
    }
    if (!points.length) throw new RangeError("At least one weight must be positive.");
    if (n <= 2) return Array.from(y);
    const bandwidthInPoints = Math.floor(bandwidth * n);
    if (bandwidthInPoints < 2) throw new RangeError("bandwidth is too small for the number of points.");
    const m = points.length, q = Math.min(bandwidthInPoints, m), res = new Array(n).fill(0), residuals = new Array(n).fill(0), robustnessWeights = new Array(n).fill(1), w = new Float64Array(m);
    function localFit(lo, hi, xi, h, local, robust) {
      let sumWeights = 0, sumX = 0, sumY = 0;
      for (let k = lo; k <= hi; k++) {
        const p = points[k];
        let wk = weights[p];
        if (robust) wk *= robustnessWeights[p];
        if (local && h > 0) wk *= tricube(Math.abs(x[p] - xi) / h);
        w[k] = wk;
        sumWeights += wk;
        sumX += wk * (x[p] - xi);
        sumY += wk * y[p];
      }
      if (!(sumWeights > 0)) return null;
      const meanX = sumX / sumWeights, meanY = sumY / sumWeights;
      let sumXX = 0, sumXY = 0;
      for (let k = lo; k <= hi; k++) {
        const p = points[k], dx = x[p] - xi - meanX;
        sumXX += w[k] * dx * dx;
        sumXY += w[k] * dx * (y[p] - meanY);
      }
      const beta = Math.sqrt(sumXX / sumWeights) < accuracy || !sumXX ? 0 : sumXY / sumXX;
      return meanY - beta * meanX;
    }
    for (let iteration = 0; iteration <= robustnessIterations; iteration++) {
      let left = 0, right = q - 1;
      for (let i = 0; i < n; i++) {
        const xi = x[i];
        while (right < m - 1 && x[points[right + 1]] - xi < xi - x[points[left]]) {
          left++;
          right++;
        }
        const h = Math.max(xi - x[points[left]], x[points[right]] - xi);
        let lo = left, hi = right;
        while (lo > 0 && xi - x[points[lo - 1]] <= h) lo--;
        while (hi < m - 1 && x[points[hi + 1]] - xi <= h) hi++;
        let fit = localFit(lo, hi, xi, h, true, true);
        if (fit == null) {
          if (weights[i] > 0) fit = y[i];
          else {
            fit = localFit(lo, hi, xi, h, false, true);
            if (fit == null) fit = localFit(lo, hi, xi, h, false, false);
          }
        }
        res[i] = fit;
        residuals[i] = Math.abs(y[i] - fit);
      }
      if (iteration === robustnessIterations) break;
      const medianResidual = median(points.map((p) => residuals[p]));
      if (medianResidual < accuracy || !medianResidual) break;
      for (let i = 0; i < n; i++) {
        const arg = residuals[i] / (6 * medianResidual);
        robustnessWeights[i] = arg >= 1 ? 0 : (1 - arg * arg) ** 2;
      }
    }
    return res;
  }
  function tricube(x) {
    const t = 1 - x * x * x;
    return t * t * t;
  }
  return __toCommonJS(index_exports);
})();
