import { bunFullstackTarget, defineVoltConfig } from "volt";
import webEntrypoint from "./src/web/server.runtime";

export default defineVoltConfig({
  defaults: {
    build: ["web"],
    dev: ["web"],
  },
  name: "Dock Demo",
  targets: {
    web: bunFullstackTarget(webEntrypoint, {
      env: {
        PORT: process.env.PORT ?? "3400",
        VOLT_MODE:
          process.env.VOLT_MODE === "production" ? "production" : "development",
      },
      outdir: "dist/web",
    }),
  },
});
