import { existsSync, watch } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type {
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
  VoltResolvedIntegration,
  VoltTargetDefinition,
} from "./contracts";
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

interface DaemonPaths {
  logPath: string;
  pidPath: string;
  statePath: string;
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

const loadConfig = async (configPath: string): Promise<VoltConfig<TargetGraph>> => {
  const loaded = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`);
  return loaded.default;
};

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

const createDaemonPaths = (workspaceRoot: string, configPath: string): DaemonPaths => {
  const daemonRoot = resolve(workspaceRoot, ".volt", "daemon");
  const configId = sanitizeForPath(relative(workspaceRoot, configPath) || basename(configPath));
  return {
    logPath: resolve(daemonRoot, `${configId}.log`),
    pidPath: resolve(daemonRoot, `${configId}.pid`),
    statePath: resolve(daemonRoot, `${configId}.json`),
  };
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
  data: Record<string, unknown>,
) => {
  await writeJsonFile(statePath, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const runDaemonRuntime = async (
  workspaceRoot: string,
  configPath: string,
  mode: "development" | "production",
) => {
  const loaded: LoadedVoltConfig = {
    config: await loadConfig(configPath),
    configPath,
    rootDir: dirname(configPath),
    workspaceRoot,
  };
  const logger = createRootLogger();
  const daemonPaths = createDaemonPaths(workspaceRoot, configPath);
  const targetNames = loaded.config.defaults?.dev ?? [];
  const integrationNames = collectTargetIntegrations(loaded.config.targets, targetNames);

  await ensureDirectory(dirname(daemonPaths.pidPath));
  await writeTextFile(daemonPaths.pidPath, String(process.pid));
  await writeDaemonState(daemonPaths.statePath, {
    configPath,
    integrations: integrationNames,
    mode,
    pid: process.pid,
    status: "starting",
    targets: targetNames,
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
      configPath,
      mode,
      pid: process.pid,
      reason,
      status: "stopping",
    });

    for (const handle of integrationHandles) {
      await stopHandle(handle);
    }
    for (const handle of serviceHandles) {
      await stopHandle(handle);
    }

    await rm(daemonPaths.pidPath, { force: true });
    await writeDaemonState(daemonPaths.statePath, {
      configPath,
      mode,
      pid: process.pid,
      reason,
      status: "stopped",
    });
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  logger.info("starting Volt daemon", { configPath, mode });
  await resolveIntegrationsForPhase(loaded, integrationNames, mode, "dev", logger);
  serviceHandles.push(...(await startDaemonServices(loaded, logger, mode)));
  integrationHandles.push(...(await startIntegrationWatchers(loaded, integrationNames, logger, mode)));
  await writeDaemonState(daemonPaths.statePath, {
    configPath,
    integrations: integrationNames,
    mode,
    pid: process.pid,
    serviceCount: serviceHandles.length,
    status: "running",
    targets: targetNames,
    watcherCount: integrationHandles.length,
  });

  // Keep the daemon process alive while watchers/services run.
  while (true) {
    await delay(60_000);
  }
};

export const handleDaemonCommand = async (
  command: VoltDaemonCommand,
  workspaceRoot: string,
  configPath: string,
  mode: "development" | "production",
  cliScriptPath: string,
) => {
  const daemonPaths = createDaemonPaths(workspaceRoot, configPath);
  await ensureDirectory(dirname(daemonPaths.logPath));

  if (command === "logs") {
    if (!existsSync(daemonPaths.logPath)) {
      console.log(`[volt] no daemon log found for ${configPath}`);
      return;
    }
    process.stdout.write(await readFile(daemonPaths.logPath, "utf8"));
    return;
  }
  
  if (command === "status") {
    if (!existsSync(daemonPaths.pidPath)) {
      console.log(`[volt] daemon is not running for ${configPath}`);
      return;
    }

    const pid = Number((await readFile(daemonPaths.pidPath, "utf8")).trim());
    const alive = Number.isFinite(pid) && isProcessAlive(pid);
    const state = existsSync(daemonPaths.statePath)
      ? await readFile(daemonPaths.statePath, "utf8")
      : "";

    if (!alive) {
      await rm(daemonPaths.pidPath, { force: true });
    }

    console.log(
      `[volt] daemon ${alive ? "running" : "stale"} pid=${pid} config=${configPath}`,
    );
    if (state) {
      console.log(state.trim());
    }
    return;
  }

  if (command === "stop") {
    if (!existsSync(daemonPaths.pidPath)) {
      console.log(`[volt] daemon is not running for ${configPath}`);
      return;
    }

    const pid = Number((await readFile(daemonPaths.pidPath, "utf8")).trim());
    if (!Number.isFinite(pid) || !isProcessAlive(pid)) {
      await rm(daemonPaths.pidPath, { force: true });
      console.log(`[volt] removed stale daemon pid for ${configPath}`);
      return;
    }

    process.kill(pid, "SIGTERM");
    await delay(500);
    if (!isProcessAlive(pid)) {
      await rm(daemonPaths.pidPath, { force: true });
    }
    console.log(`[volt] stopping daemon pid=${pid} config=${configPath}`);
    return;
  }

  if (existsSync(daemonPaths.pidPath)) {
    const pid = Number((await readFile(daemonPaths.pidPath, "utf8")).trim());
    if (Number.isFinite(pid) && isProcessAlive(pid)) {
      console.log(`[volt] daemon already running pid=${pid} config=${configPath}`);
      return;
    }
    await rm(daemonPaths.pidPath, { force: true });
  }

  const child = Bun.spawn(
    [process.execPath, cliScriptPath, "__daemon-run", "--config", configPath, "--mode", mode],
    {
      cwd: workspaceRoot,
      detached: true,
      stderr: Bun.file(daemonPaths.logPath),
      stdin: "ignore",
      stdout: Bun.file(daemonPaths.logPath),
    },
  );
  child.unref();

  await delay(300);
  console.log(`[volt] started daemon pid=${child.pid} config=${configPath}`);
};
