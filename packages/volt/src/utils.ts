import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type {
  ManagedVoltProcess,
  VoltLogger,
  VoltSpawnOptions,
  VoltTargetContext,
} from "./contracts";

export const createVoltLogger = (scope: string): VoltLogger => {
  const write = (
    level: "error" | "info" | "warn",
    message: string,
    data?: Record<string, unknown>,
  ) => {
    const prefix = `[volt:${scope}]`;
    const line = data ? `${prefix} ${message} ${JSON.stringify(data)}` : `${prefix} ${message}`;
    if (level === "error") {
      console.error(line);
      return;
    }
    if (level === "warn") {
      console.warn(line);
      return;
    }
    console.log(line);
  };

  return {
    error: (message, data) => write("error", message, data),
    info: (message, data) => write("info", message, data),
    warn: (message, data) => write("warn", message, data),
  };
};

export const createRootLogger = (): VoltTargetContext["logger"] => ({
  error: (message, data) =>
    console.error(data ? `[volt] ${message} ${JSON.stringify(data)}` : `[volt] ${message}`),
  info: (message, data) =>
    console.log(data ? `[volt] ${message} ${JSON.stringify(data)}` : `[volt] ${message}`),
  warn: (message, data) =>
    console.warn(data ? `[volt] ${message} ${JSON.stringify(data)}` : `[volt] ${message}`),
});

export const createSpawn = (
  rootDir: string,
  logger: VoltTargetContext["logger"],
): VoltTargetContext["spawn"] => (label, cmd, options: VoltSpawnOptions = {}) => {
  logger.info("spawning process", { cmd, cwd: options.cwd ?? rootDir, label });
  const child = Bun.spawn({
    cmd,
    cwd: options.cwd ?? rootDir,
    env: mergeEnv(process.env, options.env),
    stderr: "inherit",
    stdin: "inherit",
    stdout: "inherit",
  });

  return { label, process: child };
};

export const runSpawnedCommand = async (
  child: ManagedVoltProcess,
  failureLabel = child.label,
) => {
  const code = await child.process.exited;
  if (code !== 0) {
    throw new Error(`${failureLabel} exited with code ${code}.`);
  }
};

export const resolveFromRoot = (rootDir: string, ...segments: string[]) =>
  resolve(rootDir, ...segments);

export const ensureDirectory = async (path: string) => {
  await mkdir(path, { recursive: true });
};

export const writeTextFile = async (path: string, content: string) => {
  await ensureDirectory(dirname(path));
  await writeFile(path, content, "utf8");
  return path;
};

export const writeJsonFile = async (path: string, data: unknown) =>
  writeTextFile(path, `${JSON.stringify(data, null, 2)}\n`);

export const sanitizeForPath = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]+/g, "-");

export const createVoltPaths = (rootDir: string) => {
  const voltDir = resolve(rootDir, ".volt");
  return {
    daemonDir: resolve(voltDir, "daemon"),
    generatedDir: resolve(voltDir, "generated"),
    integrationsGeneratedDir: resolve(voltDir, "generated", "integrations"),
    integrationsStateDir: resolve(voltDir, "state", "integrations"),
    stateDir: resolve(voltDir, "state"),
    voltDir,
  };
};

export const mergeEnv = (
  base: NodeJS.ProcessEnv,
  extra?: Record<string, string | undefined>,
): Record<string, string> => {
  const merged: Record<string, string> = {};

  for (const [key, value] of Object.entries(base)) {
    if (typeof value === "string") {
      merged[key] = value;
    }
  }

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
};

export const failOnBuildErrors = (result: Bun.BuildOutput) => {
  if (result.success) return;
  for (const log of result.logs) {
    console.error(log);
  }
  throw new Error("Bun build failed.");
};
