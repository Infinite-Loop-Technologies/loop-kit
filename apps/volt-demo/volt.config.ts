import { defineProjectConfig, defineServices } from "volt";
import { bunFullstackTask, bunServerTask } from "volt/bun";
import { contractBindingsTask } from "volt/contracts";
import { flow } from "volt/flow";
import {
  createDemoSessionArtifact,
  type DemoRuntimeSession,
} from "./src/dev/demoSession";
import { GameApi } from "./src/contracts/gameApi";
import { BrowserRuntime } from "./src/contracts/runtimeSession";
import { GameServer } from "./src/entrypoints/gameServer";
import { WebApp } from "./src/entrypoints/webApp";
import { createPortlessShareProvider } from "./src/dev/portlessShareProvider";

const command = process.env.VOLT_COMMAND === "build" ? "build" : "dev";
const mode =
  process.env.VOLT_MODE === "production" ? "production" : "development";
const enableShare = process.env.VOLT_SHARE === "1";
const shareProvider =
  command === "dev" && enableShare ? createPortlessShareProvider() : undefined;

const sessionArtifact = createDemoSessionArtifact({
  command,
  enableShare,
  mode,
  rootDir: import.meta.dir,
  shareProvider,
});

const gameServices = defineServices(({ artifacts }) => {
  const session = artifacts.requireValue<DemoRuntimeSession>("runtimeSession");
  return {
    demoGame: {
      healthUrl: `${session.game.localHttpUrl}/health`,
      mode: session.mode,
      port: session.game.port,
      websocketUrl: session.game.localWsUrl,
    },
  };
});

const webServices = defineServices(({ artifacts }) => {
  const session = artifacts.requireValue<DemoRuntimeSession>("runtimeSession");
  return {
    demoWeb: {
      browserConfig: session.browserConfig,
      mode: session.mode,
      port: session.web.port,
    },
  };
});

export default defineProjectConfig({
  artifacts: {
    runtimeSession: sessionArtifact,
  },
  defaults: {
    build: ["codegen:demo", "build:game", "build:web"],
    dev: "dev:full",
  },
  name: "Volt Demo",
  tasks: {
    "build:game": bunServerTask(GameServer, {
      artifacts: ["runtimeSession"],
      command: "build",
      outdir: "dist/game-server",
      services: gameServices,
    }),
    "build:web": bunFullstackTask(WebApp, {
      artifacts: ["runtimeSession"],
      command: "build",
      outdir: "dist/web",
      services: webServices,
    }),
    "codegen:demo": contractBindingsTask({
      contracts: [GameApi, BrowserRuntime],
      jsonPath: ".volt/state/contracts/demo-contracts.json",
      tsPath: ".volt/generated/contracts/demo-contracts.ts",
    }),
    "dev:full": flow("dev:full", function* (ctx) {
      const game = yield* ctx.runTask("dev:game");
      const web = yield* ctx.runTask("dev:web", {
        inputs: { game },
      });
      return { game, web };
    }),
    "dev:game": bunServerTask(GameServer, {
      artifacts: ["runtimeSession"],
      command: "dev",
      outdir: "dist/game-server",
      services: gameServices,
    }),
    "dev:web": bunFullstackTask(WebApp, {
      artifacts: ["runtimeSession"],
      command: "dev",
      outdir: "dist/web",
      services: webServices,
    }),
  },
});
