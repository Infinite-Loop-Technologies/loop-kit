import { defineProjectConfig } from "volt";
import { bunFullstack } from "volt/bun";
import siteEntrypoint from "./src/web/server.runtime";

const site = bunFullstack(siteEntrypoint, {
  env: {
    PORT: process.env.PORT ?? "6401",
    VOLT_MODE:
      process.env.VOLT_MODE === "production" ? "production" : "development",
  },
  inputs: ["src/**/*", "public/**/*"],
  outdir: "dist/site",
  outputs: ["dist/site/**"],
  readiness: {
    kind: "stdout",
    pattern: "site server listening",
  },
  watch: ["src/**/*", "public/**/*"],
});

export default defineProjectConfig({
  adapters: {
    site,
  },
  defaults: {
    build: "build:site",
    dev: "dev:site",
  },
  name: "Volt Site",
  tasks: {},
});
