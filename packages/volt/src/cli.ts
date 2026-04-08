import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import type {
  ManagedVoltProcess,
  VoltCommand,
  VoltCommandHookContext,
  VoltCommandHookEndContext,
  VoltConfig,
  VoltDaemonCommand,
  VoltPluginBuilder,
  VoltTargetContext,
  VoltTargetHookContext,
  VoltTargetHookEndContext,
} from "./contracts";
import { loadVoltConfig, resolveConfigPath, resolveMode } from "./config";
import {
  collectTargetIntegrations,
  ensureWorkspaceDaemonRunning,
  handleDaemonCommand,
  resolveIntegrationsForPhase,
  runDaemonRuntime,
} from "./daemon";
import { createRootLogger, createSpawn } from "./utils";

type TargetGraph = VoltConfig<Record<string, import("./contracts").VoltTargetDefinition>>["targets"];

const workspaceRoot = process.cwd();

const normalizeTargets = (values: readonly string[]): string[] =>
  values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

const normalizeConfigValues = (values: readonly string[]): string[] =>
  values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

const expandTargets = (graph: TargetGraph, requested: string[]): string[] => {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const visit = (name: string) => {
    const target = graph[name];
    if (!target) {
      throw new Error(`Unknown Volt target: ${name}`);
    }
    if (seen.has(name)) {
      return;
    }
    seen.add(name);
    for (const dependency of target.dependsOn ?? []) {
      visit(dependency);
    }
    ordered.push(name);
  };

  for (const name of requested) {
    visit(name);
  }

  return ordered;
};

const shutdown = (children: ManagedVoltProcess[]) => {
  for (const child of children) {
    child.process.kill();
  }
};

const createPluginBuilder = () => {
  const hooks = {
    commandEnd: [] as Array<(context: VoltCommandHookEndContext) => Promise<void> | void>,
    commandStart: [] as Array<(context: VoltCommandHookContext) => Promise<void> | void>,
    targetEnd: [] as Array<(context: VoltTargetHookEndContext) => Promise<void> | void>,
    targetStart: [] as Array<(context: VoltTargetHookContext) => Promise<void> | void>,
  };

  const builder: VoltPluginBuilder = {
    addDaemonService: () => {},
    onCommandEnd: (callback) => {
      hooks.commandEnd.push(callback);
    },
    onCommandStart: (callback) => {
      hooks.commandStart.push(callback);
    },
    onTargetEnd: (callback) => {
      hooks.targetEnd.push(callback);
    },
    onTargetStart: (callback) => {
      hooks.targetStart.push(callback);
    },
  };

  return { builder, hooks };
};

const runHooks = async <TContext>(
  callbacks: Array<(context: TContext) => Promise<void> | void>,
  context: TContext,
) => {
  for (const callback of callbacks) {
    await callback(context);
  }
};

const createBaseArgs = (rest: string[]) =>
  parseArgs({
    allowPositionals: true,
    args: rest,
    options: {
      all: { type: "boolean" },
      config: { type: "string" },
      mode: { type: "string" },
      targets: { multiple: true, type: "string" },
    },
    strict: true,
  });

