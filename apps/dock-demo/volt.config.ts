import { defineProjectConfig } from "volt";
import { bunFullstack } from "volt/bun";
import webEntrypoint from "./src/web/server.runtime";

const web = bunFullstack(webEntrypoint, {
  env: {
    PORT: process.env.PORT ?? "3400",
    VOLT_MODE:
      process.env.VOLT_MODE === "production" ? "production" : "development",
  },
  outdir: "dist/web",
});

export default defineProjectConfig({
  adapters: {
    web,
  },
  defaults: {
    build: ["build:web"],
    dev: ["dev:web"],
  },
  name: "Dock Demo",
  tasks: {},
});
