import { createBunPlugin, defineVoltConfig } from "volt";

const bun = createBunPlugin();

export default defineVoltConfig({
  defaults: {
    build: ["web"],
    dev: ["web"],
  },
  name: "__APP_NAME__",
  targets: {
    web: bun.fullstack({
      env: {
        PORT: process.env.PORT ?? "3000",
      },
      name: "web",
      outdir: "dist/web",
      source: "./src/web/server.runtime.ts",
    }),
  },
});
