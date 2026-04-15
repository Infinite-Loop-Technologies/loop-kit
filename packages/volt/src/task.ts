import { resolve } from "node:path";
import type {
  ManagedVoltProcess,
  ResourceHandle,
  VoltArtifactDefinition,
  VoltConfig,
  VoltCommand,
  VoltDaemonHandle,
  VoltIntegrationDefinition,
  VoltLogger,
  VoltPlugin,
  VoltTargetDefinition,
} from "./contracts";
import type { VoltFlowTaskDefinition } from "./flow";
import { runFlow } from "./flow";
import { waitForManagedProcesses } from "./process";
import {
  collectTargetArtifacts,
  collectTargetIntegrations,
  ensureWorkspaceDaemonRunning,
  resolveArtifactsForPhase,
  resolveIntegrationsForPhase,
} from "./daemon";
import { createRootLogger, createSpawn, createVoltPaths, sanitizeForPath } from "./utils";

export interface VoltTaskContext<TInputs = unknown> {
  configPath: string;
  inputs: TInputs;
  logger: VoltLogger;
  projectName: string;
  rootDir: string;
  workspaceRoot: string;
}

export interface VoltTaskDefinition<TInputs = unknown, TResult = unknown> {
  command?: VoltCommand;
  dependsOn?: string[];
  inputs?: string[];
  kind: "task";
  outputs?: string[];
  run: (context: VoltTaskContext<TInputs>) => Promise<TResult> | TResult;
  watch?: string[];
}

export interface VoltTargetTaskDefinition<TResult = unknown> {
  artifacts?: string[];
  command: VoltCommand;
  dependsOn?: string[];
  inputs?: string[];
  kind: "target-task";
  outputs?: string[];
  target: VoltTargetDefinition;
  uses?: string[];
  value?: TResult;
  watch?: string[];
}

export type VoltAnyTaskDefinition =
  | VoltFlowTaskDefinition<any, any>
  | VoltTargetTaskDefinition<any>
  | VoltTaskDefinition<any, any>;

export interface VoltAdapterDefinition<TExports = Record<string, unknown>> {
  readonly exports: Readonly<TExports>;
  readonly kind: "adapter";
  readonly needs?: ReadonlyArray<VoltAdapterDefinition<any>>;
  readonly tasks: (name: string) => Record<string, VoltAnyTaskDefinition>;
}

export interface VoltTaskSelectionDefaults {
  build?: string | string[];
  dev?: string | string[];
}

export interface LoadedVoltProjectLike {
  artifacts?: Record<string, VoltArtifactDefinition>;
  configPath: string;
  defaults: {
    build: string[];
    dev: string[];
  };
  integrations?: Record<string, VoltIntegrationDefinition>;
  name: string;
  plugins?: VoltPlugin[];
  rootDir: string;
  tasks: Record<string, VoltAnyTaskDefinition>;
  targets: Record<string, VoltTargetDefinition>;
  workspaceRoot: string;
}

export interface VoltTaskExecutionResult<TResult = unknown> {
  activeHandles: ResourceHandle[];
  result: TResult;
}

interface VoltTaskExecutionState {
  activeHandles: ResourceHandle[];
  completed: Map<string, unknown>;
  inFlight: Set<string>;
  logger: VoltLogger;
  project: LoadedVoltProjectLike;
}

const toArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const isManagedProcess = (
  value: ManagedVoltProcess | VoltDaemonHandle,
): value is ManagedVoltProcess => "process" in value;

const waitForActiveHandles = async (
  handles: ResourceHandle[],
) => {
  const processes = handles.filter(isManagedProcess);
  await waitForManagedProcesses(processes);
};

export const task = <TInputs = unknown, TResult = unknown>(
  definition: Omit<VoltTaskDefinition<TInputs, TResult>, "kind">,
): VoltTaskDefinition<TInputs, TResult> => ({
  ...definition,
  kind: "task",
});

export const defineTargetTask = <TResult = unknown>(
  definition: Omit<VoltTargetTaskDefinition<TResult>, "kind">,
): VoltTargetTaskDefinition<TResult> => ({
  ...definition,
  kind: "target-task",
});

export const defineFlowTask = <TInputs = unknown, TOutput = unknown>(
  definition: Omit<VoltFlowTaskDefinition<TInputs, TOutput>, "kind">,
): VoltFlowTaskDefinition<TInputs, TOutput> => ({
  ...definition,
  kind: "flow-task",
});

export const defineAdapter = <TExports = Record<string, unknown>>(
  definition: Omit<VoltAdapterDefinition<TExports>, "kind">,
): VoltAdapterDefinition<TExports> => ({
  ...definition,
  kind: "adapter",
});

const createLegacyConfig = (
  project: LoadedVoltProjectLike,
  targetNames: string[],
  command: VoltCommand,
): VoltConfig<Record<string, VoltTargetDefinition>> => ({
  artifacts: project.artifacts,
  build: command === "build" ? targetNames : [],
  dev: command === "dev" ? targetNames : [],
  integrations: project.integrations,
  name: project.name,
  plugins: project.plugins,
  targets: Object.fromEntries(
    targetNames.map((targetName) => [targetName, project.targets[targetName]]),
  ),
});

