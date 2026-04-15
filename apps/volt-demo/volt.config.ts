import { defineProjectConfig, defineRuntimeInputs, type ProcessHandle } from "volt";
import { bunFullstack, bunServer } from "volt/bun";
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

const gameRuntimeInputs = defineRuntimeInputs(({ artifacts }) => {
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

const webRuntimeInputs = defineRuntimeInputs(({ artifacts }) => {
  const session = artifacts.requireValue<DemoRuntimeSession>("runtimeSession");
  return {
    demoWeb: {
      browserConfig: session.browserConfig,
      mode: session.mode,
      port: session.web.port,
    },
  };
});

const game = bunServer(GameServer, {
  artifacts: ["runtimeSession"],
  inputs: ["src/contracts/**/*.ts", "src/dev/**/*.ts", "src/entrypoints/gameServer.ts", "src/game-server/**/*.ts", "src/runtime/gameServer.ts"],
  outdir: "dist/game-server",
  outputs: ["dist/game-server/**", ".volt/generated/browser-config.ts"],
  readiness: {
    kind: "stdout",
    pattern: "game server listening",
  },
  runtimeInputs: gameRuntimeInputs,
  watch: ["src/contracts/**/*.ts", "src/dev/**/*.ts", "src/entrypoints/gameServer.ts", "src/game-server/**/*.ts", "src/runtime/gameServer.ts"],
});

const web = bunFullstack(WebApp, {
  artifacts: ["runtimeSession"],
  inputs: ["src/app.tsx", "src/browser/**/*.ts", "src/browser/**/*.tsx", "src/entrypoints/webApp.ts", "src/runtime/webApp.ts", "src/web/**/*.ts", "src/**/*.css", "src/**/*.html"],
  outdir: "dist/web",
  outputs: ["dist/web/**"],
  readiness: {
    kind: "stdout",
    pattern: "Server running at",
  },
  runtimeInputs: webRuntimeInputs,
  watch: ["src/app.tsx", "src/browser/**/*.ts", "src/browser/**/*.tsx", "src/entrypoints/webApp.ts", "src/runtime/webApp.ts", "src/web/**/*.ts", "src/**/*.css", "src/**/*.html"],
});

export default defineProjectConfig({
  adapters: {
    game,
    web,
  },
  artifacts: {
    runtimeSession: sessionArtifact,
  },
  defaults: {
    build: ["codegen:demo", "build:game", "build:web"],
    dev: "dev:full",
  },
  name: "Volt Demo",
  tasks: {
    "codegen:demo": contractBindingsTask({
      contracts: [GameApi, BrowserRuntime],
      jsonPath: ".volt/state/contracts/demo-contracts.json",
      tsPath: ".volt/generated/contracts/demo-contracts.ts",
    }),
    "dev:full": flow("dev:full", async (ctx) => {
      await ctx.log("topology-start", "starting Volt demo topology");
      const gameTask = await ctx.forkTask("dev:game");
      const game = (await ctx.join(gameTask)) as ProcessHandle;
      await ctx.waitFor("wait-for-game-readiness", game, {
        timeoutMs: 15_000,
      });
      await ctx.log("game-ready", "game server is ready");
      const webTask = await ctx.forkTask("dev:web", {
        inputs: { game },
      });
      const web = (await ctx.join(webTask)) as ProcessHandle;
      await ctx.waitFor("wait-for-web-readiness", web, {
        timeoutMs: 15_000,
      });
      await ctx.log("topology-ready", "demo topology is ready");
      return { game, web };
    }),
  },
});
