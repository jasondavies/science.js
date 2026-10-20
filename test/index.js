// Runs every test file; node:test runs the tests as each file is imported.
// Plain `node` is used rather than `node --test` so tests run on Node 18.0.0.
import "./core/ascending-test.js";
import "./core/expm1-test.js";
import "./core/hypot-test.js";
import "./core/quadratic-test.js";
import "./core/version-test.js";
import "./core/zeroes-test.js";
import "./lin/decompose-test.js";
import "./lin/inverse-test.js";
import "./lin/tridag-test.js";
import "./stats/bandwidth-test.js";
import "./stats/distance-test.js";
import "./stats/distribution/gaussian-test.js";
import "./stats/erf-test.js";
import "./stats/hcluster-test.js";
import "./stats/iqr-test.js";
import "./stats/kmeans-test.js";
import "./stats/loess-test.js";
import "./stats/mean-test.js";
import "./stats/median-test.js";
import "./stats/mode-test.js";
import "./stats/phi-test.js";
import "./stats/variance-test.js";
