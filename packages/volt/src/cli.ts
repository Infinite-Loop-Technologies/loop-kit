import { resolve } from "node:path";
import { parseArgs } from "node:util";
import type { ProcessHandle, ResourceHandle, VoltCommand } from "./contracts";
import {
  loadVoltProject,
  resolveMode,
} from "./config";
import { handleDaemonCommand, runDaemonRuntime } from "./daemon";
import { waitForManagedProcesses } from "./process";
import { runFlow } from "./flow";
import type { LoadedVoltProjectLike } from "./task";
import { executeProjectCommand, executeProjectTask, listProjectTasks } from "./task";
import { createRootLogger } from "./utils";
import {
  resolveVoltWorkspaceContext,
  resolveWorkspaceProject,
  type LoadedWorkspaceProject,
} from "./workspace-runtime";

const cwd = process.cwd();
const knownTopLevelCommands = new Set([
  "build",
  "daemon",
  "dashboard",
  "dev",
  "task",
  "ui",
  "__daemon-run",
]);

const normalizeValues = (values: readonly string[] | string | undefined): string[] =>
  (Array.isArray(values) ? values : values ? [values] : [])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

const isProcessHandle = (handle: ResourceHandle): handle is ProcessHandle =>
  "process" in handle;

const waitForActiveProcesses = async (handles: ResourceHandle[]) =>
  waitForManagedProcesses(handles.filter(isProcessHandle));

const resolveExplicitWorkspaceConfigPath = (value?: string) =>
  value ? resolve(cwd, value) : undefined;

const resolveExplicitProjectConfigPath = (value?: string) =>
  value ? resolve(cwd, value) : undefined;

