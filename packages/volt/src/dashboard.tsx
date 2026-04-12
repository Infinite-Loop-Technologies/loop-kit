import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createCliRenderer,
  type KeyEvent as OpenTuiKeyEvent,
} from "@opentui/core";
import {
  createRoot,
  useKeyboard,
  useRenderer,
  useTerminalDimensions,
} from "@opentui/react";
import {
  createInteractionRuntime,
  type InteractionRuntime,
  type KeyGesture,
} from "@loop-kit/interaction";
import * as React from "react";

interface DashboardState {
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

type FocusArea = "command" | "inspector" | "sidebar" | "terminal";
type SessionKind = "command" | "daemon";
type SessionStatus = "exited" | "failed" | "running";
type SessionLogStream = "stderr" | "stdout" | "system";

interface SessionLogEntry {
  at: string;
  id: string;
  line: string;
  stream: SessionLogStream;
}

interface DashboardSession {
  command: string;
  cwd: string;
  exitCode?: number | null;
  id: string;
  kind: SessionKind;
  logs: SessionLogEntry[];
  startedAt: string;
  status: SessionStatus;
  title: string;
}

interface ParsedLogBlock {
  collapsible: boolean;
  detailLines: string[];
  summary: string;
}

type ProcessRegistry = {
  add: (processRef: Bun.Subprocess) => void;
  delete: (processRef: Bun.Subprocess) => void;
  destroyAll: () => Promise<void>;
};

const scopeIds = {
  command: "volt-ui-command",
  inspector: "volt-ui-inspector",
  root: "volt-ui-root",
  sidebar: "volt-ui-sidebar",
  terminal: "volt-ui-terminal",
} as const;

const actionIds = {
  collapseLog: "volt.ui.collapse-log",
  expandLog: "volt.ui.expand-log",
  focusCommand: "volt.ui.focus-command",
  focusNextPane: "volt.ui.focus-next-pane",
  focusPreviousPane: "volt.ui.focus-previous-pane",
  focusTerminal: "volt.ui.focus-terminal",
  moveDown: "volt.ui.move-down",
  moveUp: "volt.ui.move-up",
  quit: "volt.ui.quit",
  refresh: "volt.ui.refresh",
  runCommand: "volt.ui.run-command",
  toggleLog: "volt.ui.toggle-log",
} as const;

const paneOrder: FocusArea[] = ["sidebar", "terminal", "inspector", "command"];
const daemonSessionId = "workspace-daemon";
const maxSessionLogs = 600;
const knownVoltCommands = new Set([
  "build",
  "daemon",
  "dashboard",
  "dev",
  "task",
  "ui",
  "volt",
]);

const now = () => new Date().toISOString();

const clampIndex = (value: number, size: number) =>
  size <= 0 ? 0 : Math.min(Math.max(value, 0), size - 1);

const cyclePane = (activePane: FocusArea, delta: number) => {
  const currentIndex = paneOrder.indexOf(activePane);
  const nextIndex = (currentIndex + delta + paneOrder.length) % paneOrder.length;
  return paneOrder[nextIndex] ?? "terminal";
};

const formatStatus = (value?: string) => value ?? "unknown";

const truncate = (value: string, limit: number) =>
  value.length > limit ? `${value.slice(0, limit - 1)}…` : value;

const createProcessRegistry = (): ProcessRegistry => {
  const active = new Set<Bun.Subprocess>();

  return {
    add: (processRef) => {
      active.add(processRef);
    },
    delete: (processRef) => {
      active.delete(processRef);
    },
    destroyAll: async () => {
      for (const processRef of [...active]) {
        try {
          processRef.kill();
        } catch {}
      }
      await Promise.all(
        [...active].map((processRef) =>
          Promise.race([
            processRef.exited.catch(() => undefined),
            Bun.sleep(250),
          ]),
        ),
      );
      active.clear();
    },
  };
};

const ensureRendererCompatibility = () => {
  if (process.env.TERM_PROGRAM?.toLowerCase() === "vscode") {
    process.env.OTUI_USE_ALTERNATE_SCREEN ??= "false";
    process.env.OTUI_OVERRIDE_STDOUT ??= "false";
  }
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

const createDaemonSession = (
  snapshot: DashboardSnapshot,
  workspaceRoot: string,
): DashboardSession => ({
  command: "workspace daemon log",
  cwd: workspaceRoot,
  id: daemonSessionId,
  kind: "daemon",
  logs: snapshot.logLines.slice(-maxSessionLogs).map((line, index) => ({
    at: now(),
    id: `${daemonSessionId}:${index}`,
    line,
    stream: "system",
  })),
  startedAt: snapshot.state?.events?.[0]?.at ?? now(),
  status: snapshot.state?.status === "running" ? "running" : "exited",
  title: "workspace-daemon",
});

const getShellCommand = (command: string) =>
  process.platform === "win32"
    ? ["powershell", "-NoLogo", "-NoProfile", "-Command", command]
    : [process.env.SHELL || "bash", "-lc", command];

const normalizeLauncherCommand = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("volt ")) {
    return trimmed;
  }

