import { createBunPlugin, defineVoltConfig } from "volt";

const bun = createBunPlugin();

export default defineVoltConfig({
  defaults: {
    build: ["site"],
    dev: ["site"],
  },
  name: "Volt Site",
  targets: {
    site: bun.fullstack({
      env: {
        PORT: process.env.PORT ?? "6401",
        VOLT_MODE:
          process.env.VOLT_MODE === "production" ? "production" : "development",
      },
      name: "site",
      outdir: "dist/site",
      source: "./src/web/server.runtime.ts",
    }),
  },
});
