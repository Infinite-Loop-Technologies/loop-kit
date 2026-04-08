import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { VoltTargetContext } from "../contracts";

export interface ElectrobunTargetOptions {
  build?: (context: VoltTargetContext) => Promise<void>;
  buildArgs?: string[];
  configPath?: string;
  cwd?: string;
  dependsOn?: string[];
  dev?: (context: VoltTargetContext) => Promise<import("../contracts").ManagedVoltProcess | void>;
  devArgs?: string[];
  env?: Record<string, string>;
}

export const ElectrobunRuntime = (options: ElectrobunTargetOptions = {}) => ({
  async build(context: VoltTargetContext) {
    if (options.build) {
      await options.build(context);
      return;
    }

    const cwd = resolve(context.rootDir, options.cwd ?? ".");
    const configPath = resolve(cwd, options.configPath ?? "electrobun.config.ts");
    if (!existsSync(configPath)) {
      throw new Error(
        `Electrobun target requires ${configPath}. Add electrobun.config.ts before building desktop.`,
      );
    }

    const child = context.spawn(context.currentTarget.name, [
      "bunx",
      "electrobun",
      "build",
      "--env",
      context.mode,
      ...(options.buildArgs ?? []),
    ], {
      cwd,
      env: options.env,
    });

    const exitCode = await child.process.exited;
    if (exitCode !== 0) {
      throw new Error(`Electrobun build exited with code ${exitCode}.`);
    }
  },
  dependsOn: options.dependsOn,
  async dev(context: VoltTargetContext) {
    if (options.dev) {
      return options.dev(context);
    }

    const cwd = resolve(context.rootDir, options.cwd ?? ".");
    const configPath = resolve(cwd, options.configPath ?? "electrobun.config.ts");
    if (!existsSync(configPath)) {
      throw new Error(
        `Electrobun target requires ${configPath}. Add electrobun.config.ts before starting desktop dev.`,
      );
    }

    return context.spawn(context.currentTarget.name, ["bunx", "electrobun", "dev", ...(options.devArgs ?? [])], {
      cwd,
      env: options.env,
    });
  },
  runtime: "electrobun",
  target: "bun",
});

export const electrobun = ElectrobunRuntime;
