import { createBunPlugin, defineVoltConfig } from "volt";

const bun = createBunPlugin();

export default defineVoltConfig({
  defaults: {
    build: ["web"],
    dev: ["web"],
  },
  name: "Loom Demo",
  targets: {
    web: bun.fullstack({
      env: {
        PORT: process.env.PORT ?? "3500",
        VOLT_MODE:
          process.env.VOLT_MODE === "production" ? "production" : "development",
      },
      name: "web",
      outdir: "dist/web",
      source: "./src/web/server.runtime.ts",
    }),
  },
});