const executeTargetTask = async (
  state: VoltTaskExecutionState,
  taskName: string,
  definition: VoltTargetTaskDefinition,
) => {
  const command = definition.command;
  if (command === "dev") {
    await ensureWorkspaceDaemonRunning(
      state.project.workspaceRoot,
      [state.project.configPath],
      "development",
      Bun.argv[1],
      true,
    );
  }

  const target = definition.target;
  const targetGraph = { [taskName]: target };
  const integrationNames = definition.uses ?? collectTargetIntegrations(targetGraph, [taskName]);
  const artifactNames = definition.artifacts ?? collectTargetArtifacts(targetGraph, [taskName]);
  const mode: "development" | "production" =
    command === "build" ? "production" : "development";
  const config = createLegacyConfig(state.project, [taskName], command);
  const loaded = {
    config,
    configPath: state.project.configPath,
    rootDir: state.project.rootDir,
    workspaceRoot: state.project.workspaceRoot,
  };
  const artifacts = await resolveArtifactsForPhase(
    loaded,
    artifactNames,
    mode,
    command,
    state.logger,
  );
  const integrations = await resolveIntegrationsForPhase(
    loaded,
    integrationNames,
    mode,
    command,
    state.logger,
  );

  const context = {
    appRoot: state.project.rootDir,
    artifacts,
    command,
    configPath: state.project.configPath,
    currentTarget: {
      artifacts: artifactNames,
      name: taskName,
      runtime: target.runtime,
      target: target.target,
      uses: integrationNames,
    },
    integrations,
    logger: state.logger,
    mode,
    rootDir: state.project.rootDir,
    spawn: createSpawn(state.project.rootDir, state.logger),
    workspaceRoot: state.project.workspaceRoot,
  };

  if (command === "build") {
    await target.build(context);
    return definition.value;
  }

  const handle = await target.dev(context);
  if (handle) {
    state.activeHandles.push(handle);
  }
  return handle ?? definition.value;
};

const getFlowStatePath = (
  state: VoltTaskExecutionState,
  taskName: string,
  definition: VoltFlowTaskDefinition,
) => {
  if (definition.persist === false) {
    return undefined;
  }

  if (typeof definition.persist === "string") {
    return resolve(state.project.rootDir, definition.persist);
  }

  return resolve(
    createVoltPaths(state.project.rootDir).stateDir,
    "flows",
    `${sanitizeForPath(taskName)}.json`,
  );
};

const executeTaskInternal = async (
  state: VoltTaskExecutionState,
  taskName: string,
  inputs: unknown,
): Promise<unknown> => {
  if (state.completed.has(taskName)) {
    return state.completed.get(taskName);
  }

  if (state.inFlight.has(taskName)) {
    throw new Error(`Detected recursive Volt task execution for ${taskName}.`);
  }

  const definition = state.project.tasks[taskName];
  if (!definition) {
    throw new Error(`Unknown Volt task: ${taskName}`);
  }

  state.inFlight.add(taskName);
  try {
    for (const dependency of definition.dependsOn ?? []) {
      await executeTaskInternal(state, dependency, undefined);
    }

    let result: unknown;
    if (definition.kind === "task") {
      result = await definition.run({
        configPath: state.project.configPath,
        inputs,
        logger: state.logger,
        projectName: state.project.name,
        rootDir: state.project.rootDir,
        workspaceRoot: state.project.workspaceRoot,
      });
    } else if (definition.kind === "target-task") {
      result = await executeTargetTask(state, taskName, definition);
    } else {
      result = await runFlow(definition.value, inputs, {
        logger: state.logger,
        runner: {
          runProjectTask: async (projectName, nestedTaskName) => {
            throw new Error(
              `Project task execution is not available in project scope for ${projectName}:${nestedTaskName}.`,
            );
          },
          runTask: async (nestedTaskName, options) =>
            executeTaskInternal(state, nestedTaskName, options?.inputs),
        },
        statePath: getFlowStatePath(state, taskName, definition),
      });
    }

    state.completed.set(taskName, result);
    return result;
  } finally {
    state.inFlight.delete(taskName);
  }
};

export const listProjectTasks = (project: LoadedVoltProjectLike) =>
  Object.keys(project.tasks).sort((left, right) => left.localeCompare(right));

export const resolveCommandSelection = (
  project: LoadedVoltProjectLike,
  command: VoltCommand,
) => project.defaults[command];

export const executeProjectTask = async <TResult = unknown>(
  project: LoadedVoltProjectLike,
  taskName: string,
  options: { inputs?: unknown; logger?: VoltLogger } = {},
): Promise<VoltTaskExecutionResult<TResult>> => {
  const state: VoltTaskExecutionState = {
    activeHandles: [],
    completed: new Map(),
    inFlight: new Set(),
    logger: options.logger ?? createRootLogger(),
    project,
  };

  const result = (await executeTaskInternal(
    state,
    taskName,
    options.inputs,
  )) as TResult;
  return {
    activeHandles: state.activeHandles,
    result,
  };
};

export const executeProjectCommand = async (
  project: LoadedVoltProjectLike,
  command: VoltCommand,
  taskNames: string[],
  options: { logger?: VoltLogger } = {},
) => {
  const logger = options.logger ?? createRootLogger();
  const selected = taskNames.length > 0 ? taskNames : resolveCommandSelection(project, command);

  if (!selected.length) {
    throw new Error(`No default ${command} tasks configured in ${project.configPath}.`);
  }

  const handles: ResourceHandle[] = [];
  for (const taskName of selected) {
    const executed = await executeProjectTask(project, taskName, { logger });
    handles.push(...executed.activeHandles);
  }

  if (command === "dev") {
    await waitForActiveHandles(handles);
  }
};

export const normalizeTaskDefaults = (
  defaults: VoltTaskSelectionDefaults | undefined,
) => ({
  build: toArray(defaults?.build),
  dev: toArray(defaults?.dev),
});
