const fs = require("node:fs");
const path = require("node:path");

const test = require("node:test");
const assert = require("../assert");

const science = require("../../index");
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8")
);

test("science.version matches package.json version", function() {
  assert.equal(science.version, packageJson.version);
});
