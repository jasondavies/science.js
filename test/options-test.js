import test from "node:test";
import { hcluster, kde, kmeans, loess, normal, quadratic } from "../src/index.js";
import assert from "./assert.js";

const calls = {
  loess: (options) => loess([1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6, 7], options),
  kde: (options) => kde([1, 2, 3], options),
  kmeans: (options) => kmeans([[0], [1]], options),
  hcluster: (options) => hcluster([[0], [1]], options),
  normal: (options) => normal(options),
  quadratic: (options) => quadratic(1, 0, -1, options)
};

test("options must be an object", () => {
  for (const [name, f] of Object.entries(calls)) {
    for (const options of [null, .5, "complete", [1], true]) {
      assert.throws(() => f(options), {name: "TypeError", message: `The options for ${name} must be an object.`}, name);
    }
  }
});

test("unknown options are rejected", () => {
  assert.throws(() => loess([1, 2], [1, 2], {bandwith: .5}), {name: "TypeError", message: "Unknown option for loess: bandwith"});
  assert.throws(() => normal({variance: 4}), {name: "TypeError", message: "Unknown option for normal: variance"});
  for (const [name, f] of Object.entries(calls)) {
    assert.throws(() => f({...(name === "kmeans" ? {k: 1} : {}), unknown: 1}), {name: "TypeError", message: `Unknown option for ${name}: unknown`}, name);
  }
});

test("positional arguments from 1.x are rejected", () => {
  assert.throws(() => normal(5, 2), {name: "TypeError"});
  assert.throws(() => kde([1, 2, 3], .5), {name: "TypeError"});
});

test("undefined options use the defaults", () => {
  assert.deepEqual(normal({mean: undefined, sd: undefined}).sd, 1);
  assert.deepEqual(loess([1, 2], [3, 4], {weights: undefined}), [3, 4]);
});
