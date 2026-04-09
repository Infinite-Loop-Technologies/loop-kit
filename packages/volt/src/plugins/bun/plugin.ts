import { dirname, relative, resolve } from "node:path";
import type {
  ManagedVoltProcess,
  VoltEntrypoint,
  VoltJsonValue,
  VoltTargetContext,
} from "../../contracts";
import { isVoltEntrypoint } from "../../contracts";
import { resolveScopedTargetValue } from "../../platform/scoped";
import type { VoltServiceProvider } from "../../services";
import { defineTargetTask } from "../../task";
import {
  createVoltPaths,
  failOnBuildErrors,
  runSpawnedCommand,
  sanitizeForPath,
  writeJsonFile,
  writeTextFile,
} from "../../utils";

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

const resolveEntrypointSource = <TServices>(entrypoint: BunEntrypoint<TServices>) =>
  typeof entrypoint === "string" ? entrypoint : entrypoint.source;

const toImportPath = (path: string) => {
  const normalized = path
    .replace(/\\/g, "/")
    .replace(/\.(?:[cm]?[jt]sx?)$/u, "");
  return normalized.startsWith(".") ? normalized : `./${normalized}`;
};

const createGeneratedBunEntrypoint = async <TServices>(
  context: VoltTargetContext,
  entrypoint: VoltEntrypoint<TServices>,
  runtime: "bun-fullstack" | "bun-server",
  providedServicesPath?: string,
) => {
  const voltPaths = createVoltPaths(context.rootDir);
  const generatedPath = resolve(
    voltPaths.targetsGeneratedDir,
    `${sanitizeForPath(context.currentTarget.name)}.${runtime}.entry.ts`,
  );
  const runtimeFactory =
    runtime === "bun-fullstack"
      ? "createBunFullstackServices"
      : "createBunServerServices";
  const sourceImportPath = toImportPath(
    relative(dirname(generatedPath), resolveEntrypointSource(entrypoint)),
  );

  return writeTextFile(
    generatedPath,
    [
      `import entrypoint from ${JSON.stringify(sourceImportPath)};`,
      `import { ${runtimeFactory}, combineVoltServices, loadVoltProvidedServices, runVoltEntrypoint } from "volt";`,
      ``,
      `const rootDir = ${JSON.stringify(context.rootDir)};`,
      `const providedServicesPath = ${providedServicesPath ? JSON.stringify(providedServicesPath) : "undefined"};`,
      ``,
      `if (import.meta.main) {`,
      `  void runVoltEntrypoint(entrypoint, async () => combineVoltServices(`,
      `    entrypoint,`,
      `    ${runtimeFactory}(rootDir),`,
      `    await loadVoltProvidedServices<Record<string, unknown>>(providedServicesPath),`,
      `  ));`,
      `}`,
      ``,
      `export default entrypoint;`,
      ``,
    ].join("\n"),
  );
};

const prepareBunEntrypointSource = async <TServices>(
  context: VoltTargetContext,
  entrypoint: BunEntrypoint<TServices>,
  runtime: "bun-fullstack" | "bun-server",
  providedServicesPath?: string,
) => {
  if (typeof entrypoint === "string") {
    return resolve(context.rootDir, entrypoint);
  }

  if (!isVoltEntrypoint(entrypoint)) {
    throw new Error(`Invalid Volt entrypoint for target ${context.currentTarget.name}.`);
  }

  return createGeneratedBunEntrypoint(
    context,
    entrypoint,
    runtime,
    providedServicesPath,
  );
};

export interface BunRuntimeOptions<
  TPlatform extends object = {},
  TProvidedServices extends Record<string, VoltJsonValue> = {},
> {
  artifacts?: string[];
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
  services?: VoltServiceProvider<TProvidedServices>;
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

const buildDefaultBunTarget = async <TServices>(
  context: VoltTargetContext,
  entrypoint: BunEntrypoint<TServices>,
  options: BunRuntimeOptions,
  runtime: "bun-fullstack" | "bun-server",
) => {
  const providedServicesPath = await writeProvidedServices(context, options.services);
  const runtimeEntrypoint = await prepareBunEntrypointSource(
    context,
    entrypoint,
    runtime,
    providedServicesPath,
  );
  const result = await Bun.build({
    define: options.define,
    entrypoints: [runtimeEntrypoint],
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
    root: context.rootDir,
    target: "bun",
  });

  failOnBuildErrors(result);
};

const devDefaultBunTarget = async <TServices>(
  context: VoltTargetContext,
  entrypoint: BunEntrypoint<TServices>,
  options: BunRuntimeOptions,
  runtime: "bun-fullstack" | "bun-server",
) => {
  const providedServicesPath = await writeProvidedServices(context, options.services);
  const runtimeEntrypoint = await prepareBunEntrypointSource(
    context,
    entrypoint,
    runtime,
    providedServicesPath,
  );

  return context.spawn(
    context.currentTarget.name,
    [
      "bun",
      "--watch",
      ...createRuntimeFeatures(runtime).flatMap((feature) => ["--feature", feature]),
      ...createModeFeatures(context.mode).flatMap((feature) => ["--feature", feature]),
      ...(options.features ?? []).flatMap((feature) => ["--feature", feature]),
      runtimeEntrypoint,
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
};

const writeProvidedServices = async <
  TProvidedServices extends Record<string, VoltJsonValue>,
>(
  context: VoltTargetContext,
  provider?: VoltServiceProvider<TProvidedServices>,
) => {
  if (!provider) {
    return undefined;
  }

  const voltPaths = createVoltPaths(context.rootDir);
  const path = resolve(
    voltPaths.servicesStateDir,
    `${sanitizeForPath(context.currentTarget.name)}.json`,
  );
  const services = await provider.resolve(context);
  await writeJsonFile(path, services);
  return path;
};

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

const createBunRuntimeTarget = <TServices>(
  runtime: "bun-fullstack" | "bun-server",
  entrypoint: BunEntrypoint<TServices>,
  options: BunRuntimeOptions = {},
) => ({
  artifacts: options.artifacts,
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

export const bunFullstackTarget = BunFullstackRuntime;
export const bunServerTarget = BunServerRuntime;
export const bunCommandTarget = BunCommandRuntime;

export const bunFullstackTask = <
  TServices = unknown,
  TPlatform extends object = {},
>(
  entrypoint: BunEntrypoint<TServices>,
  options: BunRuntimeOptions<TPlatform> & { command: "build" | "dev" },
) =>
  defineTargetTask({
    artifacts: options.artifacts,
    command: options.command,
    dependsOn: options.dependsOn,
    target: BunFullstackRuntime(entrypoint, options),
    uses: options.uses,
  });

export const bunServerTask = <
  TServices = unknown,
  TPlatform extends object = {},
>(
  entrypoint: BunEntrypoint<TServices>,
  options: BunRuntimeOptions<TPlatform> & { command: "build" | "dev" },
) =>
  defineTargetTask({
    artifacts: options.artifacts,
    command: options.command,
    dependsOn: options.dependsOn,
    target: BunServerRuntime(entrypoint, options),
    uses: options.uses,
  });

export const bunCommandTask = (
  options: BunCommandRuntimeOptions & { command: "build" | "dev" },
) =>
  defineTargetTask({
    command: options.command,
    dependsOn: options.dependsOn,
    target: BunCommandRuntime(options),
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
