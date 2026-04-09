import { existsSync, watch } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import type {
  VoltArtifactContext,
  VoltArtifactDefinition,
  VoltArtifactOutput,
  VoltArtifactRegistry,
  ManagedVoltProcess,
  VoltConfig,
  VoltDaemonCommand,
  VoltDaemonContext,
  VoltDaemonHandle,
  VoltIntegrationContext,
  VoltIntegrationDefinition,
  VoltIntegrationOutput,
  VoltLogger,
  VoltPluginBuilder,
  VoltResolvedArtifact,
  VoltResolvedIntegration,
  VoltTargetDefinition,
} from "./contracts";
import { loadVoltConfig } from "./config";
import {
  createRootLogger,
  createSpawn,
  createVoltPaths,
  ensureDirectory,
  sanitizeForPath,
  writeJsonFile,
  writeTextFile,
} from "./utils";

type TargetGraph = VoltConfig<Record<string, VoltTargetDefinition>>["targets"];

interface LoadedVoltConfig {
  config: VoltConfig<TargetGraph>;
  configPath: string;
  rootDir: string;
  workspaceRoot: string;
}

interface WorkspaceDaemonPaths {
  logPath: string;
  pidPath: string;
  statePath: string;
}

interface WorkspaceDaemonState {
  configs: string[];
  mode: "development" | "production";
  pid?: number;
  reason?: string;
  serviceCount?: number;
  status: "running" | "starting" | "stopped" | "stopping";
  updatedAt?: string;
  watcherCount?: number;
  byConfig?: Record<
    string,
    {
      appRoot: string;
      artifacts?: string[];
      configPath: string;
      integrations: string[];
      serviceCount: number;
      status: "running" | "starting" | "stopped" | "stopping";
      targets: string[];
      watcherCount: number;
    }
  >;
}

interface LoadedPlugins {
  daemonServices: Array<{
    name: string;
    service: {
      start: (
        context: VoltDaemonContext,
      ) => Promise<ManagedVoltProcess | VoltDaemonHandle | void>;
    };
  }>;
}

const delay = (ms: number) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
const createPluginBuilder = () => {
  const daemonServices: LoadedPlugins["daemonServices"] = [];
  const builder: VoltPluginBuilder = {
    addDaemonService: (name, service) => {
      daemonServices.push({ name, service });
    },
    onCommandEnd: () => {},
    onCommandStart: () => {},
    onTargetEnd: () => {},
    onTargetStart: () => {},
  };

  return { builder, daemonServices };
};

const loadPlugins = async (
  config: VoltConfig<TargetGraph>,
): Promise<LoadedPlugins> => {
  const { builder, daemonServices } = createPluginBuilder();
  for (const plugin of config.plugins ?? []) {
    await plugin.setup(builder);
  }
  return { daemonServices };
};

const toConfigId = (workspaceRoot: string, configPath: string) =>
  sanitizeForPath(relative(workspaceRoot, configPath) || basename(configPath));

const createWorkspaceDaemonPaths = (workspaceRoot: string): WorkspaceDaemonPaths => {
  const daemonRoot = createVoltPaths(workspaceRoot).daemonDir;
  return {
    logPath: resolve(daemonRoot, "workspace.log"),
    pidPath: resolve(daemonRoot, "workspace.pid"),
    statePath: resolve(daemonRoot, "workspace.json"),
  };
};

export const discoverVoltConfigPaths = async (
  workspaceRoot: string,
): Promise<string[]> => {
  const discovered = new Set<string>();
  const rootConfig = resolve(workspaceRoot, "volt.config.ts");

  if (existsSync(rootConfig)) {
    discovered.add(rootConfig);
  }

  const glob = new Bun.Glob("apps/*/volt.config.ts");
  for await (const path of glob.scan({ cwd: workspaceRoot })) {
    discovered.add(resolve(workspaceRoot, path));
  }

  return [...discovered].sort((left, right) => left.localeCompare(right));
};

const resolveRequestedConfigPaths = async (
  workspaceRoot: string,
  requestedConfigs: string[],
) => {
  const resolvedConfigs = [...new Set(requestedConfigs.map((configPath) => resolve(workspaceRoot, configPath)))];
  if (resolvedConfigs.length > 0) {
    return resolvedConfigs.sort((left, right) => left.localeCompare(right));
  }

  return discoverVoltConfigPaths(workspaceRoot);
};

