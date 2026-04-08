export type VoltCommand = "build" | "dev";
export type VoltDaemonCommand = "logs" | "start" | "status" | "stop";
export type VoltMode = "development" | "production";

export interface VoltLogger {
  error: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
}

export interface VoltSpawnOptions {
  cwd?: string;
  env?: Record<string, string | undefined>;
}

export interface ManagedVoltProcess {
  label: string;
  process: Bun.Subprocess;
}

export interface VoltDaemonHandle {
  label: string;
  stop?: () => Promise<void> | void;
}

export interface VoltResolvedIntegration {
  artifactPath?: string;
  generatedModulePath?: string;
  kind: string;
  metadata?: Record<string, unknown>;
  metadataPath?: string;
  name: string;
  typesPath?: string;
}

export interface VoltIntegrationRegistry {
  all: Record<string, VoltResolvedIntegration>;
  get: (name: string) => VoltResolvedIntegration | undefined;
  require: (name: string) => VoltResolvedIntegration;
}

export interface VoltTargetRuntimeDescriptor {
  name: string;
  runtime: string;
  target: string;
  uses: string[];
}

export interface VoltTargetContext {
  appRoot: string;
  command: VoltCommand;
  configPath: string;
  currentTarget: VoltTargetRuntimeDescriptor;
  integrations: VoltIntegrationRegistry;
  logger: VoltLogger;
  mode: VoltMode;
  rootDir: string;
  spawn: (label: string, cmd: string[], options?: VoltSpawnOptions) => ManagedVoltProcess;
  workspaceRoot: string;
}

export interface VoltTargetDefinition {
  build: (context: VoltTargetContext) => Promise<void>;
  dependsOn?: string[];
  dev: (context: VoltTargetContext) => Promise<ManagedVoltProcess | void>;
  runtime: string;
  target: string;
  uses?: string[];
}

export interface VoltIntegrationContext {
  appRoot: string;
  configPath: string;
  logger: VoltLogger;
  mode: VoltMode;
  name: string;
  rootDir: string;
  spawn: VoltTargetContext["spawn"];
  workspaceRoot: string;
  writeGeneratedFile: (relativePath: string, content: string) => Promise<string>;
  writeMetadata: (data: Record<string, unknown>) => Promise<string>;
}

export interface VoltIntegrationOutput {
  artifactPath?: string;
  generatedModulePath?: string;
  metadata?: Record<string, unknown>;
  typesPath?: string;
}

export interface VoltIntegrationDefinition {
  build?: (context: VoltIntegrationContext) => Promise<VoltIntegrationOutput | void>;
  dev?: (context: VoltIntegrationContext) => Promise<VoltIntegrationOutput | void>;
  kind: string;
  watch?: (
    context: VoltIntegrationContext,
  ) => Promise<ManagedVoltProcess | VoltDaemonHandle | void>;
  watchPaths?:
    | string[]
    | ((context: VoltIntegrationContext) => Promise<string[]> | string[]);
}

export interface VoltDaemonContext {
  appRoot: string;
  configPath: string;
  logger: VoltLogger;
  mode: VoltMode;
  rootDir: string;
  spawn: VoltTargetContext["spawn"];
  workspaceRoot: string;
}

export interface VoltDaemonServiceDefinition {
  start: (
    context: VoltDaemonContext,
  ) => Promise<ManagedVoltProcess | VoltDaemonHandle | void>;
}

export interface VoltCommandHookContext {
  command: VoltCommand;
  configPath: string;
  logger: VoltLogger;
  mode: VoltMode;
  rootDir: string;
  targets: string[];
  workspaceRoot: string;
}

export interface VoltCommandHookEndContext extends VoltCommandHookContext {
  error?: unknown;
  status: "error" | "success";
}

export interface VoltTargetHookContext extends VoltCommandHookContext {
  runtime: string;
  target: string;
  targetName: string;
}

export interface VoltTargetHookEndContext extends VoltTargetHookContext {
  error?: unknown;
  status: "error" | "success";
}

export interface VoltPluginBuilder {
  addDaemonService: (name: string, service: VoltDaemonServiceDefinition) => void;
  onCommandEnd: (
    callback: (context: VoltCommandHookEndContext) => Promise<void> | void,
  ) => void;
  onCommandStart: (
    callback: (context: VoltCommandHookContext) => Promise<void> | void,
  ) => void;
  onTargetEnd: (
    callback: (context: VoltTargetHookEndContext) => Promise<void> | void,
  ) => void;
  onTargetStart: (
    callback: (context: VoltTargetHookContext) => Promise<void> | void,
  ) => void;
}

export interface VoltPlugin {
  name: string;
  setup: (builder: VoltPluginBuilder) => Promise<void> | void;
}

export interface VoltConfigContext {
  command: VoltCommand;
  configPath: string;
  env: {
    boolean: (name: string) => boolean;
    number: (name: string, fallback: number) => number;
    read: (name: string, fallback?: string) => string | undefined;
  };
  mode: VoltMode;
  rootDir: string;
  workspaceRoot: string;
}

export interface VoltEntrypoint<TServices = unknown> {
  source: string;
  types?: TServices;
}

export interface VoltConfig<TTargets extends Record<string, VoltTargetDefinition>> {
  build: Array<keyof TTargets & string>;
  dev: Array<keyof TTargets & string>;
  integrations?: Record<string, VoltIntegrationDefinition>;
  name: string;
  plugins?: VoltPlugin[];
  targets: TTargets;
}

export interface VoltConfigInput<TTargets extends Record<string, VoltTargetDefinition>> {
  build?: Array<keyof TTargets & string>;
  defaults?: {
    build?: Array<keyof TTargets & string>;
    dev?: Array<keyof TTargets & string>;
  };
  dev?: Array<keyof TTargets & string>;
  integrations?: Record<string, VoltIntegrationDefinition>;
  name: string;
  plugins?: VoltPlugin[];
  runtimes?: TTargets;
  targets?: TTargets;
}

export type VoltConfigDefinition<
  TTargets extends Record<string, VoltTargetDefinition>,
> =
  | VoltConfigInput<TTargets>
  | ((
      context: VoltConfigContext,
    ) => Promise<VoltConfigInput<TTargets>> | VoltConfigInput<TTargets>);

export const defineVoltConfig = <
  const TTargets extends Record<string, VoltTargetDefinition>,
>(
  config: VoltConfigDefinition<TTargets>,
): VoltConfigDefinition<TTargets> => config;

export const defineVoltPlugin = (plugin: VoltPlugin): VoltPlugin => plugin;

export const defineEntrypoint = <TServices = unknown>(
  source: string,
): VoltEntrypoint<TServices> => ({
  source,
});

export const entrypoint = defineEntrypoint;
