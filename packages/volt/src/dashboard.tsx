import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createCliRenderer } from "@opentui/core";
import {
  createRoot,
  useKeyboard,
  useRenderer,
  useTerminalDimensions,
} from "@opentui/react";
import { useEffect, useState } from "react";

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

type PaneId = "configs" | "events" | "logs" | "resources";

const paneOrder: PaneId[] = ["resources", "configs", "events", "logs"];

const clampIndex = (value: number, size: number) =>
  size <= 0 ? 0 : Math.min(Math.max(value, 0), size - 1);

const cyclePane = (activePane: PaneId, delta: number) => {
  const current = paneOrder.indexOf(activePane);
  const next = (current + delta + paneOrder.length) % paneOrder.length;
  return paneOrder[next] ?? "resources";
};

const formatStatus = (value?: string) => value ?? "unknown";

const getResources = (snapshot: DashboardSnapshot) => snapshot.state?.resources ?? [];

const getConfigs = (snapshot: DashboardSnapshot) =>
  Object.entries(snapshot.state?.byConfig ?? {}).sort(([left], [right]) =>
    left.localeCompare(right),
  );

const getEvents = (snapshot: DashboardSnapshot) => snapshot.state?.events ?? [];

const getLogs = (snapshot: DashboardSnapshot) => snapshot.logLines.slice(-200);

const Pane = ({
  active,
  children,
  onSelect,
  title,
}: {
  active: boolean;
  children: React.ReactNode;
  onSelect: () => void;
  title: string;
}) => (
  <box
    border
    borderColor={active ? "#7dd3fc" : "#355070"}
    borderStyle={active ? "double" : "single"}
    flexDirection="column"
    flexGrow={1}
    minHeight={8}
    onMouseDown={onSelect}
    padding={1}
    title={title}
    width="100%"
  >
    {children}
  </box>
);

const ListRow = ({
  content,
  onSelect,
  selected,
}: {
  content: string;
  onSelect: () => void;
  selected: boolean;
}) => (
  <box
    backgroundColor={selected ? "#12304a" : "transparent"}
    onMouseDown={onSelect}
    paddingX={1}
    width="100%"
  >
    <text fg={selected ? "#d9f0ff" : "#c9d6ea"}>{content}</text>
  </box>
);

const EmptyState = ({ content }: { content: string }) => (
  <box paddingX={1}>
    <text fg="#7f8ea3">{content}</text>
  </box>
);

