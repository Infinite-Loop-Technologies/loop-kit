import { resolve } from "node:path";
import type { VoltTargetContext } from "../../contracts";
import { resolveScopedTargetValue } from "../../platform/scoped";
import { failOnBuildErrors, runSpawnedCommand } from "../../utils";

const createModeFeatures = (mode: string) =>
  mode === "production" ? ["VOLT_MODE_PRODUCTION"] : ["VOLT_MODE_DEVELOPMENT"];

const createRuntimeFeatures = (runtime: "bun-fullstack" | "bun-server") => {
  const features = ["VOLT_TARGET_BUN"] as string[];
  if (runtime === "bun-fullstack") {
    features.push("VOLT_RUNTIME_BUN_FULLSTACK");
    return features;
  }

  features.push("VOLT_RUNTIME_BUN_SERVER");
  return features;
};

const sanitizeIntegrationEnvKey = (value: string) =>
  value.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();

const createIntegrationEnv = (context: VoltTargetContext) => {
  const env: Record<string, string> = {};

  for (const name of context.currentTarget.uses) {
    const integration = context.integrations.get(name);
    if (!integration) {
      continue;
    }

    const key = sanitizeIntegrationEnvKey(name);
    if (integration.artifactPath) {
      env[`VOLT_INTEGRATION_${key}_ARTIFACT_PATH`] = integration.artifactPath;
    }
    if (integration.generatedModulePath) {
      env[`VOLT_INTEGRATION_${key}_GENERATED_MODULE_PATH`] =
        integration.generatedModulePath;
    }
    if (integration.typesPath) {
      env[`VOLT_INTEGRATION_${key}_TYPES_PATH`] = integration.typesPath;
    }
    if (integration.metadataPath) {
      env[`VOLT_INTEGRATION_${key}_METADATA_PATH`] = integration.metadataPath;
    }
  }

  return env;
};

export interface BunTargetOptions<TTargetName extends string, TPlatform extends object = {}> {
  build?: (context: VoltTargetContext) => Promise<void>;
  define?: Record<string, string>;
  dependsOn?: string[];
  dev?: (context: VoltTargetContext) => Promise<import("../../contracts").ManagedVoltProcess | void>;
  env?: Record<string, string>;
  external?: string[];
  features?: string[];
  minify?: boolean;
  name: TTargetName;
  naming?: Bun.BuildConfig["naming"];
  outdir: string;
  platform?: import("../../platform/scoped").ScopedTargetValue<TTargetName, TPlatform> | TPlatform;
  plugins?: Bun.BunPlugin[];
  source: string;
  uses?: string[];
}

export interface BunCommandTargetOptions {
  commands: {
    build?: string[];
    dev?: string[];
  };
  cwd?: string;
  dependsOn?: string[];
  dev?: (context: VoltTargetContext) => Promise<import("../../contracts").ManagedVoltProcess | void>;
  env?: Record<string, string>;
  name: string;
  uses?: string[];
}

const buildDefaultBunTarget = async (
  context: VoltTargetContext,
  options: BunTargetOptions<string>,
  runtime: "bun-fullstack" | "bun-server",
) => {
  const result = await Bun.build({
    define: options.define,
    entrypoints: [resolve(context.rootDir, options.source)],
    external: options.external,
    features: [
      ...createRuntimeFeatures(runtime),
      ...createModeFeatures(context.mode),
      ...(options.features ?? []),
    ],
    minify: options.minify ?? true,
    naming: options.naming,
    outdir: resolve(context.rootDir, options.outdir),
    plugins: options.plugins,
    target: "bun",
  });

  failOnBuildErrors(result);
};

const devDefaultBunTarget = (
  context: VoltTargetContext,
  options: BunTargetOptions<string>,
  runtime: "bun-fullstack" | "bun-server",
) =>
  context.spawn(
    options.name,
    [
      "bun",
      "--watch",
      ...createRuntimeFeatures(runtime).flatMap((feature) => ["--feature", feature]),
      ...createModeFeatures(context.mode).flatMap((feature) => ["--feature", feature]),
      ...(options.features ?? []).flatMap((feature) => ["--feature", feature]),
      options.source,
    ],
    {
      cwd: context.rootDir,
      env: {
        ...createIntegrationEnv(context),
        ...options.env,
        VOLT_TARGET_NAME: options.name,
        VOLT_PLATFORM_CONFIG: JSON.stringify(
          resolveScopedTargetValue(options.name, options.platform) ?? {},
        ),
      },
    },
  );

const resolveCommandCwd = (context: VoltTargetContext, cwd?: string) =>
  cwd ? resolve(context.rootDir, cwd) : context.rootDir;

const buildCommandTarget = async (
  context: VoltTargetContext,
  options: BunCommandTargetOptions,
) => {
  if (!options.commands.build) {
    return;
  }

  const child = context.spawn(options.name, options.commands.build, {
    cwd: resolveCommandCwd(context, options.cwd),
    env: {
      ...createIntegrationEnv(context),
      ...options.env,
    },
  });
  await runSpawnedCommand(child, `${options.name} build`);
};

const devCommandTarget = (
  context: VoltTargetContext,
  options: BunCommandTargetOptions,
) => {
  if (!options.commands.dev) {
    return;
  }

  return context.spawn(options.name, options.commands.dev, {
    cwd: resolveCommandCwd(context, options.cwd),
    env: {
      ...createIntegrationEnv(context),
      ...options.env,
    },
  });
};

export const createBunPlugin = () => ({
  command: (options: BunCommandTargetOptions) => ({
    async build(context: VoltTargetContext) {
      await buildCommandTarget(context, options);
    },
    dependsOn: options.dependsOn,
    async dev(context: VoltTargetContext) {
      if (options.dev) {
        return options.dev(context);
      }
      return devCommandTarget(context, options);
    },
    runtime: "bun-command",
    target: "bun",
    uses: options.uses,
  }),
  fullstack: <TTargetName extends string, TPlatform extends object = {}>(
    options: BunTargetOptions<TTargetName, TPlatform>,
  ) => ({
    async build(context: VoltTargetContext) {
      if (options.build) {
        await options.build(context);
        return;
      }
      await buildDefaultBunTarget(context, options, "bun-fullstack");
    },
    dependsOn: options.dependsOn,
    async dev(context: VoltTargetContext) {
      if (options.dev) {
        return options.dev(context);
      }
      return devDefaultBunTarget(context, options, "bun-fullstack");
    },
    runtime: "bun-fullstack",
    target: "bun",
    uses: options.uses,
  }),
  server: <TTargetName extends string, TPlatform extends object = {}>(
    options: BunTargetOptions<TTargetName, TPlatform>,
  ) => ({
    async build(context: VoltTargetContext) {
      if (options.build) {
        await options.build(context);
        return;
      }
      await buildDefaultBunTarget(context, options, "bun-server");
    },
    dependsOn: options.dependsOn,
    async dev(context: VoltTargetContext) {
      if (options.dev) {
        return options.dev(context);
        }
      return devDefaultBunTarget(context, options, "bun-server");
    },
    runtime: "bun-server",
    target: "bun",
    uses: options.uses,
  }),
});
