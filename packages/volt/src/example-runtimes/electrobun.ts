import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadVoltEnv } from "../env";
import type { VoltReadinessProbe, VoltTargetContext } from "../contracts";
import { defineTargetTask } from "../task";

export interface ElectrobunTargetOptions {
  artifacts?: string[];
  build?: (context: VoltTargetContext) => Promise<void>;
  buildArgs?: string[];
  configPath?: string;
  cwd?: string;
  dependsOn?: string[];
  dev?: (context: VoltTargetContext) => Promise<import("../contracts").ManagedVoltProcess | void>;
  devArgs?: string[];
  env?: Record<string, string>;
  inputs?: string[];
  outputs?: string[];
  readiness?: VoltReadinessProbe | VoltReadinessProbe[];
  uses?: string[];
  watch?: string[];
  watchElectrobun?: boolean;
}

const createElectrobunEnv = (
  context: VoltTargetContext,
  env?: Record<string, string>,
) => ({
  ...loadVoltEnv({
    mode: context.mode,
    rootDir: context.rootDir,
    workspaceRoot: context.workspaceRoot,
  }),
  ...env,
  VOLT_ROOT_DIR: context.rootDir,
  VOLT_TARGET_NAME: context.currentTarget.name,
  VOLT_WORKSPACE_ROOT: context.workspaceRoot,
});

export const ElectrobunRuntime = (options: ElectrobunTargetOptions = {}) => ({
  artifacts: options.artifacts,
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
      env: createElectrobunEnv(context, options.env),
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

    const electrobunDevArgs = [
      "bunx",
      "electrobun",
      "dev",
      ...(options.watchElectrobun ? ["--watch"] : []),
      ...(options.devArgs ?? []),
    ];

    return context.spawn(
      context.currentTarget.name,
      electrobunDevArgs,
      {
        cwd,
        env: createElectrobunEnv(context, options.env),
        readiness: options.readiness,
      },
    );
  },
  runtime: "electrobun",
  target: "bun",
  uses: options.uses,
});

export const electrobun = ElectrobunRuntime;

export const electrobunTask = (
  options: ElectrobunTargetOptions & { command: "build" | "dev" },
) =>
  defineTargetTask({
    artifacts: options.artifacts,
    command: options.command,
    dependsOn: options.dependsOn,
    inputs: options.inputs,
    outputs: options.outputs,
    target: ElectrobunRuntime(options),
    uses: options.uses,
    watch: options.watch,
  });
