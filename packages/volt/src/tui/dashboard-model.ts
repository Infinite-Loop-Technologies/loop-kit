import type { LoadedWorkspaceProject, ResolvedVoltWorkspaceContext } from "../workspace-runtime";

export interface DashboardState {
  affectedTasks?: string[];
  byConfig?: Record<
    string,
    {
      affectedTasks?: string[];
      appRoot?: string;
      configPath: string;
      lastChangedFiles?: string[];
      resources?: Array<{
        kind: "process" | "resource";
        label: string;
        status: string;
      }>;
      status: string;
    }
  >;
  configs: string[];
  events?: Array<{
    at: string;
    label: string;
    message?: string;
    scope?: string;
    status?: string;
    type: string;
  }>;
  id?: string;
  workspace?: {
    id: string;
    name: string;
    rootDir: string;
  };
  lastChangedFiles?: string[];
  mode: string;
  pid?: number;
  reason?: string;
  resources?: Array<{
    kind: "process" | "resource";
    label: string;
    status: string;
  }>;
  status: string;
  updatedAt?: string;
}

export interface DashboardSnapshot {
  logLines: string[];
  state?: DashboardState;
}

export interface DashboardRun {
  command: string;
  cwd: string;
  exitCode?: number | null;
  id: string;
  logs: string[];
  projectAlias: string;
  startedAt: string;
  status: "failed" | "running" | "succeeded";
  taskName: string;
}

export type ViewMode = "projects" | "tasks";

export interface DashboardEnvironment {
  cliScriptPath: string;
  context: ResolvedVoltWorkspaceContext;
  logPath: string;
  mode: "development" | "production";
  refreshMs: number;
  statePath: string;
}

export interface DashboardStoreState {
  context: ResolvedVoltWorkspaceContext;
  copyArmedAt: number;
  refreshMs: number;
  runs: DashboardRun[];
  selectedProjectIndex: number;
  selectedTaskIndex: number;
  snapshot: DashboardSnapshot;
  viewMode: ViewMode;
}

export const maxRunLogs = 180;
export const copyChordMs = 650;

export const clampIndex = (value: number, size: number) =>
  size <= 0 ? 0 : Math.min(Math.max(value, 0), size - 1);

export const truncate = (value: string, limit: number) =>
  value.length > limit ? `${value.slice(0, Math.max(limit - 1, 1))}…` : value;

export const now = () => new Date().toISOString();

export const launchTaskLabel = (
  project: LoadedWorkspaceProject,
  taskName: string,
) => `volt task run ${project.alias} ${taskName}`;
