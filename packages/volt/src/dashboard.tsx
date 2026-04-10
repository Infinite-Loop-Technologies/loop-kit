import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";

interface DashboardState {
  affectedTasks?: string[];
  byConfig?: Record<
    string,
    {
      affectedTasks?: string[];
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
    status?: string;
    type: string;
  }>;
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
}

interface DashboardSnapshot {
  logLines: string[];
  state?: DashboardState;
}

const App = ({ snapshot }: { snapshot: DashboardSnapshot }) => (
  <box border padding={1} width="100%" height="100%" flexDirection="column">
    <text>Volt Dashboard</text>
    <text>
      Status: {snapshot.state?.status ?? "unknown"} | Mode: {snapshot.state?.mode ?? "unknown"} | PID:{" "}
      {snapshot.state?.pid ?? "n/a"}
    </text>
    <text>Configs: {(snapshot.state?.configs ?? []).join(", ") || "none"}</text>
    <text>Affected: {(snapshot.state?.affectedTasks ?? []).join(", ") || "none"}</text>
    <text>Changed: {(snapshot.state?.lastChangedFiles ?? []).join(", ") || "none"}</text>
    <text>Resources</text>
    {(snapshot.state?.resources ?? []).slice(0, 8).map((resource) => (
      <text key={`${resource.kind}:${resource.label}`}>
        [{resource.kind}] {resource.label} :: {resource.status}
      </text>
    ))}
    <text>Per Config</text>
    {Object.entries(snapshot.state?.byConfig ?? {}).slice(0, 6).map(([configId, config]) => (
      <text key={configId}>
        {configId} :: {config.status} :: affected=
        {(config.affectedTasks ?? []).join(", ") || "none"}
      </text>
    ))}
    <text>Recent Logs</text>
    {snapshot.logLines.slice(-10).map((line, index) => (
      <text key={`${index}:${line}`}>{line}</text>
    ))}
    <text>Press q to close.</text>
  </box>
);

const readJson = async <TValue,>(path: string) => {
  if (!existsSync(path)) {
    return undefined;
  }
  return JSON.parse(await readFile(path, "utf8")) as TValue;
};

const readLogLines = async (path: string) => {
  if (!existsSync(path)) {
    return [];
  }
  return (await readFile(path, "utf8"))
    .split(/\r?\n/u)
    .filter(Boolean);
};

export const runVoltDashboard = async (workspaceRoot = process.cwd()) => {
  const daemonDir = resolve(workspaceRoot, ".volt", "daemon");
  const statePath = resolve(daemonDir, "workspace.json");
  const logPath = resolve(daemonDir, "workspace.log");
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  });
  const root = createRoot(renderer);

  const render = async () => {
    const state = await readJson<DashboardState>(statePath);
    const logLines = await readLogLines(logPath);
    root.render(<App snapshot={{ logLines, state }} />);
  };

  const timer = setInterval(() => {
    void render();
  }, 750);

  renderer.keyInput.on("keypress", (key) => {
    if (key.name === "q") {
      clearInterval(timer);
      renderer.destroy();
    }
  });

  await render();
};

if (import.meta.main) {
  await runVoltDashboard(process.cwd());
}
