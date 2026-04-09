import { defineProjectConfig } from "volt";
import { bunFullstackTask } from "volt/bun";
import webEntrypoint from "./src/web/server.runtime";

const webTaskOptions = {
  env: {
    PORT: process.env.PORT ?? "3000",
    VOLT_MODE:
      process.env.VOLT_MODE === "production" ? "production" : "development",
  },
  outdir: "dist/web",
};

export default defineProjectConfig({
  defaults: {
    build: "build:web",
    dev: "dev:web",
  },
  name: "Forge Workspace",
  tasks: {
    "build:web": bunFullstackTask(webEntrypoint, {
      ...webTaskOptions,
      command: "build",
    }),
    "dev:web": bunFullstackTask(webEntrypoint, {
      ...webTaskOptions,
      command: "dev",
    }),
  },
});