const createIntegrationContext = (
  loaded: LoadedVoltConfig,
  name: string,
  logger: VoltLogger,
  mode: "development" | "production",
): VoltIntegrationContext => {
  const voltPaths = createVoltPaths(loaded.rootDir);

  return {
    appRoot: loaded.rootDir,
    configPath: loaded.configPath,
    logger,
    mode,
    name,
    rootDir: loaded.rootDir,
    spawn: createSpawn(loaded.rootDir, logger),
    workspaceRoot: loaded.workspaceRoot,
    writeGeneratedFile: async (relativePath, content) =>
      writeTextFile(resolve(voltPaths.integrationsGeneratedDir, name, relativePath), content),
    writeMetadata: async (data) =>
      writeJsonFile(resolve(voltPaths.integrationsStateDir, `${name}.json`), data),
  };
};

const createArtifactContext = (
  loaded: LoadedVoltConfig,
  name: string,
  logger: VoltLogger,
  mode: "development" | "production",
  artifacts: VoltArtifactRegistry,
): VoltArtifactContext => {
  const voltPaths = createVoltPaths(loaded.rootDir);

  return {
    appRoot: loaded.rootDir,
    artifacts,
    configPath: loaded.configPath,
    logger,
    mode,
    name,
    rootDir: loaded.rootDir,
    spawn: createSpawn(loaded.rootDir, logger),
    workspaceRoot: loaded.workspaceRoot,
    writeGeneratedFile: async (relativePath, content) =>
      writeTextFile(resolve(voltPaths.artifactsGeneratedDir, name, relativePath), content),
    writeMetadata: async (data) =>
      writeJsonFile(resolve(voltPaths.artifactsStateDir, `${name}.json`), data),
  };
};

const normalizeIntegrationOutput = async (
  loaded: LoadedVoltConfig,
  name: string,
  definition: VoltIntegrationDefinition,
  output: VoltIntegrationOutput | void,
): Promise<VoltResolvedIntegration> => {
  const resolved: VoltResolvedIntegration = {
    artifactPath: output?.artifactPath,
    generatedModulePath: output?.generatedModulePath,
    kind: definition.kind,
    metadata: output?.metadata,
    name,
    typesPath: output?.typesPath,
  };
  const metadataPath = resolve(createVoltPaths(loaded.rootDir).integrationsStateDir, `${name}.json`);
  resolved.metadataPath = metadataPath;

  await ensureDirectory(createVoltPaths(loaded.rootDir).integrationsStateDir);
  await writeJsonFile(metadataPath, {
    artifactPath: resolved.artifactPath,
    generatedModulePath: resolved.generatedModulePath,
    kind: resolved.kind,
    metadata: resolved.metadata ?? {},
    name: resolved.name,
    typesPath: resolved.typesPath,
  });

  return resolved;
};

const normalizeArtifactOutput = async (
  loaded: LoadedVoltConfig,
  name: string,
  definition: VoltArtifactDefinition,
  output: VoltArtifactOutput | void,
): Promise<VoltResolvedArtifact> => {
  const resolved: VoltResolvedArtifact = {
    artifactPath: output?.artifactPath,
    generatedModulePath: output?.generatedModulePath,
    kind: definition.kind,
    metadata: output?.metadata,
    name,
    typesPath: output?.typesPath,
    value: output?.value,
  };
  const metadataPath = resolve(
    createVoltPaths(loaded.rootDir).artifactsStateDir,
    `${name}.json`,
  );
  resolved.metadataPath = metadataPath;

  await ensureDirectory(createVoltPaths(loaded.rootDir).artifactsStateDir);
  await writeJsonFile(metadataPath, {
    artifactPath: resolved.artifactPath,
    generatedModulePath: resolved.generatedModulePath,
    kind: resolved.kind,
    metadata: resolved.metadata ?? {},
    name: resolved.name,
    typesPath: resolved.typesPath,
    value: resolved.value ?? null,
  });

  return resolved;
};

