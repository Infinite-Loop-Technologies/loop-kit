import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { VoltAnyTaskDefinition, VoltTaskSelectionDefaults } from "./task";
import { normalizeTaskDefaults } from "./task";

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

export interface VoltWorkspaceProjectReference {
  configPath?: string;
  source?: string;
}

export interface VoltWorkspaceConfigInput {
  defaults?: VoltTaskSelectionDefaults;
  name?: string;
  projects?: Record<string, unknown>;
  tasks?: Record<string, VoltAnyTaskDefinition>;
}

export interface LoadedVoltWorkspaceLike {
  configPath: string;
  defaults: {
    build: string[];
    dev: string[];
  };
  name: string;
  projects: Record<string, unknown>;
  rootDir: string;
  tasks: Record<string, VoltAnyTaskDefinition>;
}

export interface VoltWorkspaceConfigDefinition {
  kind?: "volt-workspace-config";
  source?: string;
  value: VoltWorkspaceConfigInput;
}

export const defineWorkspaceConfig = (
  value: VoltWorkspaceConfigInput,
): VoltWorkspaceConfigDefinition => ({
  kind: "volt-workspace-config",
  source: inferSourcePath(),
  value,
});

export const isWorkspaceConfigDefinition = (
  value: unknown,
): value is VoltWorkspaceConfigDefinition =>
  typeof value === "object" &&
  value !== null &&
  (value as VoltWorkspaceConfigDefinition).kind === "volt-workspace-config";

export const normalizeWorkspaceConfig = (
  definition: VoltWorkspaceConfigDefinition,
): LoadedVoltWorkspaceLike => {
  const configPath = definition.source ?? process.cwd();
  return {
    configPath,
    defaults: normalizeTaskDefaults(definition.value.defaults),
    name: definition.value.name ?? "Volt Workspace",
    projects: definition.value.projects ?? {},
    rootDir: dirname(configPath),
    tasks: definition.value.tasks ?? {},
  };
};
