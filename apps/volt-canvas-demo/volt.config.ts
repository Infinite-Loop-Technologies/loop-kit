import {
  defineProjectConfig,
  electrobunTask,
  flow,
  type ProcessHandle,
} from "volt";
import { bunFullstack } from "volt/bun";
import mainviewServerEntrypoint from "./src/mainview/server.runtime";


const canvasWebUiPort = process.env.VOLT_CANVAS_WEB_UI_PORT ?? "3310";
const canvasWebUiUrl =
  process.env.VOLT_CANVAS_WEB_UI_URL ?? `http://127.0.0.1:${canvasWebUiPort}`;

const desktopInputs = [
  "electrobun.config.ts",
  "package.json",
  "src/bun/**/*.ts",
  "src/**/*.css",
  "src/**/*.d.ts",
  "src/**/*.html",
  "src/**/*.ts",
  "src/**/*.tsx",
];

const desktopOutputs = ["build/**", "dist/**", "release/**"];

const desktopTaskOptions = {
  configPath: "electrobun.config.ts",
  cwd: ".",
  inputs: desktopInputs,
  outputs: desktopOutputs,
  readiness: {
    kind: "stdout" as const,
    pattern: "volt-canvas-demo desktop ready",
  },
  watch: desktopInputs,
  watchElectrobun: false,
};

const webUi = bunFullstack(mainviewServerEntrypoint, {
  env: {
    PORT: canvasWebUiPort,
    VOLT_MODE: "development",
  },
  inputs: ["src/**/*.css", "src/**/*.d.ts", "src/**/*.html", "src/**/*.ts", "src/**/*.tsx"],
  outdir: "dist/mainview-dev",
  outputs: ["dist/mainview-dev/**"],
  readiness: {
    kind: "stdout",
    pattern: "volt-canvas-demo web ui ready",
  },
  watch: ["src/**/*.css", "src/**/*.d.ts", "src/**/*.html", "src/**/*.ts", "src/**/*.tsx"],
});

export default defineProjectConfig({
  defaults: {
    build: ["build:desktop"],
    dev: ["dev:desktop"],
  },
  name: "Volt Canvas Demo",
  tasks: {
    ...webUi.tasks("web-ui"),
    "build:desktop": electrobunTask({
      ...desktopTaskOptions,
      command: "build",
      env: {
        VOLT_MODE: "production",
      },
    }),
    "dev:desktop:host": electrobunTask({
      ...desktopTaskOptions,
      command: "dev",
      env: {
        VOLT_CANVAS_WEB_UI_URL: canvasWebUiUrl,
        VOLT_MODE: "development",
      },
    }),
    "dev:desktop": flow("dev:desktop", function* (ctx) {
      yield* ctx.log("desktop-topology-start", "starting Volt Canvas Demo desktop topology");

      const webUiTask = yield* ctx.forkTask<ProcessHandle>("dev:web-ui");
      const webUiHandle = yield* ctx.join(webUiTask);
      yield* ctx.waitFor("wait-for-web-ui", webUiHandle, { timeoutMs: 15_000 });

      const desktopTask = yield* ctx.forkTask<ProcessHandle>("dev:desktop:host");
      const desktopHandle = yield* ctx.join(desktopTask);
      yield* ctx.waitFor("wait-for-desktop-host", desktopHandle, { timeoutMs: 15_000 });

      yield* ctx.log("desktop-topology-ready", "Volt Canvas Demo desktop topology is ready", {
        desktopUrl: canvasWebUiUrl,
      });

      return {
        desktop: desktopHandle,
        webUi: webUiHandle,
      };
    }, {
      persist: false,
    }),
  },
});