const createArtifactRegistry = (
  resolved: Record<string, VoltResolvedArtifact>,
): VoltArtifactRegistry => ({
  all: resolved,
  get: (name) => resolved[name],
  require: (name) => {
    const artifact = resolved[name];
    if (!artifact) {
      throw new Error(`Missing Volt artifact output: ${name}`);
    }
    return artifact;
  },
  requireValue: (name) => {
    const artifact = resolved[name];
    if (!artifact) {
      throw new Error(`Missing Volt artifact output: ${name}`);
    }
    if (artifact.value === undefined) {
      throw new Error(`Volt artifact ${name} does not have a value output.`);
    }
    return artifact.value as never;
  },
});

export const collectTargetIntegrations = (
  graph: TargetGraph,
  targetNames: string[],
): string[] => {
  const names = new Set<string>();
  for (const targetName of targetNames) {
    const target = graph[targetName];
    for (const name of target?.uses ?? []) {
      names.add(name);
    }
  }
  return [...names];
};

export const collectTargetArtifacts = (
  graph: TargetGraph,
  targetNames: string[],
): string[] => {
  const names = new Set<string>();
  for (const targetName of targetNames) {
    const target = graph[targetName];
    for (const name of target?.artifacts ?? []) {
      names.add(name);
    }
  }
  return [...names];
};

const orderArtifacts = (
  definitions: Record<string, VoltArtifactDefinition>,
  artifactNames: string[],
) => {
  const ordered: string[] = [];
  const seen = new Set<string>();

  const visit = (name: string) => {
    const definition = definitions[name];
    if (!definition) {
      throw new Error(`Unknown Volt artifact: ${name}`);
    }
    if (seen.has(name)) {
      return;
    }
    seen.add(name);
    for (const dependency of definition.dependsOn ?? []) {
      visit(dependency);
    }
    ordered.push(name);
  };

  for (const name of artifactNames) {
    visit(name);
  }

  return ordered;
};

export const resolveArtifactsForPhase = async (
  loaded: LoadedVoltConfig,
  artifactNames: string[],
  mode: "development" | "production",
  phase: "build" | "dev",
  logger: VoltLogger,
) => {
  const definitions = loaded.config.artifacts ?? {};
  const orderedArtifactNames = orderArtifacts(definitions, artifactNames);
  const resolved: Record<string, VoltResolvedArtifact> = {};

  for (const name of orderedArtifactNames) {
    const definition = definitions[name];
    if (!definition) {
      throw new Error(`Unknown Volt artifact: ${name}`);
    }

    const context = createArtifactContext(
      loaded,
      name,
      logger,
      mode,
      createArtifactRegistry(resolved),
    );
    const runner =
      phase === "dev"
        ? definition.dev ?? definition.build
        : definition.build ?? definition.dev;

    if (!runner) {
      resolved[name] = await normalizeArtifactOutput(loaded, name, definition, undefined);
      continue;
    }

    logger.info("resolving artifact", { kind: definition.kind, name, phase });
    const output = await runner(context);
    resolved[name] = await normalizeArtifactOutput(loaded, name, definition, output);
  }

  return createArtifactRegistry(resolved);
};

export const resolveIntegrationsForPhase = async (
  loaded: LoadedVoltConfig,
  integrationNames: string[],
  mode: "development" | "production",
  phase: "build" | "dev",
  logger: VoltLogger,
) => {
  const integrations = loaded.config.integrations ?? {};
  const resolved: Record<string, VoltResolvedIntegration> = {};

  for (const name of integrationNames) {
    const definition = integrations[name];
    if (!definition) {
      throw new Error(`Unknown Volt integration: ${name}`);
    }

    const context = createIntegrationContext(loaded, name, logger, mode);
    const runner =
      phase === "dev"
        ? definition.dev ?? definition.build
        : definition.build ?? definition.dev;

    if (!runner) {
      resolved[name] = await normalizeIntegrationOutput(loaded, name, definition, undefined);
      continue;
    }

    logger.info("resolving integration", { kind: definition.kind, name, phase });
    const output = await runner(context);
    resolved[name] = await normalizeIntegrationOutput(loaded, name, definition, output);
  }

  return {
    all: resolved,
    get: (name: string) => resolved[name],
    require: (name: string) => {
      const integration = resolved[name];
      if (!integration) {
        throw new Error(`Missing Volt integration output: ${name}`);
      }
      return integration;
    },
  };
};

