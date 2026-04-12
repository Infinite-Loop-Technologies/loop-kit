import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  VoltConfigContext,
  VoltConfigDefinition,
  VoltConfigInput,
  VoltTargetDefinition,
} from "./contracts";
import type {
  LoadedVoltProjectLike,
  VoltAnyTaskDefinition,
  VoltTaskSelectionDefaults,
} from "./task";
import { defineTargetTask, normalizeTaskDefaults } from "./task";

const normalizeSelection = (values: readonly string[] | undefined): string[] =>
  (values ?? []).map((value) => value.trim()).filter(Boolean);

const inferSourcePath = () => {
  const stack = new Error().stack ?? "";
  const lines = stack.split("\n");

  for (const line of lines) {
    if (line.includes("/packages/volt/src/") || line.includes("\\packages\\volt\\src\\")) {
      continue;
    }

    const fileUrlMatch = line.match(/file:\/\/\/[^\s)]+/u);
    if (fileUrlMatch) {
      return fileURLToPath(fileUrlMatch[0]);
    }

    const windowsMatch = line.match(/[A-Za-z]:\\[^:\n]+/u);
    if (windowsMatch) {
      return windowsMatch[0];
    }
  }

  return undefined;
};

export interface VoltProjectConfigInput<
  TTasks extends Record<string, VoltAnyTaskDefinition> = Record<
    string,
    VoltAnyTaskDefinition
  >,
  TTargets extends Record<string, VoltTargetDefinition> = Record<
    string,
    VoltTargetDefinition
  >,
> {
  artifacts?: VoltConfigInput<TTargets>["artifacts"];
  defaults?: VoltTaskSelectionDefaults;
  integrations?: VoltConfigInput<TTargets>["integrations"];
  name: string;
  plugins?: VoltConfigInput<TTargets>["plugins"];
  tasks: TTasks;
  targets?: TTargets;
}

export interface VoltProjectConfigDefinition<
  TTasks extends Record<string, VoltAnyTaskDefinition> = Record<
    string,
    VoltAnyTaskDefinition
  >,
  TTargets extends Record<string, VoltTargetDefinition> = Record<
    string,
    VoltTargetDefinition
  >,
> {
  (context: VoltConfigContext):
    | Promise<VoltProjectConfigInput<TTasks, TTargets>>
    | VoltProjectConfigInput<TTasks, TTargets>;
  kind?: "volt-project-config";
  source?: string;
}

type AnyConfigInput = VoltConfigInput<Record<string, VoltTargetDefinition>>;
type AnyProjectInput = VoltProjectConfigInput<
  Record<string, VoltAnyTaskDefinition>,
  Record<string, VoltTargetDefinition>
>;

const createProjectDefinition = <
  TTasks extends Record<string, VoltAnyTaskDefinition>,
  TTargets extends Record<string, VoltTargetDefinition>,
>(
  definition: (
    context: VoltConfigContext,
  ) => Promise<VoltProjectConfigInput<TTasks, TTargets>> | VoltProjectConfigInput<TTasks, TTargets>,
): VoltProjectConfigDefinition<TTasks, TTargets> => {
  const definitionWithMeta = definition as VoltProjectConfigDefinition<TTasks, TTargets>;
  definitionWithMeta.kind = "volt-project-config";
  definitionWithMeta.source = inferSourcePath();
  return definitionWithMeta;
};

export const defineProjectConfig = <
  const TTasks extends Record<string, VoltAnyTaskDefinition>,
  const TTargets extends Record<string, VoltTargetDefinition> = {},
>(
  config:
    | VoltProjectConfigInput<TTasks, TTargets>
    | ((
        context: VoltConfigContext,
      ) =>
        | Promise<VoltProjectConfigInput<TTasks, TTargets>>
        | VoltProjectConfigInput<TTasks, TTargets>),
): VoltProjectConfigDefinition<TTasks, TTargets> =>
  typeof config === "function"
    ? createProjectDefinition(config)
    : createProjectDefinition(() => config);

const isTaskProjectInput = (value: unknown): value is AnyProjectInput =>
  typeof value === "object" &&
  value !== null &&
  "tasks" in value &&
  typeof (value as { name?: unknown }).name === "string";

