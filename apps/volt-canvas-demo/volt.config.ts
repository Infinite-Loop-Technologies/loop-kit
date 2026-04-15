import { defineProjectConfig } from "volt";
import { bunFullstack } from "volt/bun";
import { electrobun } from "volt/electrobun";

const canvasWebUiPort = Number(process.env.VOLT_CANVAS_WEB_UI_PORT ?? 3310);

const webUi = bunFullstack({
  entry: () => import("./src/mainview/server.runtime"),
  env: {
    PORT: String(canvasWebUiPort),
    VOLT_MODE: "development",
  },
  inputs: ["src/**/*.css", "src/**/*.d.ts", "src/**/*.html", "src/**/*.ts", "src/**/*.tsx"],
  outdir: "dist/mainview-dev",
  outputs: ["dist/mainview-dev/**"],
  port: canvasWebUiPort,
  readiness: {
    kind: "stdout",
    pattern: "volt-canvas-demo web ui ready",
  },
  watch: ["src/**/*.css", "src/**/*.d.ts", "src/**/*.html", "src/**/*.ts", "src/**/*.tsx"],
});

const desktop = electrobun({
  env: {
    VOLT_CANVAS_WEB_UI_URL: webUi.exports.url ?? `http://127.0.0.1:${canvasWebUiPort}`,
    VOLT_MODE: "development",
  },
  identifier: "dev.loopkit.volt-canvas-demo",
  inputs: [
    "package.json",
    "src/**/*.css",
    "src/**/*.d.ts",
    "src/**/*.html",
    "src/**/*.ts",
    "src/**/*.tsx",
  ],
  needs: [webUi],
  outputs: ["build/**", "dist/**", "release/**"],
  readiness: {
    kind: "stdout",
    pattern: "desktop desktop ready",
  },
  watch: [
    "package.json",
    "src/**/*.css",
    "src/**/*.d.ts",
    "src/**/*.html",
    "src/**/*.ts",
    "src/**/*.tsx",
  ],
  window: {
    height: 980,
    title: "Volt Canvas",
    url: webUi.exports.url ?? `http://127.0.0.1:${canvasWebUiPort}`,
    width: 1560,
  },
});

export default defineProjectConfig({
  adapters: {
    desktop,
    "web-ui": webUi,
  },
  defaults: {
    build: ["build:desktop"],
    dev: ["dev:desktop"],
  },
  name: "Volt Canvas Demo",
  tasks: {},
});
