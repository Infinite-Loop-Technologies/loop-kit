import { resolve } from "node:path";
import type {
  ManagedVoltProcess,
  VoltEntrypoint,
  VoltTargetContext,
} from "../../contracts";
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

type BunEntrypoint<TServices = unknown> = string | VoltEntrypoint<TServices>;

const resolveEntrypointSource = (entrypoint: BunEntrypoint) =>
  typeof entrypoint === "string" ? entrypoint : entrypoint.source;

export interface BunRuntimeOptions<TPlatform extends object = {}> {
  build?: (context: VoltTargetContext) => Promise<void>;
  define?: Record<string, string>;
  dependsOn?: string[];
  dev?: (context: VoltTargetContext) => Promise<ManagedVoltProcess | void>;
  env?: Record<string, string>;
  external?: string[];
  features?: string[];
  minify?: boolean;
  naming?: Bun.BuildConfig["naming"];
  outdir?: string;
  platform?: import("../../platform/scoped").ScopedTargetValue<string, TPlatform> | TPlatform;
  plugins?: Bun.BunPlugin[];
  uses?: string[];
}

export interface BunCommandRuntimeOptions {
  commands: {
    build?: string[];
    dev?: string[];
  };
  cwd?: string;
  dependsOn?: string[];
  dev?: (context: VoltTargetContext) => Promise<ManagedVoltProcess | void>;
  env?: Record<string, string>;
  uses?: string[];
}

export interface LegacyBunTargetOptions<
  TTargetName extends string,
  TPlatform extends object = {},
> extends BunRuntimeOptions<TPlatform> {
  name: TTargetName;
  source: BunEntrypoint;
}

export interface LegacyBunCommandTargetOptions extends BunCommandRuntimeOptions {
  name: string;
}

const buildDefaultBunTarget = async (
  context: VoltTargetContext,
  entrypoint: BunEntrypoint,
  options: BunRuntimeOptions,
  runtime: "bun-fullstack" | "bun-server",
) => {
  const result = await Bun.build({
    define: options.define,
    entrypoints: [resolve(context.rootDir, resolveEntrypointSource(entrypoint))],
    external: options.external,
    features: [
      ...createRuntimeFeatures(runtime),
      ...createModeFeatures(context.mode),
      ...(options.features ?? []),
    ],
    minify: options.minify ?? true,
    naming: options.naming,
    outdir: resolve(context.rootDir, options.outdir ?? `dist/${context.currentTarget.name}`),
    plugins: options.plugins,
    target: "bun",
  });

  failOnBuildErrors(result);
};

const devDefaultBunTarget = (
  context: VoltTargetContext,
  entrypoint: BunEntrypoint,
  options: BunRuntimeOptions,
  runtime: "bun-fullstack" | "bun-server",
) =>
  context.spawn(
    context.currentTarget.name,
    [
      "bun",
      "--watch",
      ...createRuntimeFeatures(runtime).flatMap((feature) => ["--feature", feature]),
      ...createModeFeatures(context.mode).flatMap((feature) => ["--feature", feature]),
      ...(options.features ?? []).flatMap((feature) => ["--feature", feature]),
      resolveEntrypointSource(entrypoint),
    ],
    {
      cwd: context.rootDir,
      env: {
        ...createIntegrationEnv(context),
        ...options.env,
        VOLT_PLATFORM_CONFIG: JSON.stringify(
          resolveScopedTargetValue(context.currentTarget.name, options.platform) ?? {},
        ),
        VOLT_TARGET_NAME: context.currentTarget.name,
      },
    },
  );

const resolveCommandCwd = (context: VoltTargetContext, cwd?: string) =>
  cwd ? resolve(context.rootDir, cwd) : context.rootDir;

const buildCommandTarget = async (
  context: VoltTargetContext,
  options: BunCommandRuntimeOptions,
) => {
  if (!options.commands.build) {
    return;
  }

  const child = context.spawn(context.currentTarget.name, options.commands.build, {
    cwd: resolveCommandCwd(context, options.cwd),
    env: {
      ...createIntegrationEnv(context),
      ...options.env,
    },
  });
  await runSpawnedCommand(child, `${context.currentTarget.name} build`);
};

const devCommandTarget = (
  context: VoltTargetContext,
  options: BunCommandRuntimeOptions,
) => {
  if (!options.commands.dev) {
    return;
  }

  return context.spawn(context.currentTarget.name, options.commands.dev, {
    cwd: resolveCommandCwd(context, options.cwd),
    env: {
      ...createIntegrationEnv(context),
      ...options.env,
    },
  });
};

const createBunRuntimeTarget = (
  runtime: "bun-fullstack" | "bun-server",
  entrypoint: BunEntrypoint,
  options: BunRuntimeOptions = {},
) => ({
  async build(context: VoltTargetContext) {
    if (options.build) {
      await options.build(context);
      return;
    }

    await buildDefaultBunTarget(context, entrypoint, options, runtime);
  },
  dependsOn: options.dependsOn,
  async dev(context: VoltTargetContext) {
    if (options.dev) {
      return options.dev(context);
    }

    return devDefaultBunTarget(context, entrypoint, options, runtime);
  },
  runtime,
  target: "bun",
  uses: options.uses,
});

export const BunFullstackRuntime = <
  TServices = unknown,
  TPlatform extends object = {},
>(
  entrypoint: BunEntrypoint<TServices>,
  options: BunRuntimeOptions<TPlatform> = {},
) => createBunRuntimeTarget("bun-fullstack", entrypoint, options);

export const BunServerRuntime = <
  TServices = unknown,
  TPlatform extends object = {},
>(
  entrypoint: BunEntrypoint<TServices>,
  options: BunRuntimeOptions<TPlatform> = {},
) => createBunRuntimeTarget("bun-server", entrypoint, options);

export const BunCommandRuntime = (options: BunCommandRuntimeOptions) => ({
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
});

export const createBunPlugin = () => ({
  command: (options: LegacyBunCommandTargetOptions) => BunCommandRuntime(options),
  fullstack: <TTargetName extends string, TPlatform extends object = {}>(
    options: LegacyBunTargetOptions<TTargetName, TPlatform>,
  ) => BunFullstackRuntime(options.source, options),
  server: <TTargetName extends string, TPlatform extends object = {}>(
    options: LegacyBunTargetOptions<TTargetName, TPlatform>,
  ) => BunServerRuntime(options.source, options),
});
