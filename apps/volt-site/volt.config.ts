import { defineProjectConfig } from "volt";
import { bunFullstackTask } from "volt/bun";
import siteEntrypoint from "./src/web/server.runtime";

const siteTaskOptions = {
  env: {
    PORT: process.env.PORT ?? "6401",
    VOLT_MODE:
      process.env.VOLT_MODE === "production" ? "production" : "development",
  },
  outdir: "dist/site",
};

export default defineProjectConfig({
  defaults: {
    build: "build:site",
    dev: "dev:site",
  },
  name: "Volt Site",
  tasks: {
    "build:site": bunFullstackTask(siteEntrypoint, {
      ...siteTaskOptions,
      command: "build",
    }),
    "dev:site": bunFullstackTask(siteEntrypoint, {
      ...siteTaskOptions,
      command: "dev",
    }),
  },
});
