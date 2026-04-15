import { existsSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import type { VoltCommand, VoltMode } from "./contracts";
import { loadVoltProject, loadVoltWorkspace } from "./config";
import { discoverVoltConfigPaths } from "./daemon";
import type { LoadedVoltProjectLike } from "./task";
import type { LoadedVoltWorkspaceLike } from "./workspace";

export interface LoadedWorkspaceProject {
  alias: string;
  configPath: string;
  identifiers: string[];
  project: LoadedVoltProjectLike;
  relativeConfigPath: string;
  relativeRootDir: string;
}

export interface ResolvedVoltWorkspaceContext {
  currentProject?: LoadedWorkspaceProject;
  cwd: string;
  projectConfigPath?: string;
  projects: LoadedWorkspaceProject[];
  workspace?: LoadedVoltWorkspaceLike;
  workspaceConfigPath?: string;
  workspaceRoot: string;
}

interface ResolveContextOptions {
  command?: VoltCommand;
  cwd?: string;
  mode?: VoltMode;
  projectConfigPath?: string;
  workspaceConfigPath?: string;
}

const workspaceConfigName = "volt.workspace.ts";
const projectConfigName = "volt.config.ts";

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const dedupe = (values: Iterable<string>) =>
  [...new Set(values)].filter(Boolean);

const findNearestFileUp = (startDir: string, fileName: string) => {
  let current = resolve(startDir);

  while (true) {
    const candidate = resolve(current, fileName);
    if (existsSync(candidate)) {
      return candidate;
    }

    const parent = dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
};

const inferWorkspaceRoot = async (cwd: string, projectConfigPath?: string) => {
  let current = resolve(projectConfigPath ? dirname(projectConfigPath) : cwd);
  let best = projectConfigPath ? dirname(projectConfigPath) : cwd;

  while (true) {
    const discovered = await discoverVoltConfigPaths(current);
    if (discovered.length > 0) {
      best = current;
    }
    if (discovered.length > 1) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      return best;
    }
    current = parent;
  }
};

const toProjectConfigPath = (
  workspaceRoot: string,
  value: unknown,
): string | undefined => {
  if (typeof value === "string") {
    return resolve(workspaceRoot, value);
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "configPath" in value &&
    typeof (value as { configPath?: unknown }).configPath === "string"
  ) {
    return resolve(workspaceRoot, (value as { configPath: string }).configPath);
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "configPath" in value &&
    "tasks" in value &&
    typeof (value as { configPath?: unknown }).configPath === "string"
  ) {
    return resolve(String((value as { configPath: string }).configPath));
  }

  const source =
    typeof value === "function" && "source" in value
      ? (value as { source?: string }).source
      : typeof value === "object" && value !== null && "source" in value
        ? (value as { source?: string }).source
        : undefined;

  return source ? resolve(source) : undefined;
};

const createProjectIdentifiers = (
  alias: string,
  project: LoadedVoltProjectLike,
  workspaceRoot: string,
) =>
  dedupe([
    alias,
    toSlug(alias),
    project.name,
    toSlug(project.name),
    basename(project.rootDir),
    toSlug(basename(project.rootDir)),
    relative(workspaceRoot, project.rootDir).replace(/\\/g, "/"),
    relative(workspaceRoot, project.configPath).replace(/\\/g, "/"),
  ]);

const loadWorkspaceProjects = async (
  workspaceRoot: string,
  mode: VoltMode,
  command: VoltCommand,
  workspace?: LoadedVoltWorkspaceLike,
): Promise<LoadedWorkspaceProject[]> => {
  const referencedEntries = workspace
    ? Object.entries(workspace.projects)
    : [];
  const discoveredPaths =
    referencedEntries.length > 0
      ? referencedEntries.flatMap(([, value]) => {
          const configPath = toProjectConfigPath(workspaceRoot, value);
          return configPath ? [configPath] : [];
        })
      : await discoverVoltConfigPaths(workspaceRoot);

  const aliasByConfigPath = new Map<string, string>();
  for (const [alias, value] of referencedEntries) {
    const configPath = toProjectConfigPath(workspaceRoot, value);
    if (configPath) {
      aliasByConfigPath.set(resolve(configPath), alias);
    }
  }

  const projects = await Promise.all(
    dedupe(discoveredPaths.map((configPath) => resolve(configPath))).map(async (configPath) => {
      const project = await loadVoltProject(command, configPath, mode, workspaceRoot);
      const alias = aliasByConfigPath.get(configPath) ?? basename(project.rootDir);
      return {
        alias,
        configPath,
        identifiers: createProjectIdentifiers(alias, project, workspaceRoot),
        project,
        relativeConfigPath: relative(workspaceRoot, configPath).replace(/\\/g, "/"),
        relativeRootDir: relative(workspaceRoot, project.rootDir).replace(/\\/g, "/") || ".",
      } satisfies LoadedWorkspaceProject;
    }),
  );

  return projects.sort((left, right) => left.alias.localeCompare(right.alias));
};

const resolveCurrentProject = (
  cwd: string,
  projects: LoadedWorkspaceProject[],
  explicitProjectConfigPath?: string,
) => {
  if (explicitProjectConfigPath) {
    const resolved = resolve(explicitProjectConfigPath);
    return projects.find((project) => resolve(project.configPath) === resolved);
  }

  const resolvedCwd = resolve(cwd);
  return [...projects]
    .filter((project) => {
      const root = resolve(project.project.rootDir);
      return resolvedCwd === root || resolvedCwd.startsWith(`${root}\\`) || resolvedCwd.startsWith(`${root}/`);
    })
    .sort((left, right) => right.project.rootDir.length - left.project.rootDir.length)[0];
};

export const findNearestWorkspaceConfigPath = (startDir: string) =>
  findNearestFileUp(startDir, workspaceConfigName);

export const findNearestProjectConfigPath = (startDir: string) =>
  findNearestFileUp(startDir, projectConfigName);

export const resolveWorkspaceProject = (
  projects: LoadedWorkspaceProject[],
  selector: string,
) => {
  const normalized = selector.trim().toLowerCase();
  return projects.find((project) =>
    project.identifiers.some((identifier) => identifier.toLowerCase() === normalized),
  );
};

export const resolveVoltWorkspaceContext = async (
  options: ResolveContextOptions = {},
): Promise<ResolvedVoltWorkspaceContext> => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const workspaceConfigPath = options.workspaceConfigPath
    ? resolve(options.workspaceConfigPath)
    : findNearestWorkspaceConfigPath(cwd);
  const workspace = workspaceConfigPath
    ? await loadVoltWorkspace(workspaceConfigPath)
    : undefined;
  const projectConfigPath = options.projectConfigPath
    ? resolve(options.projectConfigPath)
    : findNearestProjectConfigPath(cwd);
  const mode = options.mode ?? "development";
  const command = options.command ?? "dev";
  const workspaceRoot = workspace?.rootDir ?? (await inferWorkspaceRoot(cwd, projectConfigPath));
  const projects = await loadWorkspaceProjects(workspaceRoot, mode, command, workspace);
  const currentProject = resolveCurrentProject(cwd, projects, projectConfigPath);

  return {
    currentProject,
    cwd,
    projectConfigPath,
    projects,
    workspace,
    workspaceConfigPath,
    workspaceRoot,
  };
};
