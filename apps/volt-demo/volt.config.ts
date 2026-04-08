import { createBunPlugin, defineVoltConfig } from "volt";
import { createDemoRuntimeSession } from "./src/dev/demoSession";
import { createPortlessShareProvider } from "./src/dev/portlessShareProvider";

const command = process.env.VOLT_COMMAND === "build" ? "build" : "dev";
const mode =
  process.env.VOLT_MODE === "production" ? "production" : "development";
const enableShare = process.env.VOLT_SHARE === "1";
const shareProvider =
  command === "dev" && enableShare ? createPortlessShareProvider() : undefined;

const session = await createDemoRuntimeSession({
  command,
  enableShare,
  mode,
  rootDir: import.meta.dir,
  shareProvider,
});

const bun = createBunPlugin();

export default defineVoltConfig({
  defaults: {
    build: ["web", "game"],
    dev: ["web"],
  },
  name: "Volt Demo",
  targets: {
    game: bun.server({
      env: {
        GAME_SERVER_PORT: String(session.game.port),
        VOLT_MODE: session.mode,
      },
      name: "game",
      outdir: "dist/game-server",
      source: "./src/game-server/server.runtime.ts",
    }),
    web: bun.fullstack({
      dependsOn: ["game"],
      env: {
        PORT: String(session.web.port),
        VOLT_GAME_PUBLIC_WS_URL: session.game.publicWsUrl ?? "",
        VOLT_GAME_WS_URL: session.game.localWsUrl,
        VOLT_MODE: session.mode,
        VOLT_SHARE_ENABLED: session.share.enabled ? "1" : "0",
        VOLT_WEB_PUBLIC_URL: session.web.publicUrl ?? "",
      },
      name: "web",
      outdir: "dist/web",
      source: "./src/web/server.runtime.ts",
    }),
  },
});