const isManagedProcess = (
  value: ManagedVoltProcess | VoltDaemonHandle | void,
): value is ManagedVoltProcess =>
  typeof value === "object" && value !== null && "process" in value;

const stopHandle = async (handle: ManagedVoltProcess | VoltDaemonHandle) => {
  if (isManagedProcess(handle)) {
    handle.process.kill();
    return;
  }

  await handle.stop?.();
};

const createDaemonContext = (
  loaded: LoadedVoltConfig,
  logger: VoltLogger,
  mode: "development" | "production",
): VoltDaemonContext => ({
  appRoot: loaded.rootDir,
  configPath: loaded.configPath,
  logger,
  mode,
  rootDir: loaded.rootDir,
  spawn: createSpawn(loaded.rootDir, logger),
  workspaceRoot: loaded.workspaceRoot,
});

const startDaemonServices = async (
  loaded: LoadedVoltConfig,
  logger: VoltLogger,
  mode: "development" | "production",
) => {
  const plugins = await loadPlugins(loaded.config);
  const handles: Array<ManagedVoltProcess | VoltDaemonHandle> = [];
  const context = createDaemonContext(loaded, logger, mode);

  for (const { name, service } of plugins.daemonServices) {
    logger.info("starting daemon service", { name });
    const handle = await service.start(context);
    if (handle) {
      handles.push(handle);
    }
  }

  return handles;
};

const resolveWatchPaths = async (
  loaded: LoadedVoltConfig,
  name: string,
  definition: VoltIntegrationDefinition,
  logger: VoltLogger,
  mode: "development" | "production",
) => {
  if (!definition.watchPaths) {
    return [];
  }

  const context = createIntegrationContext(loaded, name, logger, mode);
  const paths =
    typeof definition.watchPaths === "function"
      ? await definition.watchPaths(context)
      : definition.watchPaths;

  return paths.map((path) => resolve(loaded.rootDir, path));
};

const startIntegrationWatchers = async (
  loaded: LoadedVoltConfig,
  integrationNames: string[],
  logger: VoltLogger,
  mode: "development" | "production",
) => {
  const handles: VoltDaemonHandle[] = [];
  const definitions = loaded.config.integrations ?? {};

  for (const name of integrationNames) {
    const definition = definitions[name];
    if (!definition) {
      continue;
    }

    if (definition.watch) {
      logger.info("starting integration watcher", { kind: definition.kind, name, source: "custom" });
      const customHandle = await definition.watch(
        createIntegrationContext(loaded, name, logger, mode),
      );
      if (customHandle) {
        handles.push(
          isManagedProcess(customHandle)
            ? {
                label: customHandle.label,
                stop: () => customHandle.process.kill(),
              }
            : customHandle,
        );
      }
      continue;
    }

    const watchPaths = await resolveWatchPaths(loaded, name, definition, logger, mode);
    if (!watchPaths.length) {
      continue;
    }

    logger.info("starting integration watcher", {
      kind: definition.kind,
      name,
      paths: watchPaths,
      source: "fs-watch",
    });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const watchers = watchPaths
      .filter((path) => existsSync(path))
      .map((path) => {
        try {
          return watch(path, { recursive: true }, () => {
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(async () => {
              try {
                await resolveIntegrationsForPhase(loaded, [name], mode, "dev", logger);
                logger.info("integration refreshed", { name });
              } catch (error) {
                logger.error("integration refresh failed", {
                  error: error instanceof Error ? error.message : String(error),
                  name,
                });
              }
            }, 150);
          });
        } catch {
          return watch(path, () => {
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(async () => {
              try {
                await resolveIntegrationsForPhase(loaded, [name], mode, "dev", logger);
                logger.info("integration refreshed", { name });
              } catch (error) {
                logger.error("integration refresh failed", {
                  error: error instanceof Error ? error.message : String(error),
                  name,
                });
              }
            }, 150);
          });
        }
      });

    handles.push({
      label: `integration:${name}`,
      stop: () => {
        if (timer) {
          clearTimeout(timer);
        }
        for (const watcher of watchers) {
          watcher.close();
        }
      },
    });
  }

  return handles;
};

