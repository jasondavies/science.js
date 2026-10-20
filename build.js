import * as esbuild from "esbuild";

// The sources assign to a shared `science` variable, declared by the banner.
const options = {
  entryPoints: ["src/index.js"],
  bundle: true,
  platform: "neutral",
  banner: {js: "var science;"},
  logLevel: "info"
};

await Promise.all([
  // ES module, used by index.js; it does not touch globalThis.
  esbuild.build({...options, format: "esm", footer: {js: "export default science;\nexport { science };"}, outfile: "dist/science.esm.js"}),
  // Browser bundles that define a global `science`.
  esbuild.build({...options, format: "iife", footer: {js: "globalThis.science = science;"}, outfile: "dist/science.js"}),
  esbuild.build({...options, format: "iife", footer: {js: "globalThis.science = science;"}, minify: true, outfile: "dist/science.min.js"})
]);
