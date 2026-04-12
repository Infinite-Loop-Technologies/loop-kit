import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { VoltMode } from "./contracts";

const ENV_LINE_RE = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/u;

const stripWrappingQuotes = (value: string) => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

const normalizeEnvValue = (rawValue: string) => {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return stripWrappingQuotes(trimmed)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"');
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return stripWrappingQuotes(trimmed);
  }

  const commentIndex = trimmed.search(/\s+#/u);
  return (commentIndex >= 0 ? trimmed.slice(0, commentIndex) : trimmed).trim();
};

const parseEnvFile = (content: string) => {
  const parsed: Record<string, string> = {};

  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = ENV_LINE_RE.exec(trimmed);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    parsed[key] = normalizeEnvValue(rawValue);
  }

  return parsed;
};

const createEnvCandidatePaths = (
  workspaceRoot: string,
  rootDir: string,
  mode: VoltMode,
) => {
  const modeName = mode === "production" ? "production" : "development";
  const relativeRoots =
    resolve(workspaceRoot) === resolve(rootDir)
      ? [workspaceRoot]
      : [workspaceRoot, rootDir];

  const ordered = relativeRoots.flatMap((baseDir) => [
    resolve(baseDir, ".env"),
    resolve(baseDir, `.env.${modeName}`),
    resolve(baseDir, ".env.local"),
    resolve(baseDir, `.env.${modeName}.local`),
  ]);

  return [...new Set(ordered)];
};

export const loadVoltEnv = (options: {
  mode: VoltMode;
  rootDir: string;
  workspaceRoot: string;
}) => {
  const merged: Record<string, string> = {};

  for (const path of createEnvCandidatePaths(
    options.workspaceRoot,
    options.rootDir,
    options.mode,
  )) {
    if (!existsSync(path)) {
      continue;
    }

    Object.assign(merged, parseEnvFile(readFileSync(path, "utf8")));
  }

  return merged;
};

export const withScopedProcessEnv = async <TValue>(
  extraEnv: Record<string, string>,
  run: () => Promise<TValue>,
) => {
  const previous = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(extraEnv)) {
    previous.set(key, process.env[key]);
    process.env[key] = value;
  }

  try {
    return await run();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};
