import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import type { ProcessHandle, ResourceHandle, VoltCommand } from "./contracts";
import {
  createVoltConfigContext,
  loadVoltProject,
  loadVoltWorkspace,
  resolveConfigPath,
  resolveMode,
} from "./config";
import { handleDaemonCommand, runDaemonRuntime } from "./daemon";
import { normalizeLoadedProjectDefinition } from "./project";
import { waitForManagedProcesses } from "./process";
import { runFlow } from "./flow";
import type { LoadedVoltProjectLike, VoltAnyTaskDefinition } from "./task";
import { executeProjectCommand, executeProjectTask, listProjectTasks } from "./task";
import { createRootLogger } from "./utils";

const workspaceRoot = process.cwd();

const normalizeValues = (values: readonly string[] | string | undefined): string[] =>
  (Array.isArray(values) ? values : values ? [values] : [])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

const isProcessHandle = (handle: ResourceHandle): handle is ProcessHandle =>
  "process" in handle;

const waitForActiveProcesses = async (handles: ResourceHandle[]) =>
  waitForManagedProcesses(handles.filter(isProcessHandle));

const getDefaultWorkspaceConfigPath = () => resolve(workspaceRoot, "volt.workspace.ts");

const resolveWorkspaceConfigPath = (value?: string) => {
  if (value) {
    return resolve(workspaceRoot, value);
  }

  const defaultPath = getDefaultWorkspaceConfigPath();
  return existsSync(defaultPath) ? defaultPath : undefined;
};

const resolveProjectConfigPath = (value?: string) =>
  resolveConfigPath(workspaceRoot, value ?? "volt.config.ts");

const resolveProjectFromWorkspaceValue = async (
  name: string,
  value: unknown,
  mode: "development" | "production",
): Promise<LoadedVoltProjectLike> => {
  if (
    typeof value === "object" &&
    value !== null &&
    "configPath" in value &&
    "tasks" in value &&
    "defaults" in value
  ) {
    return value as LoadedVoltProjectLike;
  }

  const source =
    typeof value === "function" && "source" in value
      ? (value as { source?: string }).source
      : typeof value === "object" && value !== null && "source" in value
        ? (value as { source?: string }).source
        : undefined;

  if (!source) {
    throw new Error(
      `Workspace project ${name} must come from defineProjectConfig(...) or provide a source path.`,
    );
  }

  return normalizeLoadedProjectDefinition(
    value as Parameters<typeof normalizeLoadedProjectDefinition>[0],
    createVoltConfigContext("dev", source, mode, workspaceRoot),
    source,
    workspaceRoot,
  );
};

const executeWorkspaceTask = async (
  workspacePath: string,
  taskName: string,
  options: {
    inputs?: unknown;
    logger?: ReturnType<typeof createRootLogger>;
    mode: "development" | "production";
  },
) => {
  const workspace = await loadVoltWorkspace(workspacePath);
  const logger = options.logger ?? createRootLogger();
  const completed = new Map<string, unknown>();
  const inFlight = new Set<string>();
  const handles: ResourceHandle[] = [];

  const executeTaskInternal = async (
    name: string,
    inputs: unknown,
  ): Promise<unknown> => {
    if (completed.has(name)) {
      return completed.get(name);
    }
    if (inFlight.has(name)) {
      throw new Error(`Detected recursive Volt workspace task execution for ${name}.`);
    }

    const definition = workspace.tasks[name];
    if (!definition) {
      throw new Error(`Unknown Volt workspace task: ${name}`);
    }

    inFlight.add(name);
    try {
      for (const dependency of definition.dependsOn ?? []) {
        await executeTaskInternal(dependency, undefined);
      }

      let result: unknown;
      if (definition.kind === "task") {
        result = await definition.run({
          configPath: workspace.configPath,
          inputs,
          logger,
          projectName: workspace.name,
          rootDir: workspace.rootDir,
          workspaceRoot,
        });
      } else if (definition.kind === "flow-task") {
        result = await runFlow(definition.value, inputs, {
          logger,
          runner: {
            runProjectTask: async (projectName, nestedTaskName, nestedOptions) => {
              const projectValue = workspace.projects[projectName];
              if (!projectValue) {
                throw new Error(`Unknown Volt workspace project: ${projectName}`);
              }

              const project = await resolveProjectFromWorkspaceValue(
                projectName,
                projectValue,
                options.mode,
              );
              const executed = await executeProjectTask(project, nestedTaskName, {
                inputs: nestedOptions?.inputs,
                logger,
              });
              handles.push(...executed.activeHandles);
              return executed.result;
            },
            runTask: async (nestedTaskName, nestedOptions) =>
              executeTaskInternal(nestedTaskName, nestedOptions?.inputs),
          },
        });
      } else {
        throw new Error(
          `Workspace task ${name} must be a plain task or flow. Target-backed tasks belong in project configs.`,
        );
      }

      completed.set(name, result);
      return result;
    } finally {
      inFlight.delete(name);
    }
  };

  const result = await executeTaskInternal(taskName, options.inputs);
  return { handles, result, workspace };
};

