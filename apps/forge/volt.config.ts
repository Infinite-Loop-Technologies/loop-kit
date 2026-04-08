import { createBunPlugin, defineVoltConfig } from "volt";

const bun = createBunPlugin();

export default defineVoltConfig({
  defaults: {
    build: ["web"],
    dev: ["web"],
  },
  name: "Forge Workspace",
  targets: {
    web: bun.fullstack({
      env: {
        PORT: process.env.PORT ?? "3000",
        VOLT_MODE:
          process.env.VOLT_MODE === "production" ? "production" : "development",
      },
      name: "web",
      outdir: "dist/web",
      source: "./src/web/server.runtime.ts",
    }),
  },
});
