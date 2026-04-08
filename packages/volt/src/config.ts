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

type TargetGraph = Record<string, VoltTargetDefinition>;

const normalizeSelection = (values: readonly string[] | undefined): string[] =>
  (values ?? []).map((value) => value.trim()).filter(Boolean);

const createEnvReader = () => ({
  boolean: (name: string) => {
    const value = process.env[name]?.trim().toLowerCase();
    return value === "1" || value === "true" || value === "yes";
  },
  number: (name: string, fallback: number) => {
    const value = process.env[name];
    const parsed = value ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  },
  read: (name: string, fallback?: string) => process.env[name] ?? fallback,
});

export const resolveMode = (value: string | undefined, command: VoltCommand): VoltMode =>
  value === "production"
    ? "production"
    : value === "development"
      ? "development"
      : command === "build"
        ? "production"
        : "development";

const createVoltConfigContext = (
  command: VoltCommand,
  configPath: string,
  mode: VoltMode,
  workspaceRoot: string,
): VoltConfigContext => ({
  command,
  configPath,
  env: createEnvReader(),
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

export const loadVoltConfig = async <TTargets extends TargetGraph>(
  command: VoltCommand,
  configPath: string,
  mode: VoltMode,
  workspaceRoot: string,
): Promise<VoltConfig<TTargets>> => {
  const loaded = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`);
  const definition = loaded.default as VoltConfigDefinition<TTargets>;
  const input =
    typeof definition === "function"
      ? await definition(createVoltConfigContext(command, configPath, mode, workspaceRoot))
      : definition;

  return normalizeVoltConfig(input, configPath);
};

export const resolveConfigPath = (workspaceRoot: string, configPath: string) =>
  resolve(workspaceRoot, configPath);