const isProcessAlive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const writeDaemonState = async (
  statePath: string,
  data: WorkspaceDaemonState,
) => {
  await writeJsonFile(statePath, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

const readDaemonState = async (
  statePath: string,
): Promise<WorkspaceDaemonState | undefined> => {
  if (!existsSync(statePath)) {
    return undefined;
  }

  return JSON.parse(await readFile(statePath, "utf8")) as WorkspaceDaemonState;
};

const stopWorkspaceDaemon = async (
  daemonPaths: WorkspaceDaemonPaths,
  quiet = false,
) => {
  if (!existsSync(daemonPaths.pidPath)) {
    if (!quiet) {
      console.log("[volt] workspace daemon is not running");
    }
    return false;
  }

  const pid = Number((await readFile(daemonPaths.pidPath, "utf8")).trim());
  if (!Number.isFinite(pid) || !isProcessAlive(pid)) {
    await rm(daemonPaths.pidPath, { force: true });
    if (!quiet) {
      console.log("[volt] removed stale workspace daemon pid");
    }
    return false;
  }

  process.kill(pid, "SIGTERM");
  await delay(500);
  if (!isProcessAlive(pid)) {
    await rm(daemonPaths.pidPath, { force: true });
  }

  if (!quiet) {
    console.log(`[volt] stopping workspace daemon pid=${pid}`);
  }
  return true;
};

const startWorkspaceDaemon = async (
  workspaceRoot: string,
  daemonPaths: WorkspaceDaemonPaths,
  configPaths: string[],
  mode: "development" | "production",
  cliScriptPath: string,
  quiet = false,
) => {
  const child = Bun.spawn(
    [
      process.execPath,
      cliScriptPath,
      "__daemon-run",
      "--mode",
      mode,
      ...configPaths.flatMap((configPath) => ["--config", configPath]),
    ],
    {
      cwd: workspaceRoot,
      detached: true,
      stderr: Bun.file(daemonPaths.logPath),
      stdin: "ignore",
      stdout: Bun.file(daemonPaths.logPath),
    },
  );
  child.unref();

  await delay(400);

  const pid = child.pid;
  const alive = Number.isFinite(pid) && isProcessAlive(pid);
  if (!alive && existsSync(daemonPaths.logPath)) {
    const log = await readFile(daemonPaths.logPath, "utf8");
    throw new Error(
      `Volt daemon failed to start for ${configPaths.join(", ")}.\n${log.trim()}`.trim(),
    );
  }

  if (!quiet) {
    console.log(
      `[volt] started workspace daemon pid=${pid} configs=${configPaths.map((configPath) => relative(workspaceRoot, configPath)).join(", ")}`,
    );
  }
};

export const ensureWorkspaceDaemonRunning = async (
  workspaceRoot: string,
  requestedConfigs: string[],
  mode: "development" | "production",
  cliScriptPath: string,
  quiet = false,
) => {
  const configPaths = await resolveRequestedConfigPaths(workspaceRoot, requestedConfigs);
  if (!configPaths.length) {
    throw new Error(
      `No volt.config.ts files were found under ${workspaceRoot}. Pass --config explicitly or add an app Volt config.`,
    );
  }

  const daemonPaths = createWorkspaceDaemonPaths(workspaceRoot);
  await ensureDirectory(dirname(daemonPaths.logPath));

  const currentState = await readDaemonState(daemonPaths.statePath);
  const requestedRelative = configPaths.map((configPath) => relative(workspaceRoot, configPath));
  const managedConfigs = new Set(currentState?.configs ?? []);
  const alreadyCoversRequested =
    currentState?.mode === mode &&
    requestedRelative.every((configPath) => managedConfigs.has(configPath));

  if (existsSync(daemonPaths.pidPath)) {
    const pid = Number((await readFile(daemonPaths.pidPath, "utf8")).trim());
    if (Number.isFinite(pid) && isProcessAlive(pid) && alreadyCoversRequested) {
      if (!quiet) {
        console.log(
          `[volt] workspace daemon already running pid=${pid} configs=${(currentState?.configs ?? []).join(", ")}`,
        );
      }
      return;
    }

    if (Number.isFinite(pid) && isProcessAlive(pid)) {
      const mergedConfigPaths = [
        ...new Set([
          ...(currentState?.configs ?? []).map((configPath) => resolve(workspaceRoot, configPath)),
          ...configPaths,
        ]),
      ].sort((left, right) => left.localeCompare(right));

      await stopWorkspaceDaemon(daemonPaths, true);
      await startWorkspaceDaemon(
        workspaceRoot,
        daemonPaths,
        mergedConfigPaths,
        mode,
        cliScriptPath,
        quiet,
      );
      return;
    }

    await rm(daemonPaths.pidPath, { force: true });
  }

  await startWorkspaceDaemon(workspaceRoot, daemonPaths, configPaths, mode, cliScriptPath, quiet);
};

export const runDaemonRuntime = async (
  workspaceRoot: string,
  configPaths: string[],
  mode: "development" | "production",
) => {
  const loadedConfigs: LoadedVoltConfig[] = await Promise.all(
    configPaths.map(async (configPath) => ({
      config: await loadVoltConfig("dev", configPath, mode, workspaceRoot),
      configPath,
      rootDir: dirname(configPath),
      workspaceRoot,
    })),
  );
  const logger = createRootLogger();
  const daemonPaths = createWorkspaceDaemonPaths(workspaceRoot);
  const configState: NonNullable<WorkspaceDaemonState["byConfig"]> = {};

  await ensureDirectory(dirname(daemonPaths.pidPath));
  await writeTextFile(daemonPaths.pidPath, String(process.pid));
  await writeDaemonState(daemonPaths.statePath, {
    configs: loadedConfigs.map((loaded) => relative(workspaceRoot, loaded.configPath)),
    mode,
    pid: process.pid,
    status: "starting",
    byConfig: {},
  });

  const serviceHandles: Array<ManagedVoltProcess | VoltDaemonHandle> = [];
  const integrationHandles: VoltDaemonHandle[] = [];
  let shuttingDown = false;

  const shutdown = async (reason: string) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info("stopping daemon", { reason });
    await writeDaemonState(daemonPaths.statePath, {
      configs: loadedConfigs.map((loaded) => relative(workspaceRoot, loaded.configPath)),
      mode,
      pid: process.pid,
      reason,
      status: "stopping",
      byConfig: Object.fromEntries(
        Object.entries(configState).map(([configId, state]) => [
          configId,
          { ...state, status: "stopping" as const },
        ]),
      ),
    });

    for (const handle of integrationHandles) {
      await stopHandle(handle);
    }
    for (const handle of serviceHandles) {
      await stopHandle(handle);
    }

    await rm(daemonPaths.pidPath, { force: true });
    await writeDaemonState(daemonPaths.statePath, {
      configs: loadedConfigs.map((loaded) => relative(workspaceRoot, loaded.configPath)),
      mode,
      pid: process.pid,
      reason,
      status: "stopped",
      byConfig: Object.fromEntries(
        Object.entries(configState).map(([configId, state]) => [
          configId,
          { ...state, status: "stopped" as const },
        ]),
      ),
    });
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  logger.info("starting Volt daemon", {
    configs: loadedConfigs.map((loaded) => relative(workspaceRoot, loaded.configPath)),
    mode,
  });

  for (const loaded of loadedConfigs) {
    const targetNames = loaded.config.dev ?? [];
    const artifactNames = collectTargetArtifacts(loaded.config.targets, targetNames);
    const integrationNames = collectTargetIntegrations(loaded.config.targets, targetNames);
    const configId = toConfigId(workspaceRoot, loaded.configPath);

    configState[configId] = {
      appRoot: relative(workspaceRoot, loaded.rootDir),
      artifacts: artifactNames,
      configPath: relative(workspaceRoot, loaded.configPath),
      integrations: integrationNames,
      serviceCount: 0,
      status: "starting",
      targets: targetNames,
      watcherCount: 0,
    };

    await resolveArtifactsForPhase(loaded, artifactNames, mode, "dev", logger);
    await resolveIntegrationsForPhase(loaded, integrationNames, mode, "dev", logger);
    const loadedServiceHandles = await startDaemonServices(loaded, logger, mode);
    const loadedWatcherHandles = await startIntegrationWatchers(loaded, integrationNames, logger, mode);
    serviceHandles.push(...loadedServiceHandles);
    integrationHandles.push(...loadedWatcherHandles);

    configState[configId] = {
      ...configState[configId],
      serviceCount: loadedServiceHandles.length,
      status: "running",
      watcherCount: loadedWatcherHandles.length,
    };
  }

  await writeDaemonState(daemonPaths.statePath, {
    configs: loadedConfigs.map((loaded) => relative(workspaceRoot, loaded.configPath)),
    mode,
    pid: process.pid,
    serviceCount: serviceHandles.length,
    status: "running",
    watcherCount: integrationHandles.length,
    byConfig: configState,
  });

  // Keep the daemon process alive while watchers/services run.
  while (true) {
    await delay(60_000);
  }
};

export const handleDaemonCommand = async (
  command: VoltDaemonCommand,
  workspaceRoot: string,
  requestedConfigs: string[],
  mode: "development" | "production",
  cliScriptPath: string,
) => {
  const daemonPaths = createWorkspaceDaemonPaths(workspaceRoot);
  await ensureDirectory(dirname(daemonPaths.logPath));
  const state = await readDaemonState(daemonPaths.statePath);
  const requestedRelative = requestedConfigs.map((configPath) =>
    relative(workspaceRoot, resolve(workspaceRoot, configPath)),
  );

  if (command === "logs") {
    if (!existsSync(daemonPaths.logPath)) {
      console.log("[volt] no workspace daemon log found");
      return;
    }
    process.stdout.write(await readFile(daemonPaths.logPath, "utf8"));
    return;
  }
  
  if (command === "status") {
    if (!existsSync(daemonPaths.pidPath)) {
      if (state && state.status !== "stopped") {
        await writeDaemonState(daemonPaths.statePath, {
          ...state,
          reason: state.reason ?? "missing-pid",
          status: "stopped",
          byConfig: state.byConfig
            ? Object.fromEntries(
                Object.entries(state.byConfig).map(([configId, configState]) => [
                  configId,
                  { ...configState, status: "stopped" as const },
                ]),
              )
            : undefined,
        });
      }
      console.log("[volt] workspace daemon is not running");
      const refreshedState = await readDaemonState(daemonPaths.statePath);
      if (refreshedState) {
        console.log(JSON.stringify(refreshedState, null, 2));
      }
      return;
    }

    const pid = Number((await readFile(daemonPaths.pidPath, "utf8")).trim());
    const alive = Number.isFinite(pid) && isProcessAlive(pid);
    const serializedState = state ? JSON.stringify(state, null, 2) : "";

    if (!alive) {
      await rm(daemonPaths.pidPath, { force: true });
      if (state && state.status !== "stopped") {
        await writeDaemonState(daemonPaths.statePath, {
          ...state,
          reason: state.reason ?? "stale-pid",
          status: "stopped",
          byConfig: state.byConfig
            ? Object.fromEntries(
                Object.entries(state.byConfig).map(([configId, configState]) => [
                  configId,
                  { ...configState, status: "stopped" as const },
                ]),
              )
            : undefined,
        });
      }
    }

    const managedMessage =
      requestedRelative.length > 0 && state
        ? ` requested=${requestedRelative.join(", ")} managed=${state.configs.join(", ")}`
        : "";
    console.log(`[volt] workspace daemon ${alive ? "running" : "stale"} pid=${pid}${managedMessage}`);
    if (serializedState) {
      console.log(serializedState.trim());
    }
    return;
  }

  if (command === "stop") {
    const stopped = await stopWorkspaceDaemon(daemonPaths, false);
    if (stopped) {
      const refreshedState = await readDaemonState(daemonPaths.statePath);
      if (refreshedState && refreshedState.status !== "stopped") {
        await writeDaemonState(daemonPaths.statePath, {
          ...refreshedState,
          reason: refreshedState.reason ?? "cli-stop",
          status: "stopped",
          byConfig: refreshedState.byConfig
            ? Object.fromEntries(
                Object.entries(refreshedState.byConfig).map(([configId, configState]) => [
                  configId,
                  { ...configState, status: "stopped" as const },
                ]),
              )
            : undefined,
        });
      }
    }
    return;
  }

  await ensureWorkspaceDaemonRunning(
    workspaceRoot,
    requestedConfigs,
    mode,
    cliScriptPath,
    false,
  );
};
