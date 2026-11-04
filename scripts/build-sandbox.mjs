import { build } from "esbuild";
await build({
  entryPoints: ["src/sandbox/runtime.tsx"],
  bundle: true,
  platform: "browser",
  format: "iife",
  target: "es2022",
  outfile: "public/lesson-runtime.js",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
});