const DashboardApp = ({
  onRefresh,
  refreshMs,
  snapshot,
}: {
  onRefresh: () => void;
  refreshMs: number;
  snapshot: DashboardSnapshot;
}) => {
  const renderer = useRenderer();
  const { width } = useTerminalDimensions();
  const [activePane, setActivePane] = useState<PaneId>("resources");
  const [selectedIndexes, setSelectedIndexes] = useState<Record<PaneId, number>>({
    configs: 0,
    events: 0,
    logs: 0,
    resources: 0,
  });

  const resources = getResources(snapshot);
  const configs = getConfigs(snapshot);
  const events = getEvents(snapshot);
  const logs = getLogs(snapshot);
  const isWide = width >= 120;

  useEffect(() => {
    setSelectedIndexes((current) => ({
      configs: clampIndex(current.configs, configs.length),
      events: clampIndex(current.events, events.length),
      logs: clampIndex(current.logs, logs.length),
      resources: clampIndex(current.resources, resources.length),
    }));
  }, [configs.length, events.length, logs.length, resources.length]);

  const moveSelection = (delta: number) => {
    setSelectedIndexes((current) => {
      const sizes = {
        configs: configs.length,
        events: events.length,
        logs: logs.length,
        resources: resources.length,
      };
      return {
        ...current,
        [activePane]: clampIndex(current[activePane] + delta, sizes[activePane]),
      };
    });
  };

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape") {
      renderer.destroy();
      return;
    }

    if (key.name === "tab") {
      setActivePane((current) => cyclePane(current, key.shift ? -1 : 1));
      return;
    }

    if (key.name === "left" || (key.shift && key.name === "h")) {
      setActivePane((current) => cyclePane(current, -1));
      return;
    }

    if (key.name === "right" || (key.shift && key.name === "l")) {
      setActivePane((current) => cyclePane(current, 1));
      return;
    }

    if (key.name === "up" || key.name === "k") {
      moveSelection(-1);
      return;
    }

    if (key.name === "down" || key.name === "j") {
      moveSelection(1);
      return;
    }

    if (key.name === "r") {
      onRefresh();
    }
  });

  const statusLine = [
    `status ${formatStatus(snapshot.state?.status)}`,
    `mode ${snapshot.state?.mode ?? "unknown"}`,
    `pid ${snapshot.state?.pid ?? "n/a"}`,
    `resources ${resources.length}`,
    `configs ${configs.length}`,
    `refresh ${refreshMs}ms`,
  ].join("  ");

  return (
    <box
      backgroundColor="#07111d"
      flexDirection="column"
      height="100%"
      padding={1}
      width="100%"
    >
      <box
        backgroundColor="#0b1b2c"
        border
        borderColor="#3a5f83"
        flexDirection="column"
        padding={1}
      >
        <text>
          <strong>Volt Dashboard</strong>
        </text>
        <text fg="#d6e4f0">{statusLine}</text>
        <text fg="#91a7c0">
          Tab pane | arrows or j/k move | r refresh | q quit | mouse selects panes and rows
        </text>
      </box>

      <box
        flexDirection={isWide ? "row" : "column"}
        flexGrow={1}
        gap={1}
        marginTop={1}
        width="100%"
      >
        <Pane
          active={activePane === "resources"}
          onSelect={() => setActivePane("resources")}
          title="Resources"
        >
          <text fg="#91a7c0">
            Affected: {(snapshot.state?.affectedTasks ?? []).join(", ") || "none"}
          </text>
          <scrollbox focused={activePane === "resources"} flexGrow={1}>
            {resources.length ? (
              resources.map((resource, index) => (
                <ListRow
                  content={`${resource.status.padEnd(8)} ${resource.kind.padEnd(7)} ${resource.label}`}
                  key={`${resource.kind}:${resource.label}`}
                  onSelect={() => {
                    setActivePane("resources");
                    setSelectedIndexes((current) => ({ ...current, resources: index }));
                  }}
                  selected={selectedIndexes.resources === index}
                />
              ))
            ) : (
              <EmptyState content="No daemon-owned resources are running yet." />
            )}
          </scrollbox>
        </Pane>

        <Pane
          active={activePane === "configs"}
          onSelect={() => setActivePane("configs")}
          title="Configs"
        >
          <text fg="#91a7c0">Workspace configs and per-config affected tasks.</text>
          <scrollbox focused={activePane === "configs"} flexGrow={1}>
            {configs.length ? (
              configs.map(([configId, config], index) => (
                <ListRow
                  content={`${config.status.padEnd(8)} ${configId} :: ${(config.affectedTasks ?? []).join(", ") || "none"}`}
                  key={configId}
                  onSelect={() => {
                    setActivePane("configs");
                    setSelectedIndexes((current) => ({ ...current, configs: index }));
                  }}
                  selected={selectedIndexes.configs === index}
                />
              ))
            ) : (
              <EmptyState content="No config snapshots have been written yet." />
            )}
          </scrollbox>
        </Pane>
      </box>

      <box
        flexDirection={isWide ? "row" : "column"}
        flexGrow={1}
        gap={1}
        marginTop={1}
        width="100%"
      >
        <Pane
          active={activePane === "events"}
          onSelect={() => setActivePane("events")}
          title="Recent Events"
        >
          <text fg="#91a7c0">Latest daemon/runtime events.</text>
          <scrollbox focused={activePane === "events"} flexGrow={1}>
            {events.length ? (
              events.slice(-80).map((event, index, array) => {
                const absoluteIndex = array.length - Math.min(array.length, 80) + index;
                return (
                  <ListRow
                    content={`${event.type.padEnd(12)} ${event.label} ${event.status ?? ""} ${event.message ?? ""}`.trim()}
                    key={`${event.at}:${event.label}:${absoluteIndex}`}
                    onSelect={() => {
                      setActivePane("events");
                      setSelectedIndexes((current) => ({ ...current, events: absoluteIndex }));
                    }}
                    selected={selectedIndexes.events === absoluteIndex}
                  />
                );
              })
            ) : (
              <EmptyState content="No daemon events recorded yet." />
            )}
          </scrollbox>
        </Pane>

        <Pane
          active={activePane === "logs"}
          onSelect={() => setActivePane("logs")}
          title="Recent Logs"
        >
          <text fg="#91a7c0">
            Changed: {(snapshot.state?.lastChangedFiles ?? []).join(", ") || "none"}
          </text>
          <scrollbox focused={activePane === "logs"} flexGrow={1}>
            {logs.length ? (
              logs.map((line, index) => (
                <ListRow
                  content={line}
                  key={`${index}:${line}`}
                  onSelect={() => {
                    setActivePane("logs");
                    setSelectedIndexes((current) => ({ ...current, logs: index }));
                  }}
                  selected={selectedIndexes.logs === index}
                />
              ))
            ) : (
              <EmptyState content="No workspace log file is available yet." />
            )}
          </scrollbox>
        </Pane>
      </box>
    </box>
  );
};

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
  const refreshMs = 750;
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  });
  const root = createRoot(renderer);

  const render = async () => {
    const state = await readJson<DashboardState>(statePath);
    const logLines = await readLogLines(logPath);
    root.render(
      <DashboardApp
        onRefresh={() => {
          void render();
        }}
        refreshMs={refreshMs}
        snapshot={{ logLines, state }}
      />,
    );
  };

  const timer = setInterval(() => {
    void render();
  }, refreshMs);

  const destroyRenderer = renderer.destroy.bind(renderer);
  renderer.destroy = () => {
    clearInterval(timer);
    return destroyRenderer();
  };

  await render();
};

if (import.meta.main) {
  await runVoltDashboard(process.cwd());
}