const executeWorkspaceTask = async (
  context: Awaited<ReturnType<typeof resolveVoltWorkspaceContext>>,
  taskName: string,
  options: {
    inputs?: unknown;
    logger?: ReturnType<typeof createRootLogger>;
    mode: "development" | "production";
  },
) => {
  if (!context.workspace) {
    throw new Error("No Volt workspace is available in the current directory.");
  }

  const workspace = context.workspace;
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
          workspaceRoot: context.workspaceRoot,
        });
      } else if (definition.kind === "flow-task") {
        result = await runFlow(definition.value, inputs, {
          logger,
          runner: {
            runProjectTask: async (projectName, nestedTaskName, nestedOptions) => {
              const project = resolveWorkspaceProject(context.projects, projectName);
              if (!project) {
                throw new Error(`Unknown Volt workspace project: ${projectName}`);
              }

              const executed = await executeProjectTask(project.project, nestedTaskName, {
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

const resolveSelectedProjects = (
  projects: LoadedWorkspaceProject[],
  selectors: string[],
) => {
  const selected = selectors.map((selector) => {
    const project = resolveWorkspaceProject(projects, selector);
    if (!project) {
      throw new Error(`Unknown Volt workspace project: ${selector}`);
    }
    return project;
  });

  return [...new Map(selected.map((project) => [project.configPath, project])).values()];
};

const executeWorkspaceProjectTask = async (
  projects: LoadedWorkspaceProject[],
  taskName: string,
  logger: ReturnType<typeof createRootLogger>,
) => {
  const handles: ResourceHandle[] = [];

  for (const project of projects) {
    const executed = await executeProjectTask(project.project, taskName, { logger });
    handles.push(...executed.activeHandles);
  }

  return handles;
};

const parseBaseArgs = (rest: string[]) =>
  parseArgs({
    allowPositionals: true,
    args: rest,
    options: {
      all: { type: "boolean" },
      config: { type: "string" },
      mode: { type: "string" },
      projects: { multiple: true, type: "string" },
      tasks: { multiple: true, type: "string" },
      "workspace-config": { type: "string" },
    },
    strict: true,
  });

const runProjectCommand = async (command: VoltCommand, rest: string[]) => {
  const parsed = parseBaseArgs(rest);
  const mode = resolveMode(parsed.values.mode, command);
  const context = await resolveVoltWorkspaceContext({
    command,
    cwd,
    mode,
    projectConfigPath: resolveExplicitProjectConfigPath(parsed.values.config),
    workspaceConfigPath: resolveExplicitWorkspaceConfigPath(parsed.values["workspace-config"]),
  });

  if (context.workspace && !parsed.values.config && !context.currentProject) {
    const workspace = context.workspace;
    const selected = normalizeValues(parsed.values.tasks ?? []).length
      ? normalizeValues(parsed.values.tasks ?? [])
      : workspace.defaults[command];

    if (!selected.length) {
      throw new Error(
        `No default ${command} tasks configured in ${context.workspaceConfigPath ?? context.workspaceRoot}.`,
      );
    }

    const handles: ResourceHandle[] = [];
    for (const taskName of selected) {
      const executed = await executeWorkspaceTask(context, taskName, {
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

  const configPath =
    resolveExplicitProjectConfigPath(parsed.values.config) ??
    context.currentProject?.configPath ??
    resolve(cwd, "volt.config.ts");
  const project = await loadVoltProject(command, configPath, mode, context.workspaceRoot);
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
    const mode = resolveMode(parsed.values.mode, "dev");
    const context = await resolveVoltWorkspaceContext({
      command: "dev",
      cwd,
      mode,
      projectConfigPath: resolveExplicitProjectConfigPath(parsed.values.config),
      workspaceConfigPath: resolveExplicitWorkspaceConfigPath(parsed.values["workspace-config"]),
    });
    const [selector] = parsed.positionals;

    if (context.workspace && !parsed.values.config && !context.currentProject) {
      if (selector) {
        const project = resolveWorkspaceProject(context.projects, selector);
        if (!project) {
          throw new Error(`Unknown Volt workspace project: ${selector}`);
        }
        process.stdout.write(`${listProjectTasks(project.project).join("\n")}\n`);
        return;
      }

      const lines = [
        ...Object.keys(context.workspace.tasks)
          .sort((left, right) => left.localeCompare(right))
          .map((taskName) => `workspace ${taskName}`),
        ...context.projects.flatMap((project) =>
          listProjectTasks(project.project).map(
            (taskName) => `${project.alias} ${taskName}`,
          ),
        ),
      ];
      process.stdout.write(`${lines.join("\n")}\n`);
      return;
    }

    const project = await loadVoltProject(
      "dev",
      resolveExplicitProjectConfigPath(parsed.values.config) ??
        context.currentProject?.configPath ??
        resolve(cwd, "volt.config.ts"),
      mode,
      context.workspaceRoot,
    );
    process.stdout.write(`${listProjectTasks(project).join("\n")}\n`);
    return;
  }

  if (taskCommand === "run") {
    const parsed = parseBaseArgs(taskArgs);
    const mode = resolveMode(parsed.values.mode, "dev");
    const context = await resolveVoltWorkspaceContext({
      command: "dev",
      cwd,
      mode,
      projectConfigPath: resolveExplicitProjectConfigPath(parsed.values.config),
      workspaceConfigPath: resolveExplicitWorkspaceConfigPath(parsed.values["workspace-config"]),
    });
    const logger = createRootLogger();
    const requestedProjects = normalizeValues(parsed.values.projects ?? []);
    const [first, second] = parsed.positionals;

    if (!first) {
      throw new Error(
        "Usage: volt task run <name> [--projects <project>] | volt task run <project> <name>",
      );
    }

    if (context.workspace && !parsed.values.config) {
      if (requestedProjects.length > 0) {
        const handles = await executeWorkspaceProjectTask(
          resolveSelectedProjects(context.projects, requestedProjects),
          first,
          logger,
        );
        await waitForActiveProcesses(handles);
        return;
      }

      if (second) {
        const project = resolveWorkspaceProject(context.projects, first);
        if (!project) {
          throw new Error(`Unknown Volt workspace project: ${first}`);
        }
        const handles = await executeWorkspaceProjectTask([project], second, logger);
        await waitForActiveProcesses(handles);
        return;
      }

      if (!context.currentProject && context.workspace.tasks[first]) {
        const executed = await executeWorkspaceTask(context, first, {
          logger,
          mode,
        });
        await waitForActiveProcesses(executed.handles);
        return;
      }
    }

    if (requestedProjects.length > 0) {
      throw new Error("--projects requires a Volt workspace.");
    }

    const project = await loadVoltProject(
      "dev",
      resolveExplicitProjectConfigPath(parsed.values.config) ??
        context.currentProject?.configPath ??
        resolve(cwd, "volt.config.ts"),
      mode,
      context.workspaceRoot,
    );
    const taskName =
      context.workspace && !parsed.values.config && second
        ? second
        : first;
    const executed = await executeProjectTask(project, taskName, {
      logger,
    });
    await waitForActiveProcesses(executed.activeHandles);
    return;
  }

  throw new Error(
    "Usage: volt task <list|run> [--config apps/volt-demo/volt.config.ts] [--workspace-config volt.workspace.ts]",
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
  const context = await resolveVoltWorkspaceContext({
    command: "dev",
    cwd,
    mode,
    workspaceConfigPath: undefined,
  });

  await handleDaemonCommand(
    daemonCommand,
    context.workspaceRoot,
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
    resolve(cwd, configPath),
  );
  const mode =
    parsed.values.mode === "production" ? "production" : "development";
  const context = await resolveVoltWorkspaceContext({
    command: "dev",
    cwd,
    mode,
  });
  await runDaemonRuntime(context.workspaceRoot, configPaths, mode);
};

const runDashboardCommand = async (_rest: string[]) => {
  const { runVoltDashboard } = await import("./dashboard");
  await runVoltDashboard(cwd, resolve(import.meta.dir, "cli.ts"));
};

export const resolveVoltCliInvocation = (args: string[]) => {
  const [command, ...rest] = args;

  if (!command || command.startsWith("-")) {
    return {
      command: "ui" as const,
      rest: command ? [command, ...rest] : rest,
    };
  }

  if (knownTopLevelCommands.has(command)) {
    return {
      command: command as
        | "__daemon-run"
        | "build"
        | "daemon"
        | "dashboard"
        | "dev"
        | "task"
        | "ui",
      rest,
    };
  }

  return {
    command: "task-run" as const,
    rest: [command, ...rest],
  };
};

export const main = async () => {
  const invocation = resolveVoltCliInvocation(Bun.argv.slice(2));
  const { command, rest } = invocation;

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
  if (command === "task-run") {
    await runTaskCommand(["run", ...rest]);
    return;
  }

  throw new Error(
    "Usage: volt <build|dev|task|daemon|dashboard|ui> [--config apps/volt-demo/volt.config.ts] [--workspace-config volt.workspace.ts]",
  );
};

if (import.meta.main) {
  await main();
}
