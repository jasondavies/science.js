import * as esbuild from "esbuild";

// Browser bundles that define a global `science` with every named export. The
// ES module entry point is src/index.js itself, so it needs no build.
const options = {
  entryPoints: ["src/index.js"],
  bundle: true,
  format: "iife",
  globalName: "science",
  platform: "browser",
  target: "es2020",
  logLevel: "info"
};

await Promise.all([
  esbuild.build({...options, outfile: "dist/science.js"}),
  esbuild.build({...options, minify: true, outfile: "dist/science.min.js"})
]);
