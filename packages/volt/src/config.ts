import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type {
  VoltCommand,
  VoltConfig,
  VoltConfigContext,
  VoltConfigDefinition,
  VoltConfigInput,
  VoltMode,
  VoltTargetDefinition,
} from "./contracts";
import {
  type VoltProjectConfigDefinition,
  normalizeLoadedProjectDefinition,
  projectInputToLegacyConfig,
} from "./project";
import {
  isWorkspaceConfigDefinition,
  normalizeWorkspaceConfig,
  type LoadedVoltWorkspaceLike,
} from "./workspace";
import type { LoadedVoltProjectLike } from "./task";
import { loadVoltEnv, withScopedProcessEnv } from "./env";

type TargetGraph = Record<string, VoltTargetDefinition>;

const normalizeSelection = (values: readonly string[] | undefined): string[] =>
  (values ?? []).map((value) => value.trim()).filter(Boolean);

const createEnvReader = (env: Record<string, string>) => ({
  boolean: (name: string) => {
    const value = env[name]?.trim().toLowerCase();
    return value === "1" || value === "true" || value === "yes";
  },
  number: (name: string, fallback: number) => {
    const value = env[name];
    const parsed = value ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  },
  read: (name: string, fallback?: string) => env[name] ?? fallback,
});

export const resolveMode = (value: string | undefined, command: VoltCommand): VoltMode =>
  value === "production"
    ? "production"
    : value === "development"
      ? "development"
      : command === "build"
        ? "production"
        : "development";

export const createVoltConfigContext = (
  command: VoltCommand,
  configPath: string,
  mode: VoltMode,
  workspaceRoot: string,
  env: Record<string, string>,
): VoltConfigContext => ({
  command,
  configPath,
  env: createEnvReader(env),
  mode,
  rootDir: dirname(configPath),
  workspaceRoot,
});

const normalizeVoltConfig = <TTargets extends TargetGraph>(
  input: VoltConfigInput<TTargets>,
  configPath: string,
): VoltConfig<TTargets> => {
  const targets = input.runtimes ?? input.targets;
  if (!targets || Object.keys(targets).length === 0) {
    throw new Error(`Volt config ${configPath} must define at least one runtime.`);
  }

  return {
    artifacts: input.artifacts,
    build: normalizeSelection(input.build ?? input.defaults?.build ?? []) as Array<
      keyof TTargets & string
    >,
    dev: normalizeSelection(input.dev ?? input.defaults?.dev ?? []) as Array<
      keyof TTargets & string
    >,
    integrations: input.integrations,
    name: input.name,
    plugins: input.plugins,
    targets,
  };
};

export const loadVoltConfig = async (
  command: VoltCommand,
  configPath: string,
  mode: VoltMode,
  workspaceRoot: string,
): Promise<VoltConfig<TargetGraph>> => {
  const scopedEnv = loadVoltEnv({
    mode,
    rootDir: dirname(configPath),
    workspaceRoot,
  });
  const loaded = await withScopedProcessEnv(scopedEnv, () =>
    import(`${pathToFileURL(configPath).href}?t=${Date.now()}`),
  );
  const definition = loaded.default as
    | VoltConfigDefinition<TargetGraph>
    | VoltProjectConfigDefinition;
  const context = createVoltConfigContext(
    command,
    configPath,
    mode,
    workspaceRoot,
    {
      ...Object.fromEntries(
        Object.entries(process.env).filter((entry): entry is [string, string] =>
          typeof entry[1] === "string"
        ),
      ),
      ...scopedEnv,
    },
  );
  const input =
    typeof definition === "function" ? await definition(context) : definition;

  if (
    typeof input === "object" &&
    input !== null &&
    "tasks" in input &&
    typeof (input as { name?: unknown }).name === "string"
  ) {
    return normalizeVoltConfig(
      projectInputToLegacyConfig(
        input as unknown as Parameters<typeof projectInputToLegacyConfig>[0],
      ),
      configPath,
    );
  }

  return normalizeVoltConfig(input as VoltConfigInput<TargetGraph>, configPath);
};

export const loadVoltProject = async (
  command: VoltCommand,
  configPath: string,
  mode: VoltMode,
  workspaceRoot: string,
): Promise<LoadedVoltProjectLike> => {
  const scopedEnv = loadVoltEnv({
    mode,
    rootDir: dirname(configPath),
    workspaceRoot,
  });
  const loaded = await withScopedProcessEnv(scopedEnv, () =>
    import(`${pathToFileURL(configPath).href}?t=${Date.now()}`),
  );
  return normalizeLoadedProjectDefinition(
    loaded.default as VoltConfigDefinition<TargetGraph> | VoltProjectConfigDefinition,
    createVoltConfigContext(command, configPath, mode, workspaceRoot, {
      ...Object.fromEntries(
        Object.entries(process.env).filter((entry): entry is [string, string] =>
          typeof entry[1] === "string"
        ),
      ),
      ...scopedEnv,
    }),
    configPath,
    workspaceRoot,
  );
};

export const loadVoltWorkspace = async (
  workspaceConfigPath: string,
): Promise<LoadedVoltWorkspaceLike> => {
  const loaded = await import(`${pathToFileURL(workspaceConfigPath).href}?t=${Date.now()}`);
  if (!isWorkspaceConfigDefinition(loaded.default)) {
    throw new Error(`${workspaceConfigPath} does not export defineWorkspaceConfig(...).`);
  }

  return normalizeWorkspaceConfig(loaded.default);
};

export const resolveConfigPath = (workspaceRoot: string, configPath: string) =>
  resolve(workspaceRoot, configPath);
