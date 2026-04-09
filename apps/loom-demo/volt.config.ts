import { bunFullstackTarget, defineVoltConfig } from "volt";
import webEntrypoint from "./src/web/server.runtime";

export default defineVoltConfig({
  defaults: {
    build: ["web"],
    dev: ["web"],
  },
  name: "Loom Demo",
  targets: {
    web: bunFullstackTarget(webEntrypoint, {
      env: {
        PORT: process.env.PORT ?? "3500",
        VOLT_MODE:
          process.env.VOLT_MODE === "production" ? "production" : "development",
      },
      outdir: "dist/web",
    }),
  },
});
