import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const parseLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return;
  }

  const separator = trimmed.indexOf("=");
  if (separator === -1) {
    return;
  }

  const key = trimmed.slice(0, separator).trim();
  if (!key || process.env[key] !== undefined) {
    return;
  }

  const rawValue = trimmed.slice(separator + 1).trim();
  const value =
    rawValue.startsWith('"') && rawValue.endsWith('"')
      ? rawValue.slice(1, -1)
      : rawValue.startsWith("'") && rawValue.endsWith("'")
        ? rawValue.slice(1, -1)
        : rawValue;

  process.env[key] = value;
};

const findNearestEnvPath = (fromDir: string) => {
  let currentDir = fromDir;

  while (true) {
    const envPath = resolve(currentDir, ".env");
    if (existsSync(envPath)) {
      return envPath;
    }

    const parentDir = resolve(currentDir, "..");
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
};

export const loadProjectEnv = (fromDir = dirname(fileURLToPath(import.meta.url))) => {
  const envPath = findNearestEnvPath(fromDir);

  if (!envPath) {
    return;
  }

  return Bun.file(envPath).text().then((text) => {
    for (const line of text.split(/\r?\n/u)) {
      parseLine(line);
    }
  });
};
