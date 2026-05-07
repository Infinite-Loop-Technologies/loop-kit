#!/usr/bin/env bun
import path from "node:path"
import tailwind from "bun-plugin-tailwind"

const result = await Bun.build({
  entrypoints: [path.resolve("src/client/index.html")],
  outdir: path.resolve("dist"),
  plugins: [tailwind],
  target: "browser",
  minify: true,
  sourcemap: "linked",
})

if (!result.success) {
  console.error("Simple example build failed.")
  process.exit(1)
}

console.log(`Built ${result.outputs.length} simple example assets.`)