export const isProjectConfigDefinition = (
  value: unknown,
): value is VoltProjectConfigDefinition =>
  typeof value === "function" &&
  (value as VoltProjectConfigDefinition).kind === "volt-project-config";

export const projectInputToLegacyConfig = (
  input: AnyProjectInput,
): AnyConfigInput => {
  const taskNamesByCommand: Record<"build" | "dev", string[]> = {
    build: [],
    dev: [],
  };
  const defaults = normalizeTaskDefaults(input.defaults);
  const targets: Record<string, VoltTargetDefinition> = {
    ...(input.targets ?? {}),
  };

  for (const [taskName, taskDefinition] of Object.entries(input.tasks)) {
    if (taskDefinition.kind !== "target-task") {
      continue;
    }

    targets[taskName] = taskDefinition.target;
    if (defaults[taskDefinition.command].includes(taskName)) {
      taskNamesByCommand[taskDefinition.command].push(taskName);
    }
  }

  return {
    artifacts: input.artifacts,
    build: taskNamesByCommand.build,
    dev: taskNamesByCommand.dev,
    integrations: input.integrations,
    name: input.name,
    plugins: input.plugins,
    targets,
  };
};

export const normalizeLegacyConfigToProject = (
  input: AnyConfigInput,
  configPath: string,
  workspaceRoot: string,
): LoadedVoltProjectLike => {
  const targets = input.runtimes ?? input.targets;
  if (!targets || Object.keys(targets).length === 0) {
    throw new Error(`Volt config ${configPath} must define at least one runtime.`);
  }

  const tasks: Record<string, VoltAnyTaskDefinition> = {};
  for (const [targetName, targetDefinition] of Object.entries(targets)) {
    tasks[`build:${targetName}`] = defineTargetTask({
      artifacts: targetDefinition.artifacts,
      command: "build",
      dependsOn: (targetDefinition.dependsOn ?? []).map(
        (dependency) => `build:${dependency}`,
      ),
      target: targetDefinition,
      uses: targetDefinition.uses,
    });
    tasks[`dev:${targetName}`] = defineTargetTask({
      artifacts: targetDefinition.artifacts,
      command: "dev",
      dependsOn: (targetDefinition.dependsOn ?? []).map(
        (dependency) => `dev:${dependency}`,
      ),
      target: targetDefinition,
      uses: targetDefinition.uses,
    });
  }

  return {
    artifacts: input.artifacts,
    configPath,
    defaults: {
      build: normalizeSelection(input.build ?? input.defaults?.build).map(
        (name) => `build:${name}`,
      ),
      dev: normalizeSelection(input.dev ?? input.defaults?.dev).map(
        (name) => `dev:${name}`,
      ),
    },
    integrations: input.integrations,
    name: input.name,
    plugins: input.plugins,
    rootDir: dirname(configPath),
    tasks,
    targets,
    workspaceRoot,
  };
};

export const normalizeProjectInput = (
  input: AnyProjectInput,
  configPath: string,
  workspaceRoot: string,
): LoadedVoltProjectLike => ({
  artifacts: input.artifacts,
  configPath,
  defaults: normalizeTaskDefaults(input.defaults),
  integrations: input.integrations,
  name: input.name,
  plugins: input.plugins,
  rootDir: dirname(configPath),
  tasks: input.tasks,
  targets: input.targets ?? {},
  workspaceRoot,
});

export const normalizeLoadedProjectDefinition = async (
  definition:
    | VoltConfigDefinition<Record<string, VoltTargetDefinition>>
    | VoltProjectConfigDefinition,
  context: VoltConfigContext,
  configPath: string,
  workspaceRoot: string,
): Promise<LoadedVoltProjectLike> => {
  const resolved =
    typeof definition === "function" ? await definition(context) : definition;

  if (isTaskProjectInput(resolved)) {
    return normalizeProjectInput(resolved, configPath, workspaceRoot);
  }

  return normalizeLegacyConfigToProject(resolved, configPath, workspaceRoot);
};
