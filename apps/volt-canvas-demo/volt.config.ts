import { defineProjectConfig, electrobunTask } from "volt";

const desktopTaskOptions = {
  configPath: "electrobun.config.ts",
  cwd: ".",
  env: {
    VOLT_MODE:
      process.env.VOLT_MODE === "production" ? "production" : "development",
  },
  inputs: ["electrobun.config.ts", "src/**/*.css", "src/**/*.d.ts", "src/**/*.html", "src/**/*.ts", "src/**/*.tsx"],
  outputs: ["build/**", "dist/**", "release/**"],
  readiness: {
    kind: "stdout" as const,
    pattern: "volt-canvas-demo desktop ready",
  },
  watch: ["electrobun.config.ts", "src/**/*.css", "src/**/*.d.ts", "src/**/*.html", "src/**/*.ts", "src/**/*.tsx"],
};

export default defineProjectConfig({
  defaults: {
    build: ["build:desktop"],
    dev: ["dev:desktop"],
  },
  name: "Volt Canvas Demo",
  tasks: {
    "build:desktop": electrobunTask({
      ...desktopTaskOptions,
      command: "build",
    }),
    "dev:desktop": electrobunTask({
      ...desktopTaskOptions,
      command: "dev",
    }),
  },
});
