import fs from "node:fs";
import test from "node:test";

import science from "../../index.js";
import assert from "../assert.js";

const packageJson = JSON.parse(fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

test("science.version matches package.json version", function() {
  assert.equal(science.version, packageJson.version);
});