const parseBaseArgs = (rest: string[]) =>
  parseArgs({
    allowPositionals: true,
    args: rest,
    options: {
      all: { type: "boolean" },
      config: { type: "string" },
      mode: { type: "string" },
      tasks: { multiple: true, type: "string" },
      "workspace-config": { type: "string" },
    },
    strict: true,
  });

const runProjectCommand = async (command: VoltCommand, rest: string[]) => {
  const parsed = parseBaseArgs(rest);
  const mode = resolveMode(parsed.values.mode, command);
  const workspaceConfigPath = resolveWorkspaceConfigPath(parsed.values["workspace-config"]);

  if (workspaceConfigPath && !parsed.values.config) {
    const workspace = await loadVoltWorkspace(workspaceConfigPath);
    const selected = normalizeValues(parsed.values.tasks ?? []).length
      ? normalizeValues(parsed.values.tasks ?? [])
      : workspace.defaults[command];

    if (!selected.length) {
      throw new Error(`No default ${command} tasks configured in ${workspaceConfigPath}.`);
    }

    const handles: ResourceHandle[] = [];
    for (const taskName of selected) {
      const executed = await executeWorkspaceTask(workspaceConfigPath, taskName, {
        logger: createRootLogger(),
        mode,
      });
      handles.push(...executed.handles);
    }

    if (command === "dev") {
      await waitForActiveProcesses(handles);
    }
    return;
  }

  const configPath = resolveProjectConfigPath(parsed.values.config);
  const project = await loadVoltProject(command, configPath, mode, workspaceRoot);
  await executeProjectCommand(
    project,
    command,
    normalizeValues(parsed.values.tasks ?? []),
    { logger: createRootLogger() },
  );
};

const runTaskCommand = async (rest: string[]) => {
  const [taskCommand, ...taskArgs] = rest;

  if (taskCommand === "list") {
    const parsed = parseBaseArgs(taskArgs);
    const workspaceConfigPath = resolveWorkspaceConfigPath(parsed.values["workspace-config"]);
    const mode = resolveMode(parsed.values.mode, "dev");
    if (workspaceConfigPath && !parsed.values.config) {
      const workspace = await loadVoltWorkspace(workspaceConfigPath);
      const taskNames = Object.keys(workspace.tasks).sort((left, right) =>
        left.localeCompare(right),
      );
      process.stdout.write(`${taskNames.join("\n")}\n`);
      return;
    }

    const project = await loadVoltProject(
      "dev",
      resolveProjectConfigPath(parsed.values.config),
      mode,
      workspaceRoot,
    );
    process.stdout.write(`${listProjectTasks(project).join("\n")}\n`);
    return;
  }

  if (taskCommand === "run") {
    const [taskName, ...runArgs] = taskArgs;
    if (!taskName) {
      throw new Error("Usage: volt task run <name> [--config ...]");
    }

    const parsed = parseBaseArgs(runArgs);
    const workspaceConfigPath = resolveWorkspaceConfigPath(parsed.values["workspace-config"]);
    const mode = resolveMode(parsed.values.mode, "dev");
    if (workspaceConfigPath && !parsed.values.config) {
      const executed = await executeWorkspaceTask(workspaceConfigPath, taskName, {
        logger: createRootLogger(),
        mode,
      });
      await waitForActiveProcesses(executed.handles);
      return;
    }

    const project = await loadVoltProject(
      "dev",
      resolveProjectConfigPath(parsed.values.config),
      mode,
      workspaceRoot,
    );
    const executed = await executeProjectTask(project, taskName, {
      logger: createRootLogger(),
    });
    await waitForActiveProcesses(executed.activeHandles);
    return;
  }

  throw new Error(
    "Usage: volt task <list|run <name>> [--config apps/volt-demo/volt.config.ts] [--workspace-config volt.workspace.ts]",
  );
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

  const configPaths = normalizeValues(parsed.values.config ?? []);
  const mode =
    parsed.values.mode === "production" ? "production" : "development";

  await handleDaemonCommand(
    daemonCommand,
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
  const configPaths = normalizeValues(parsed.values.config ?? []).map((configPath) =>
    resolve(workspaceRoot, configPath),
  );
  const mode =
    parsed.values.mode === "production" ? "production" : "development";
  await runDaemonRuntime(workspaceRoot, configPaths, mode);
};

const runDashboardCommand = async (_rest: string[]) => {
  const { runVoltDashboard } = await import("./dashboard");
  await runVoltDashboard(workspaceRoot);
};

const main = async () => {
  const [command, ...rest] = Bun.argv.slice(2);
  if (command === "build" || command === "dev") {
    await runProjectCommand(command, rest);
    return;
  }
  if (command === "task") {
    await runTaskCommand(rest);
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
  if (command === "dashboard" || command === "ui") {
    await runDashboardCommand(rest);
    return;
  }

  throw new Error(
    "Usage: volt <build|dev|task|daemon|dashboard|ui> [--config apps/volt-demo/volt.config.ts] [--workspace-config volt.workspace.ts]",
  );
};

await main();
