import fs from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import * as science from "../index.js";
import assert from "./assert.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8"),
      names = Object.keys(science).sort();

test("version matches package.json", () => {
  assert.equal(science.version, JSON.parse(read("../package.json")).version);
});

// index.d.ts is maintained by hand, so check that it declares exactly the
// runtime exports.
test("index.d.ts declares every export", () => {
  const declared = [...read("../index.d.ts").matchAll(/^export (?:function|const) (\w+)/gm)].map((m) => m[1]);
  assert.deepEqual([...new Set(declared)].sort(), names);
});

test("the browser bundles define a global with every export", () => {
  for (const file of ["science.js", "science.min.js"]) {
    const context = {};
    runInNewContext(read(`../dist/${file}`), context);
    assert.deepEqual(Object.keys(context), ["science"], file);
    assert.deepEqual(Object.keys(context.science).sort(), names, file);
  }
});
