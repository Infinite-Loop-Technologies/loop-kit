import { defineProjectConfig } from "volt";
import { bunFullstack } from "volt/bun";
import webEntrypoint from "./src/web/server.runtime";

const web = bunFullstack(webEntrypoint, {
  env: {
    INSTANT_ADMIN_TOKEN: process.env.INSTANT_ADMIN_TOKEN ?? "",
    INSTANT_APP_ID: process.env.INSTANT_APP_ID ?? "",
    PORT: process.env.PORT ?? "3000",
    VOLT_MODE:
      process.env.VOLT_MODE === "production" ? "production" : "development",
  },
  inputs: ["src/**/*", "public/**/*"],
  outdir: "dist/web",
  outputs: ["dist/web/**"],
  readiness: {
    kind: "stdout",
    pattern: "forge server listening",
  },
  watch: ["src/**/*", "public/**/*"],
});

export default defineProjectConfig({
  defaults: {
    build: "build:web",
    dev: "dev:web",
  },
  name: "Forge Workspace",
  tasks: {
    ...web.tasks("web"),
  },
});