  const [firstToken] = trimmed.split(/\s+/u);
  if (!firstToken) {
    return undefined;
  }

  if (firstToken.startsWith("--") || knownVoltCommands.has(firstToken)) {
    return `volt ${trimmed}`;
  }

  if (!trimmed.includes(" ") && firstToken.includes(":")) {
    return `volt task run ${firstToken}`;
  }

  return trimmed;
};

const normalizeLogPrefix = (value: string) => value.replace(/\s+/g, " ").trim();

const tryParseJsonSuffix = (line: string) => {
  const candidates = [
    ...line.matchAll(/\s(\{.*|\[.*)$/gu),
    ...line.matchAll(/^(\{.*|\[.*)$/gu),
  ];

  for (const candidate of candidates) {
    const raw = candidate[1]?.trim();
    if (!raw) {
      continue;
    }

    try {
      return {
        prefix: normalizeLogPrefix(line.slice(0, line.length - raw.length)),
        value: JSON.parse(raw) as unknown,
      };
    } catch {}
  }

  return undefined;
};

const parseLogEntry = (entry: SessionLogEntry): ParsedLogBlock => {
  const parsed = tryParseJsonSuffix(entry.line);
  if (!parsed) {
    return {
      collapsible: entry.line.length > 160,
      detailLines: [],
      summary: entry.line,
    };
  }

  const pretty = JSON.stringify(parsed.value, null, 2);
  const detailLines = pretty.split("\n");
  const summaryLabel = Array.isArray(parsed.value)
    ? `array(${parsed.value.length})`
    : parsed.value && typeof parsed.value === "object"
      ? `object(${Object.keys(parsed.value as Record<string, unknown>).length})`
      : String(parsed.value);

  return {
    collapsible: detailLines.length > 1 || pretty.length > 120,
    detailLines,
    summary: parsed.prefix ? `${parsed.prefix} ${summaryLabel}` : summaryLabel,
  };
};

const mapOpenTuiKeyToGesture = (event: OpenTuiKeyEvent): KeyGesture => {
  const mappedName =
    event.name === "up"
      ? "ArrowUp"
      : event.name === "down"
        ? "ArrowDown"
        : event.name === "left"
          ? "ArrowLeft"
          : event.name === "right"
            ? "ArrowRight"
            : event.name === "enter" || event.name === "return"
              ? "Enter"
              : event.name === "escape"
                ? "Escape"
                : event.name === "space"
                  ? "Space"
                  : event.name;

  return {
    ctrlKey: event.ctrl,
    key: mappedName,
    metaKey: event.meta || event.option,
    shiftKey: event.shift,
  };
};

const Pane = ({
  active,
  children,
  title,
  width,
}: {
  active: boolean;
  children: React.ReactNode;
  title: string;
  width?: number;
}) => (
  <box
    border
    borderColor={active ? "#7dd3fc" : "#314255"}
    borderStyle="single"
    flexDirection="column"
    flexGrow={width ? 0 : 1}
    minHeight={4}
    overflow="hidden"
    padding={1}
    title={title}
    width={width}
  >
    {children}
  </box>
);

const Row = ({
  active,
  children,
  tone,
}: {
  active: boolean;
  children: React.ReactNode;
  tone?: "error" | "muted" | "normal" | "success";
}) => (
  <box
    backgroundColor={active ? "#12304a" : "transparent"}
    flexDirection="column"
    paddingX={1}
    width="100%"
  >
    <text
      fg={
        tone === "error"
          ? "#fca5a5"
          : tone === "muted"
            ? "#8fa4ba"
            : tone === "success"
              ? "#86efac"
              : active
                ? "#e0f2ff"
                : "#d5e3f0"
      }
    >
      {children}
    </text>
  </box>
);

const EmptyState = ({ content }: { content: string }) => (
  <box paddingX={1}>
    <text fg="#7f8ea3">{content}</text>
  </box>
);

const SectionTitle = ({ content }: { content: string }) => (
  <box marginBottom={1}>
    <text fg="#8eb5d8">
      <strong>{content}</strong>
    </text>
  </box>
);

const ShortcutChip = ({ content }: { content: string }) => (
  <box
    backgroundColor="#102234"
    border
    borderColor="#27445f"
    borderStyle="single"
    paddingX={1}
  >
    <text fg="#9fc3e6">{content}</text>
  </box>
);

const readDashboardSnapshot = async (
  statePath: string,
  logPath: string,
): Promise<DashboardSnapshot> => ({
  logLines: await readLogLines(logPath),
  state: await readJson<DashboardState>(statePath),
});

const DashboardApp = ({
  onRefresh,
  processRegistry,
  refreshMs,
  snapshot,
  workspaceRoot,
}: {
  onRefresh: () => void;
  processRegistry: ProcessRegistry;
  refreshMs: number;
  snapshot: DashboardSnapshot;
  workspaceRoot: string;
}) => {
  const renderer = useRenderer();
  const { width } = useTerminalDimensions();
  const runtime = React.useMemo<InteractionRuntime>(() => createInteractionRuntime(), []);
  const [focusArea, setFocusArea] = React.useState<FocusArea>("terminal");
  const [selectedSessionId, setSelectedSessionId] = React.useState(daemonSessionId);
  const [terminalSelection, setTerminalSelection] = React.useState(0);
  const [commandInput, setCommandInput] = React.useState("");
  const [commandSessions, setCommandSessions] = React.useState<DashboardSession[]>([]);
  const [expandedLogs, setExpandedLogs] = React.useState<Record<string, boolean>>({});

  const sessions = React.useMemo(
    () => [createDaemonSession(snapshot, workspaceRoot), ...commandSessions],
    [commandSessions, snapshot, workspaceRoot],
  );
  const activeSession =
    sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
  const resources = snapshot.state?.resources ?? [];
  const configEntries = Object.entries(snapshot.state?.byConfig ?? {}).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  const selectedSidebarIndex = clampIndex(
    sessions.findIndex((session) => session.id === activeSession?.id),
    sessions.length,
  );
  const parsedActiveLogs = React.useMemo(
    () => (activeSession?.logs ?? []).map((entry) => ({ entry, parsed: parseLogEntry(entry) })),
    [activeSession],
  );
  const activeLogIndex = clampIndex(terminalSelection, parsedActiveLogs.length);
  const activeLog = parsedActiveLogs[activeLogIndex];
  const isWide = width >= 140;

  React.useEffect(() => {
    const unregisterRoot = runtime.registerScope({
      id: scopeIds.root,
      kind: "volt-ui-root",
    });
    const unregisterSidebar = runtime.registerScope({
      id: scopeIds.sidebar,
      kind: "volt-ui-sidebar",
      parentId: scopeIds.root,
    });
    const unregisterTerminal = runtime.registerScope({
      id: scopeIds.terminal,
      kind: "volt-ui-terminal",
      parentId: scopeIds.root,
    });
    const unregisterInspector = runtime.registerScope({
      id: scopeIds.inspector,
      kind: "volt-ui-inspector",
      parentId: scopeIds.root,
    });
    const unregisterCommand = runtime.registerScope({
      capabilities: {
        textInput: true,
      },
      id: scopeIds.command,
      kind: "volt-ui-command",
      parentId: scopeIds.root,
    });

    const unregisterRootShortcuts = runtime.registerShortcutMap(scopeIds.root, [
      { actionId: actionIds.focusNextPane, gesture: "Tab" },
      { actionId: actionIds.focusPreviousPane, gesture: "Shift+Tab" },
      { actionId: actionIds.focusCommand, gesture: ":" },
      { actionId: actionIds.focusTerminal, gesture: "Escape", allowInTextInput: true },
      { actionId: actionIds.refresh, gesture: "r" },
      { actionId: actionIds.quit, gesture: "q" },
      { actionId: actionIds.quit, gesture: "Ctrl+C" },
    ]);
    const unregisterSidebarShortcuts = runtime.registerShortcutMap(scopeIds.sidebar, [
      { actionId: actionIds.moveUp, gesture: "k" },
      { actionId: actionIds.moveDown, gesture: "j" },
      { actionId: actionIds.moveUp, gesture: "ArrowUp" },
      { actionId: actionIds.moveDown, gesture: "ArrowDown" },
    ]);
    const unregisterTerminalShortcuts = runtime.registerShortcutMap(scopeIds.terminal, [
      { actionId: actionIds.moveUp, gesture: "k" },
      { actionId: actionIds.moveDown, gesture: "j" },
      { actionId: actionIds.moveUp, gesture: "ArrowUp" },
      { actionId: actionIds.moveDown, gesture: "ArrowDown" },
      { actionId: actionIds.toggleLog, gesture: "Enter" },
      { actionId: actionIds.toggleLog, gesture: "Space" },
      { actionId: actionIds.expandLog, gesture: "l" },
      { actionId: actionIds.expandLog, gesture: "ArrowRight" },
      { actionId: actionIds.collapseLog, gesture: "h" },
      { actionId: actionIds.collapseLog, gesture: "ArrowLeft" },
    ]);
    const unregisterCommandShortcuts = runtime.registerShortcutMap(scopeIds.command, [
      {
        actionId: actionIds.runCommand,
        allowInTextInput: true,
        gesture: "Enter",
      },
    ]);

    return () => {
      unregisterCommandShortcuts();
      unregisterTerminalShortcuts();
      unregisterSidebarShortcuts();
      unregisterRootShortcuts();
      unregisterCommand();
      unregisterInspector();
      unregisterTerminal();
      unregisterSidebar();
      unregisterRoot();
    };
  }, [runtime]);

  React.useEffect(() => {
    runtime.setActiveScope(scopeIds[focusArea]);
    runtime.setFocusedScope(scopeIds[focusArea]);
  }, [focusArea, runtime]);

  React.useEffect(() => {
    setTerminalSelection((current) => clampIndex(current, parsedActiveLogs.length));
  }, [parsedActiveLogs.length]);

  React.useEffect(() => {
    if (!activeSession) {
      setSelectedSessionId(daemonSessionId);
    }
  }, [activeSession]);

  const activeSessionRef = React.useRef(activeSession);
  activeSessionRef.current = activeSession;

  const sessionsRef = React.useRef(sessions);
  sessionsRef.current = sessions;

  const commandInputRef = React.useRef(commandInput);
  commandInputRef.current = commandInput;

  const activeLogRef = React.useRef(activeLog);
  activeLogRef.current = activeLog;

  const focusAreaRef = React.useRef(focusArea);
  focusAreaRef.current = focusArea;

  const appendSessionLog = React.useCallback(
    (sessionId: string, stream: SessionLogStream, line: string) => {
      setCommandSessions((current) =>
        current.map((session) =>
          session.id !== sessionId
            ? session
            : {
                ...session,
                logs: [
                  ...session.logs,
                  {
                    at: now(),
                    id: `${sessionId}:${session.logs.length}:${Date.now()}`,
                    line,
                    stream,
                  },
                ].slice(-maxSessionLogs),
              },
        ),
      );
    },
    [],
  );

  const launchCommand = React.useCallback(async () => {
    const normalized = normalizeLauncherCommand(commandInputRef.current);
    if (!normalized) {
      return;
    }

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const title = truncate(normalized.replace(/^volt\s+/u, ""), 30);
    const child = Bun.spawn({
      cmd: getShellCommand(normalized),
      cwd: workspaceRoot,
      env: process.env,
      stderr: "pipe",
      stdin: "ignore",
      stdout: "pipe",
    });

    processRegistry.add(child);
    setCommandInput("");
    setFocusArea("terminal");
    setSelectedSessionId(sessionId);
    setTerminalSelection(0);
    setCommandSessions((current) => [
      ...current,
      {
        command: normalized,
        cwd: workspaceRoot,
        id: sessionId,
        kind: "command",
        logs: [
          {
            at: now(),
            id: `${sessionId}:boot`,
            line: `$ ${normalized}`,
            stream: "system",
          },
        ],
        startedAt: now(),
        status: "running",
        title,
      },
    ]);

    const pipeLogs = async (
      input: ReadableStream<Uint8Array> | undefined,
      stream: SessionLogStream,
    ) => {
      if (!input) {
        return;
      }

      const reader = input.getReader();
      const decoder = new TextDecoder();
      let pending = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        pending += decoder.decode(value, { stream: true });
        const lines = pending.split(/\r?\n/u);
        pending = lines.pop() ?? "";

        for (const line of lines) {
          if (!line) {
            continue;
          }
          appendSessionLog(sessionId, stream, line);
        }
      }

      if (pending.trim()) {
        appendSessionLog(sessionId, stream, pending);
      }
    };

    void pipeLogs(child.stdout, "stdout");
    void pipeLogs(child.stderr, "stderr");

    void child.exited.then((code) => {
      processRegistry.delete(child);
      setCommandSessions((current) =>
        current.map((session) =>
          session.id !== sessionId
            ? session
            : (() => {
                const stream: SessionLogStream = code === 0 ? "system" : "stderr";
                return {
                  ...session,
                  exitCode: code,
                  logs: [
                    ...session.logs,
                    {
                      at: now(),
                      id: `${sessionId}:exit`,
                      line: `[session exited with code ${code}]`,
                      stream,
                    },
                  ].slice(-maxSessionLogs),
                  status: code === 0 ? "exited" : "failed",
                };
              })(),
        ),
      );
    });
  }, [appendSessionLog, processRegistry, workspaceRoot]);

  React.useEffect(() => {
    const unregisterQuit = runtime.registerActionHandler({
      actionId: actionIds.quit,
      handler: () => {
        renderer.destroy();
        return { handled: true };
      },
      scopeId: scopeIds.root,
    });
    const unregisterRefresh = runtime.registerActionHandler({
      actionId: actionIds.refresh,
      handler: () => {
        onRefresh();
        return { handled: true };
      },
      scopeId: scopeIds.root,
    });
    const unregisterFocusCommand = runtime.registerActionHandler({
      actionId: actionIds.focusCommand,
      handler: () => {
        setFocusArea("command");
        return { handled: true };
      },
      scopeId: scopeIds.root,
    });
    const unregisterFocusTerminal = runtime.registerActionHandler({
      actionId: actionIds.focusTerminal,
      handler: () => {
        setFocusArea("terminal");
        return { handled: true };
      },
      scopeId: scopeIds.root,
    });
    const unregisterFocusNextPane = runtime.registerActionHandler({
      actionId: actionIds.focusNextPane,
      handler: () => {
        setFocusArea((current) => cyclePane(current, 1));
        return { handled: true };
      },
      scopeId: scopeIds.root,
    });
    const unregisterFocusPreviousPane = runtime.registerActionHandler({
      actionId: actionIds.focusPreviousPane,
      handler: () => {
        setFocusArea((current) => cyclePane(current, -1));
        return { handled: true };
      },
      scopeId: scopeIds.root,
    });
    const unregisterRunCommand = runtime.registerActionHandler({
      actionId: actionIds.runCommand,
      handler: () => {
        void launchCommand();
        return { handled: true };
      },
      scopeId: scopeIds.command,
    });
    const unregisterMoveUp = runtime.registerActionHandler({
      actionId: actionIds.moveUp,
      handler: () => {
        if (focusAreaRef.current === "sidebar") {
          const nextIndex = clampIndex(selectedSidebarIndex - 1, sessionsRef.current.length);
          const nextSession = sessionsRef.current[nextIndex];
          if (nextSession) {
            setSelectedSessionId(nextSession.id);
          }
          return { handled: true };
        }

        if (focusAreaRef.current === "terminal") {
          setTerminalSelection((current) => clampIndex(current - 1, parsedActiveLogs.length));
          return { handled: true };
        }

        return { handled: true };
      },
      scopeId: scopeIds.root,
    });
    const unregisterMoveDown = runtime.registerActionHandler({
      actionId: actionIds.moveDown,
      handler: () => {
        if (focusAreaRef.current === "sidebar") {
          const nextIndex = clampIndex(selectedSidebarIndex + 1, sessionsRef.current.length);
          const nextSession = sessionsRef.current[nextIndex];
          if (nextSession) {
            setSelectedSessionId(nextSession.id);
          }
          return { handled: true };
        }

        if (focusAreaRef.current === "terminal") {
          setTerminalSelection((current) => clampIndex(current + 1, parsedActiveLogs.length));
          return { handled: true };
        }

        return { handled: true };
      },
      scopeId: scopeIds.root,
    });
    const unregisterToggleLog = runtime.registerActionHandler({
      actionId: actionIds.toggleLog,
      handler: () => {
        const currentLog = activeLogRef.current;
        if (!currentLog?.parsed.collapsible) {
          return { handled: true };
        }
        setExpandedLogs((current) => ({
          ...current,
          [currentLog.entry.id]: !current[currentLog.entry.id],
        }));
        return { handled: true };
      },
      scopeId: scopeIds.terminal,
    });
    const unregisterExpandLog = runtime.registerActionHandler({
      actionId: actionIds.expandLog,
      handler: () => {
        const currentLog = activeLogRef.current;
        if (!currentLog?.parsed.collapsible) {
          return { handled: true };
        }
        setExpandedLogs((current) => ({
          ...current,
          [currentLog.entry.id]: true,
        }));
        return { handled: true };
      },
      scopeId: scopeIds.terminal,
    });
    const unregisterCollapseLog = runtime.registerActionHandler({
      actionId: actionIds.collapseLog,
      handler: () => {
        const currentLog = activeLogRef.current;
        if (!currentLog?.parsed.collapsible) {
          return { handled: true };
        }
        setExpandedLogs((current) => ({
          ...current,
          [currentLog.entry.id]: false,
        }));
        return { handled: true };
      },
      scopeId: scopeIds.terminal,
    });

    return () => {
      unregisterCollapseLog();
      unregisterExpandLog();
      unregisterToggleLog();
      unregisterMoveDown();
      unregisterMoveUp();
      unregisterRunCommand();
      unregisterFocusPreviousPane();
      unregisterFocusNextPane();
      unregisterFocusTerminal();
      unregisterFocusCommand();
      unregisterRefresh();
      unregisterQuit();
    };
  }, [
    launchCommand,
    onRefresh,
    parsedActiveLogs.length,
    renderer,
    runtime,
    selectedSidebarIndex,
  ]);

  useKeyboard((event) => {
    if (event.eventType !== "press") {
      return;
    }

    void runtime.dispatchShortcut(mapOpenTuiKeyToGesture(event), {
      activeScopeId: scopeIds[focusArea],
      isTextInputActive: focusArea === "command",
    });
  });

  const statusItems = [
    `status ${formatStatus(snapshot.state?.status)}`,
    `mode ${snapshot.state?.mode ?? "unknown"}`,
    `pid ${snapshot.state?.pid ?? "n/a"}`,
    `sessions ${sessions.length}`,
    `resources ${resources.length}`,
    `refresh ${refreshMs}ms`,
  ];
  const shortcuts = [
    "Tab panes",
    ": command",
    "j/k move",
    "Enter open/run",
    "Ctrl+C quit",
  ];

  return (
    <box
      backgroundColor="#07111d"
      flexDirection="column"
      height="100%"
      overflow="hidden"
      width="100%"
    >
      <box
        backgroundColor="#0b1b2c"
        border
        borderColor="#34597a"
        flexDirection="column"
        margin={1}
        padding={1}
      >
        <box flexDirection="row" justifyContent="space-between" width="100%">
          <text fg="#dff1ff">
            <strong>Volt UI</strong>
          </text>
        </box>
        <box flexDirection="row" flexWrap="wrap" gap={1} marginTop={1}>
          {statusItems.map((item) => (
            <ShortcutChip content={item} key={item} />
          ))}
        </box>
        <box flexDirection="row" flexWrap="wrap" gap={1} marginTop={1}>
          {shortcuts.map((shortcut) => (
            <ShortcutChip content={shortcut} key={shortcut} />
          ))}
        </box>
      </box>

      <box
        flexDirection={isWide ? "row" : "column"}
        flexGrow={1}
        gap={1}
        marginX={1}
        width="100%"
      >
        <Pane active={focusArea === "sidebar"} title="Sessions" width={34}>
          <text fg="#91a7c0">Daemon log plus commands launched from the Volt UI.</text>
          <scrollbox focused={focusArea === "sidebar"} flexGrow={1} marginTop={1}>
            {sessions.length ? (
              sessions.map((session, index) => (
                <box key={session.id}>
                  <Row
                    active={selectedSidebarIndex === index}
                    tone={
                      session.status === "failed"
                        ? "error"
                        : session.status === "running"
                          ? "success"
                          : "normal"
                    }
                  >
                    {`${session.status.padEnd(7)} ${truncate(session.title, 22)}`}
                  </Row>
                </box>
              ))
            ) : (
              <EmptyState content="No sessions have been launched yet." />
            )}
          </scrollbox>
        </Pane>

        <Pane
          active={focusArea === "terminal"}
          title={`Terminal :: ${activeSession?.title ?? "none"}`}
        >
          <text fg="#91a7c0">
            {activeSession
              ? `${activeSession.command}  (${activeSession.cwd})`
              : "No active session selected."}
          </text>
          <scrollbox focused={focusArea === "terminal"} flexGrow={1} marginTop={1}>
            {parsedActiveLogs.length ? (
              parsedActiveLogs.map(({ entry, parsed }, index) => {
                const expanded = expandedLogs[entry.id] ?? false;
                const lines =
                  parsed.collapsible && expanded
                    ? [parsed.summary, ...parsed.detailLines.map((line) => `  ${line}`)]
                    : [parsed.collapsible ? `${parsed.summary}  [collapsed]` : parsed.summary];

                return (
                  <box key={entry.id} flexDirection="column">
                    {lines.map((line, lineIndex) => (
                      <Row
                        active={activeLogIndex === index}
                        key={`${entry.id}:${lineIndex}`}
                        tone={
                          entry.stream === "stderr"
                            ? "error"
                            : entry.stream === "system"
                              ? "muted"
                              : "normal"
                        }
                      >
                        {line}
                      </Row>
                    ))}
                  </box>
                );
              })
            ) : (
              <EmptyState content="No logs for the selected session yet." />
            )}
          </scrollbox>
        </Pane>

        <Pane active={focusArea === "inspector"} title="Inspector" width={isWide ? 44 : undefined}>
          <SectionTitle content="Selected Session" />
          {activeSession ? (
            <box flexDirection="column" marginBottom={1}>
              <text fg="#d6e4f0">{`title: ${activeSession.title}`}</text>
              <text fg="#d6e4f0">{`status: ${activeSession.status}`}</text>
              <text fg="#8ea6be">{`cwd: ${activeSession.cwd}`}</text>
              <text fg="#8ea6be">{`command: ${truncate(activeSession.command, 80)}`}</text>
            </box>
          ) : (
            <EmptyState content="No session selected." />
          )}

          <SectionTitle content="Daemon Resources" />
          <scrollbox flexGrow={1}>
            {resources.length ? (
              resources.map((resource) => (
                <Row
                  active={false}
                  key={`${resource.kind}:${resource.label}`}
                  tone={resource.status === "failed" ? "error" : resource.status === "running" ? "success" : "muted"}
                >
                  {`${resource.status.padEnd(8)} ${resource.kind.padEnd(7)} ${resource.label}`}
                </Row>
              ))
            ) : (
              <EmptyState content="No daemon-owned resources are running yet." />
            )}
          </scrollbox>

          <SectionTitle content="Configs" />
          <scrollbox flexGrow={1}>
            {configEntries.length ? (
              configEntries.map(([configId, config]) => (
                <box key={configId} flexDirection="column" marginBottom={1}>
                  <text fg="#d6e4f0">{`${config.status.padEnd(8)} ${configId}`}</text>
                  <text fg="#8ea6be">
                    {`affected: ${(config.affectedTasks ?? []).join(", ") || "none"}`}
                  </text>
                </box>
              ))
            ) : (
              <EmptyState content="No config snapshots have been written yet." />
            )}
          </scrollbox>
        </Pane>
      </box>

      <box margin={1} marginTop={1}>
        <Pane active={focusArea === "command"} title="Command">
          <text fg="#91a7c0">
            Run shell commands here. Bare Volt commands are prefixed automatically, and bare task names like `dev:forge` run through `volt task run`.
          </text>
          <box alignItems="center" flexDirection="row" gap={1} marginTop={1}>
            <text fg="#7dd3fc">$</text>
            <input
              backgroundColor="#0c1824"
              cursorColor="#7dd3fc"
              focused={focusArea === "command"}
              focusedBackgroundColor="#112233"
              onChange={setCommandInput}
              placeholder="dev:forge"
              placeholderColor="#5f7288"
              textColor="#dcecff"
              value={commandInput}
              width="100%"
            />
          </box>
        </Pane>
      </box>
    </box>
  );
};

const DashboardScreen = ({
  processRegistry,
  refreshMs,
  statePath,
  logPath,
  workspaceRoot,
}: {
  processRegistry: ProcessRegistry;
  refreshMs: number;
  statePath: string;
  logPath: string;
  workspaceRoot: string;
}) => {
  const [snapshot, setSnapshot] = React.useState<DashboardSnapshot>({
    logLines: [],
    state: undefined,
  });

  const refresh = React.useCallback(async () => {
    setSnapshot(await readDashboardSnapshot(statePath, logPath));
  }, [logPath, statePath]);

  React.useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, refreshMs);

    return () => {
      clearInterval(timer);
    };
  }, [refresh, refreshMs]);

  return (
    <DashboardApp
      onRefresh={() => {
        void refresh();
      }}
      processRegistry={processRegistry}
      refreshMs={refreshMs}
      snapshot={snapshot}
      workspaceRoot={workspaceRoot}
    />
  );
};

export const runVoltDashboard = async (workspaceRoot = process.cwd()) => {
  ensureRendererCompatibility();

  const daemonDir = resolve(workspaceRoot, ".volt", "daemon");
  const statePath = resolve(daemonDir, "workspace.json");
  const logPath = resolve(daemonDir, "workspace.log");
  const refreshMs = 750;
  const processRegistry = createProcessRegistry();
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    onDestroy: () => {
      void processRegistry.destroyAll();
    },
  });
  const root = createRoot(renderer);
  root.render(
    <DashboardScreen
      logPath={logPath}
      processRegistry={processRegistry}
      refreshMs={refreshMs}
      statePath={statePath}
      workspaceRoot={workspaceRoot}
    />,
  );
};

if (import.meta.main) {
  await runVoltDashboard(process.cwd());
}