const runTargetCommand = async (
  command: VoltCommand,
  rest: string[],
) => {
  const parsed = createBaseArgs(rest);
  process.env.VOLT_COMMAND = command;
  const mode = resolveMode(parsed.values.mode, command);
  process.env.VOLT_MODE = mode;

  const configPath = resolveConfigPath(workspaceRoot, parsed.values.config ?? "volt.config.ts");
  if (command === "dev") {
    await ensureWorkspaceDaemonRunning(workspaceRoot, [configPath], mode, Bun.argv[1], true);
  }
  const rootDir = dirname(configPath);
  const config = await loadVoltConfig<TargetGraph>(command, configPath, mode, workspaceRoot);
  const graph = config.targets;
  const explicitTargets = normalizeTargets(parsed.values.targets ?? []);
  const requestedTargets = parsed.values.all
    ? Object.keys(graph)
    : explicitTargets.length
      ? explicitTargets
      : config[command] ?? [];

  if (!requestedTargets.length) {
    throw new Error(`No default ${command} targets configured in ${configPath}.`);
  }

  const orderedTargets = expandTargets(graph, requestedTargets);
  const logger = createRootLogger();
  const { builder, hooks } = createPluginBuilder();
  for (const plugin of config.plugins ?? []) {
    await plugin.setup(builder);
  }

  const integrationNames = collectTargetIntegrations(graph, orderedTargets);
  const integrations = await resolveIntegrationsForPhase(
    {
      config,
      configPath,
      rootDir,
      workspaceRoot,
    },
    integrationNames,
    mode,
    command,
    logger,
  );

  const commandHookContext: VoltCommandHookContext = {
    command,
    configPath,
    logger,
    mode,
    rootDir,
    targets: orderedTargets,
    workspaceRoot,
  };

  await runHooks(hooks.commandStart, commandHookContext);

  logger.info(`running ${config.name}`, {
    command,
    configPath,
    integrations: integrationNames,
    mode,
    targets: orderedTargets,
  });

  try {
    if (command === "build") {
      for (const name of orderedTargets) {
        const target = graph[name];
        const targetHookContext: VoltTargetHookContext = {
          ...commandHookContext,
          runtime: target.runtime,
          target: target.target,
          targetName: name,
        };

        await runHooks(hooks.targetStart, targetHookContext);
        logger.info("building target", { name, runtime: target.runtime });

        try {
          await target.build({
            appRoot: rootDir,
            command,
            configPath,
            currentTarget: {
              name,
              runtime: target.runtime,
              target: target.target,
              uses: target.uses ?? [],
            },
            integrations,
            logger,
            mode,
            rootDir,
            spawn: createSpawn(rootDir, logger),
            workspaceRoot,
          });
          await runHooks(hooks.targetEnd, {
            ...targetHookContext,
            status: "success",
          });
        } catch (error) {
          await runHooks(hooks.targetEnd, {
            ...targetHookContext,
            error,
            status: "error",
          });
          throw error;
        }
      }

      await runHooks(hooks.commandEnd, {
        ...commandHookContext,
        status: "success",
      });
      return;
    }

    const children: ManagedVoltProcess[] = [];
    const onSignal = () => {
      shutdown(children);
      process.exit(0);
    };
    process.on("SIGINT", onSignal);
    process.on("SIGTERM", onSignal);

    for (const name of orderedTargets) {
      const target = graph[name];
      const targetHookContext: VoltTargetHookContext = {
        ...commandHookContext,
        runtime: target.runtime,
        target: target.target,
        targetName: name,
      };

      await runHooks(hooks.targetStart, targetHookContext);
      logger.info("starting target", { name, runtime: target.runtime });

      try {
        const child = await target.dev({
          appRoot: rootDir,
          command,
          configPath,
          currentTarget: {
            name,
            runtime: target.runtime,
            target: target.target,
            uses: target.uses ?? [],
          },
          integrations,
          logger,
          mode,
          rootDir,
          spawn: createSpawn(rootDir, logger),
          workspaceRoot,
        });
        if (child) {
          children.push(child);
        }
        await runHooks(hooks.targetEnd, {
          ...targetHookContext,
          status: "success",
        });
      } catch (error) {
        await runHooks(hooks.targetEnd, {
          ...targetHookContext,
          error,
          status: "error",
        });
        throw error;
      }
    }

    if (!children.length) {
      logger.warn("No dev processes were started.");
      await runHooks(hooks.commandEnd, {
        ...commandHookContext,
        status: "success",
      });
      return;
    }

    const firstExit = await Promise.race(
      children.map(async (child) => ({
        code: await child.process.exited,
        label: child.label,
      })),
    );

    shutdown(children);
    if (firstExit.code !== 0) {
      throw new Error(`${firstExit.label} exited with code ${firstExit.code}.`);
    }

    await runHooks(hooks.commandEnd, {
      ...commandHookContext,
      status: "success",
    });
  } catch (error) {
    await runHooks(hooks.commandEnd, {
      ...commandHookContext,
      error,
      status: "error",
    });
    throw error;
  }
};

const runDaemonCommand = async (rest: string[]) => {
  const [daemonCommand, ...daemonArgs] = rest;
  if (
    daemonCommand !== "start" &&
    daemonCommand !== "status" &&
    daemonCommand !== "logs" &&
    daemonCommand !== "stop"
  ) {
    throw new Error(
      "Usage: volt daemon <start|stop|status|logs> [--config apps/volt-demo/volt.config.ts] [--mode development]",
    );
  }

  const parsed = parseArgs({
    allowPositionals: true,
    args: daemonArgs,
    options: {
      config: { multiple: true, type: "string" },
      mode: { type: "string" },
    },
    strict: true,
  });

  const configPaths = normalizeConfigValues(parsed.values.config ?? []);
  const mode =
    parsed.values.mode === "production" ? "production" : "development";

  await handleDaemonCommand(
    daemonCommand as VoltDaemonCommand,
    workspaceRoot,
    configPaths,
    mode,
    Bun.argv[1],
  );
};

const runInternalDaemon = async (rest: string[]) => {
  const parsed = parseArgs({
    allowPositionals: true,
    args: rest,
    options: {
      config: { multiple: true, type: "string" },
      mode: { type: "string" },
    },
    strict: true,
  });
  const configPaths = normalizeConfigValues(parsed.values.config ?? []).map((configPath) =>
    resolve(workspaceRoot, configPath),
  );
  const mode =
    parsed.values.mode === "production" ? "production" : "development";
  await runDaemonRuntime(workspaceRoot, configPaths, mode);
};

const main = async () => {
  const [command, ...rest] = Bun.argv.slice(2);
  if (command === "build" || command === "dev") {
    await runTargetCommand(command, rest);
    return;
  }
  if (command === "daemon") {
    await runDaemonCommand(rest);
    return;
  }
  if (command === "__daemon-run") {
    await runInternalDaemon(rest);
    return;
  }

  throw new Error(
    "Usage: volt <build|dev|daemon> [--config apps/volt-demo/volt.config.ts] [--targets web game] [--all] [--mode production]",
  );
};

await main();
