import { resolve } from "node:path";
import { createCliRenderer } from "@opentui/core";
import {
  createRoot,
  useKeyboard,
  useRenderer,
  useTerminalDimensions,
} from "@opentui/react";
import * as React from "react";
import { resolveVoltWorkspaceContext } from "./workspace-runtime";
import {
  clampIndex,
  maxRunLogs,
  truncate,
  type DashboardEnvironment,
} from "./tui/dashboard-model";
import { DashboardProvider, useDashboardService, useDashboardState } from "./tui/dashboard-provider";
import { createDashboardService } from "./tui/dashboard-service";
import {
  DialogProvider,
  Toaster,
  toast,
  useDialog,
  useDialogKeyboard,
} from "./tui/opentui-ui";
import type { AlertContext, DialogId } from "@opentui-ui/dialog/react";

const ensureRendererCompatibility = () => {
  if (process.env.TERM_PROGRAM?.toLowerCase() === "vscode") {
    process.env.OTUI_USE_ALTERNATE_SCREEN ??= "false";
    process.env.OTUI_OVERRIDE_STDOUT ??= "false";
  }
};

const readProcessStream = async (stream: ReadableStream<Uint8Array> | undefined) => {
  if (!stream) {
    return "";
  }

  return new Response(stream).text();
};

const copyTextToClipboard = async (text: string) => {
  if (process.platform === "win32") {
    const child = Bun.spawn({
      cmd: ["cmd", "/c", "clip"],
      stderr: "pipe",
      stdin: "pipe",
      stdout: "ignore",
    });
    child.stdin.write(text);
    child.stdin.end();
    const [stderr, exitCode] = await Promise.all([
      readProcessStream(child.stderr),
      child.exited,
    ]);
    if (exitCode !== 0) {
      throw new Error(stderr.trim() || `clip exited with code ${exitCode}`);
    }
    return;
  }

  const command =
    process.platform === "darwin"
      ? ["pbcopy"]
      : ["sh", "-lc", "wl-copy || xclip -selection clipboard"];
  const child = Bun.spawn({
    cmd: command,
    stderr: "pipe",
    stdin: "pipe",
    stdout: "ignore",
  });
  child.stdin.write(text);
  child.stdin.end();
  const [stderr, exitCode] = await Promise.all([
    readProcessStream(child.stderr),
    child.exited,
  ]);
  if (exitCode !== 0) {
    throw new Error(stderr.trim() || `clipboard command exited with code ${exitCode}`);
  }
};

const Pane = ({
  actions,
  children,
  title,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
  title: string;
}) => (
  <box
    border
    borderColor="#29455f"
    borderStyle="single"
    flexDirection="column"
    flexGrow={1}
    minHeight={4}
    overflow="hidden"
  >
    <box flexDirection="row" justifyContent="space-between" paddingX={1}>
      <text fg="#d7e7f5">
        <strong>{title}</strong>
      </text>
      {actions ? <box flexDirection="row" gap={1}>{actions}</box> : <box />}
    </box>
    <box marginX={1}>
      <text fg="#29455f">{"─".repeat(12)}</text>
    </box>
    <box flexDirection="column" flexGrow={1} minHeight={0} overflow="hidden" padding={1}>
      {children}
    </box>
  </box>
);

const Chip = ({
  active = false,
  content,
  onPress,
  tone = "normal",
}: {
  active?: boolean;
  content: string;
  onPress?: () => void;
  tone?: "muted" | "normal" | "success" | "warn";
}) => (
  <box
    backgroundColor={active ? "#14304b" : "#0d1d2d"}
    border
    borderColor={active ? "#5382a8" : "#243c52"}
    borderStyle="single"
    onMouseUp={onPress}
    paddingX={1}
  >
    <text
      fg={
        tone === "success"
          ? "#86efac"
          : tone === "warn"
            ? "#fdba74"
            : tone === "muted"
              ? "#8fa4ba"
              : "#d7e7f5"
      }
    >
      {content}
    </text>
  </box>
);

const ListRow = ({
  active,
  description,
  label,
  onPress,
  tone = "normal",
}: {
  active: boolean;
  description?: string;
  label: string;
  onPress?: () => void;
  tone?: "muted" | "normal" | "success" | "warn";
}) => (
  <box
    backgroundColor={active ? "#14304b" : "transparent"}
    flexDirection="column"
    onMouseUp={onPress}
    paddingX={1}
    width="100%"
  >
    <text
      fg={
        tone === "success"
          ? "#9df5bb"
          : tone === "warn"
            ? "#fdba74"
            : tone === "muted"
              ? "#98adc4"
              : active
                ? "#e5f3ff"
                : "#d7e7f5"
      }
    >
      {label}
    </text>
    {description ? <text fg="#7f96ad">{description}</text> : null}
  </box>
);

const EmptyState = ({ content }: { content: string }) => (
  <box paddingX={1}>
    <text fg="#7f96ad">{content}</text>
  </box>
);

const HelpDialog = ({
  dialogId,
  dismiss,
}: {
  dialogId: DialogId;
  dismiss: () => void;
}) => {
  useDialogKeyboard((event) => {
    if (
      event.eventType === "press" &&
      (event.name === "escape" ||
        event.name === "return" ||
        event.name === "enter" ||
        event.name === "q" ||
        event.name === "h")
    ) {
      dismiss();
    }
  }, dialogId);

  return (
    <box flexDirection="column" gap={1} padding={1}>
      <text fg="#e5f3ff">
        <strong>Volt UI Help</strong>
      </text>
      <text fg="#9db4ca">Up/Down move through projects or tasks.</text>
      <text fg="#9db4ca">Right or Enter enters a project. Enter runs a selected task.</text>
      <text fg="#9db4ca">Left, Escape, or Backspace goes back to the project list.</text>
      <text fg="#9db4ca">Ctrl+C copies the current output pane instead of quitting.</text>
      <text fg="#9db4ca">Press c twice quickly to copy output without leaving home row.</text>
      <text fg="#9db4ca">Press d for daemon details, r to refresh, q or Ctrl+Q to quit.</text>
      <box marginTop={1}>
        <Chip active content="Close" onPress={dismiss} />
      </box>
    </box>
  );
};

const DaemonStatusDialog = ({
  dialogId,
  dismiss,
}: {
  dialogId: DialogId;
  dismiss: () => void;
}) => {
  const service = useDashboardService();
  const state = useDashboardState().snapshot.state;
  const [selectedAction, setSelectedAction] = React.useState<"restart" | "stop" | "close">("restart");

  useDialogKeyboard((event) => {
    if (event.eventType !== "press") {
      return;
    }

    if (event.name === "left" || event.name === "h") {
      setSelectedAction((current) =>
        current === "close" ? "stop" : current === "stop" ? "restart" : "restart",
      );
      return;
    }

    if (event.name === "right" || event.name === "l" || event.name === "tab") {
      setSelectedAction((current) =>
        current === "restart" ? "stop" : current === "stop" ? "close" : "close",
      );
      return;
    }

    if (event.name === "escape" || event.name === "q") {
      dismiss();
      return;
    }

    if (event.name === "s") {
      void service.stopDaemon().finally(dismiss);
      return;
    }

    if (event.name === "r") {
      void service.restartDaemon().finally(dismiss);
      return;
    }

    if (event.name === "return" || event.name === "enter") {
      if (selectedAction === "restart") {
        void service.restartDaemon().finally(dismiss);
      } else if (selectedAction === "stop") {
        void service.stopDaemon().finally(dismiss);
      } else {
        dismiss();
      }
    }
  }, dialogId);

  return (
    <box flexDirection="column" gap={1} padding={1}>
      <text fg="#e5f3ff">
        <strong>Daemon Status</strong>
      </text>
      <text fg="#9db4ca">{`id: ${state?.id ?? "unknown"}`}</text>
      <text fg="#9db4ca">{`pid: ${state?.pid ?? "unknown"}`}</text>
      <text fg="#9db4ca">{`status: ${state?.status ?? "unknown"}`}</text>
      <text fg="#9db4ca">{`mode: ${state?.mode ?? "unknown"}`}</text>
      <text fg="#9db4ca">{`configs: ${state?.configs.length ?? 0}`}</text>
      <text fg="#9db4ca">{`workspace: ${state?.workspace?.name ?? "unknown"} (${state?.workspace?.id ?? "unknown"})`}</text>
      <text fg="#9db4ca">{`root: ${state?.workspace?.rootDir ?? "unknown"}`}</text>
      <text fg="#9db4ca">{`resources: ${state?.resources?.length ?? 0}`}</text>
      <text fg="#9db4ca">{`updated: ${state?.updatedAt ?? "unknown"}`}</text>
      {state?.reason ? <text fg="#fdba74">{`reason: ${state.reason}`}</text> : null}
      <box flexDirection="row" gap={1} marginTop={1}>
        <Chip
          active={selectedAction === "restart"}
          content="[r] restart"
          onPress={() => void service.restartDaemon().finally(dismiss)}
          tone="success"
        />
        <Chip
          active={selectedAction === "stop"}
          content="[s] stop"
          onPress={() => void service.stopDaemon().finally(dismiss)}
          tone="warn"
        />
        <Chip
          active={selectedAction === "close"}
          content="[esc] close"
          onPress={dismiss}
          tone="muted"
        />
      </box>
    </box>
  );
};

const DashboardBody = () => {
  const dialog = useDialog();
  const service = useDashboardService();
  const state = useDashboardState();
  const { height, width } = useTerminalDimensions();
  const {
    context,
    refreshMs,
    runs,
    selectedProjectIndex,
    selectedTaskIndex,
    snapshot,
    viewMode,
  } = state;

  const selectedProject = service.getSelectedProject();
  const selectedTaskNames = React.useMemo(
    () => (selectedProject ? Object.keys(selectedProject.project.tasks).sort((left, right) => left.localeCompare(right)) : []),
    [selectedProject],
  );
  const selectedTaskName =
    selectedTaskNames[clampIndex(selectedTaskIndex, selectedTaskNames.length)];
  const activeRun = runs[0];
  const daemonStatus = snapshot.state?.status ?? "unknown";
  const daemonResources = snapshot.state?.resources ?? [];
  const isNarrow = width < 96;
  const logPaneHeight = Math.max(8, Math.min(14, Math.floor(height * 0.34)));

  const openHelpDialog = React.useCallback(async () => {
    await dialog.alert({
      content: ({ dialogId, dismiss }: AlertContext) => (
        <HelpDialog dialogId={dialogId} dismiss={dismiss} />
      ),
      unstyled: true,
    });
  }, [dialog]);

  const openDaemonDialog = React.useCallback(async () => {
    await dialog.alert({
      content: ({ dialogId, dismiss }: AlertContext) => (
        <DaemonStatusDialog dialogId={dialogId} dismiss={dismiss} />
      ),
      unstyled: true,
    });
  }, [dialog]);

  useKeyboard((event) => {
    if (event.eventType !== "press") {
      return;
    }

    if (event.ctrl && event.name === "q") {
      service.quit();
      return;
    }

    if (event.ctrl && event.name === "c") {
      void service.copyCurrentOutput();
      return;
    }

    if (event.name === "q") {
      service.quit();
      return;
    }

    if (event.name === "r") {
      void service.refresh({ notify: true, silentInitial: false });
      toast.info("Refreshed Volt daemon state.");
      return;
    }

    if (event.name === "d") {
      void openDaemonDialog();
      return;
    }

    if (event.name === "?" || event.name === "h") {
      void openHelpDialog();
      return;
    }

    if (event.name === "c") {
      service.armCopyChordOrCopy();
      return;
    }

    if (event.name === "left" || event.name === "escape" || event.name === "backspace") {
      service.navigateBack();
      return;
    }

    if (event.name === "right") {
      if (viewMode === "projects") {
        service.showTasks();
      } else {
        void service.runSelectedTask();
      }
      return;
    }

    if (event.name === "enter" || event.name === "return") {
      void service.enter();
      return;
    }

    if (event.name === "up" || event.name === "k") {
      service.moveSelection(-1);
      return;
    }

    if (event.name === "down" || event.name === "j") {
      service.moveSelection(1);
    }
  });

  return (
    <box
      backgroundColor="#07111d"
      flexDirection="column"
      height="100%"
      overflow="hidden"
      padding={1}
      width="100%"
    >
      <Pane
        actions={
          <>
            <Chip
              content={`daemon ${daemonStatus}`}
              onPress={() => void openDaemonDialog()}
              tone={daemonStatus === "running" ? "success" : "warn"}
            />
            <Chip content={`projects ${context.projects.length}`} />
            <Chip content={`refresh ${refreshMs}ms`} tone="muted" />
            <Chip content={`view ${viewMode}`} tone="muted" />
          </>
        }
        title={context.workspace?.name ?? "Volt Project"}
      >
        <text fg="#8fa4ba">{truncate(context.workspaceRoot, Math.max(width - 12, 24))}</text>
      </Pane>

      <box
        flexDirection="column"
        flexGrow={1}
        gap={1}
        marginTop={1}
        minHeight={0}
        overflow="hidden"
      >
        <box
          flexDirection={isNarrow ? "column" : "row"}
          flexGrow={1}
          gap={1}
          minHeight={0}
          overflow="hidden"
        >
          <box
            flexDirection="column"
            flexGrow={isNarrow ? 1 : 0}
            minWidth={isNarrow ? undefined : 34}
            width={isNarrow ? "100%" : 40}
          >
            <Pane title={viewMode === "projects" ? "Projects" : "Tasks"}>
              {viewMode === "projects" ? (
                <scrollbox flexGrow={1}>
                  {context.projects.length ? (
                    context.projects.map((project, index) => (
                      <box key={project.configPath}>
                        <ListRow
                          active={index === clampIndex(selectedProjectIndex, context.projects.length)}
                          description={project.relativeRootDir}
                          label={project.alias}
                          onPress={() => {
                            service.selectProjectIndex(index);
                            service.showTasks();
                          }}
                        />
                      </box>
                    ))
                  ) : (
                    <EmptyState content="No Volt projects were found in this workspace." />
                  )}
                </scrollbox>
              ) : (
                <scrollbox flexGrow={1}>
                  {selectedTaskNames.length ? (
                    selectedTaskNames.map((taskName, index) => (
                      <box key={taskName}>
                        <ListRow
                          active={index === clampIndex(selectedTaskIndex, selectedTaskNames.length)}
                          label={taskName}
                          onPress={() => {
                            service.selectTaskIndex(index);
                            void service.runSelectedTask();
                          }}
                          tone={taskName.startsWith("dev:") ? "success" : "normal"}
                        />
                      </box>
                    ))
                  ) : (
                    <EmptyState content="The selected project does not define any Volt tasks." />
                  )}
                </scrollbox>
              )}
            </Pane>
          </box>

          <Pane
            actions={
              <>
                <Chip content="daemon" onPress={() => void openDaemonDialog()} tone="muted" />
                <Chip content="⧉ copy" onPress={() => void service.copyCurrentOutput()} tone="success" />
                <Chip content="? help" onPress={() => void openHelpDialog()} tone="muted" />
              </>
            }
            title="Details"
          >
            {selectedProject ? (
              <box flexDirection="column" gap={1}>
                <text fg="#e5f3ff">
                  <strong>{selectedProject.project.name}</strong>
                </text>
                <text fg="#8fa4ba">{`alias: ${selectedProject.alias}`}</text>
                <text fg="#8fa4ba">{`app: ${selectedProject.relativeRootDir}`}</text>
                <text fg="#8fa4ba">{`config: ${selectedProject.relativeConfigPath}`}</text>
                <text fg="#8fa4ba">
                  {`defaults: dev ${selectedProject.project.defaults.dev.join(", ") || "none"} | build ${selectedProject.project.defaults.build.join(", ") || "none"}`}
                </text>
                <text fg="#8fa4ba">{`workspace tasks: ${Object.keys(context.workspace?.tasks ?? {}).length}`}</text>
                <text fg="#8fa4ba">{`daemon id: ${snapshot.state?.id ?? "unknown"}`}</text>
                <text fg="#8fa4ba">{`daemon resources: ${daemonResources.length}`}</text>
                {viewMode === "tasks" && selectedTaskName ? (
                  <box marginTop={1}>
                    <Chip
                      content={`run ${selectedProject.alias} ${selectedTaskName}`}
                      onPress={() => void service.runSelectedTask()}
                      tone="success"
                    />
                  </box>
                ) : null}
                <text fg="#9db4ca">
                  {viewMode === "projects"
                    ? "Use Up/Down to choose a project, then Right or Enter to inspect its tasks."
                    : "Use Up/Down to choose a task, Enter to run it, and Left or Escape to return to projects."}
                </text>
                <box marginTop={1}>
                  <Chip
                    content={activeRun ? `latest ${activeRun.projectAlias} ${activeRun.status}` : "no task run yet"}
                    tone={
                      activeRun?.status === "failed"
                        ? "warn"
                        : activeRun?.status === "succeeded"
                          ? "success"
                          : "muted"
                    }
                  />
                </box>
                {daemonResources.length ? (
                  <scrollbox flexGrow={1} marginTop={1}>
                    {daemonResources.map((resource) => (
                      <box key={`${resource.kind}:${resource.label}`}>
                        <ListRow
                          active={false}
                          description={resource.status}
                          label={`${resource.kind} ${resource.label}`}
                          tone={resource.status === "running" ? "success" : "muted"}
                        />
                      </box>
                    ))}
                  </scrollbox>
                ) : null}
              </box>
            ) : (
              <EmptyState content="Open this UI in a Volt workspace or project directory." />
            )}
          </Pane>
        </box>

        <box height={logPaneHeight} minHeight={8}>
          <Pane
            actions={
              <Chip
                content={activeRun ? "copy [cc]" : "copy daemon"}
                onPress={() => void service.copyCurrentOutput()}
                tone="success"
              />
            }
            title={
              activeRun
                ? `Run Output :: ${activeRun.projectAlias} ${activeRun.taskName}`
                : "Daemon Output"
            }
          >
            {activeRun ? (
              <box flexDirection="column" height="100%">
                <text fg="#8fa4ba">{truncate(activeRun.command, Math.max(width - 16, 24))}</text>
                <scrollbox flexGrow={1} marginTop={1}>
                  {activeRun.logs.map((line, index) => (
                    <box key={`${activeRun.id}:${index}`}>
                      <ListRow
                        active={false}
                        label={truncate(line, Math.max(width - 18, 20))}
                        tone={
                          activeRun.status === "failed"
                            ? "warn"
                            : line.startsWith("$") || line.startsWith("[exit")
                              ? "muted"
                              : "normal"
                        }
                      />
                    </box>
                  ))}
                </scrollbox>
              </box>
            ) : snapshot.logLines.length ? (
              <scrollbox flexGrow={1}>
                {snapshot.logLines.slice(-maxRunLogs).map((line, index) => (
                  <box key={`daemon:${index}`}>
                    <ListRow
                      active={false}
                      label={truncate(line, Math.max(width - 18, 20))}
                      tone="muted"
                    />
                  </box>
                ))}
              </scrollbox>
            ) : (
              <EmptyState content="Run a task from the task list to stream its output here." />
            )}
          </Pane>
        </box>
      </box>

      <box marginTop={1}>
        <text fg="#8fa4ba">
          {context.projects.length > 1
            ? "Keys: Up/Down move, Right/Enter open or run, Left/Escape back, d daemon, Ctrl+C or cc copy, h help, q quit"
            : "Keys: Up/Down move, Enter run, d daemon, Ctrl+C or cc copy, h help, q quit"}
        </text>
      </box>
    </box>
  );
};

const DashboardScreen = ({ environment }: { environment: DashboardEnvironment }) => {
  const renderer = useRenderer();
  const service = React.useMemo(
    () =>
      createDashboardService(environment, {
        copyToClipboard: copyTextToClipboard,
        notify: (tone, message) => {
          if (tone === "error") {
            toast.error(message);
          } else if (tone === "success") {
            toast.success(message);
          } else if (tone === "warning") {
            toast.warning(message);
          } else {
            toast.info(message);
          }
        },
        quit: () => renderer.destroy(),
      }),
    [environment, renderer],
  );

  React.useEffect(() => {
    void service.refresh({ notify: true });
    const timer = setInterval(() => {
      void service.refresh({ notify: true });
    }, environment.refreshMs);

    return () => {
      clearInterval(timer);
    };
  }, [environment.refreshMs, service]);

  return (
    <DashboardProvider service={service}>
      <DialogProvider
        backdropOpacity={0.35}
        closeOnEscape
        dialogOptions={{
          style: {
            backgroundColor: "#0d1d2d",
            border: true,
            borderColor: "#29455f",
          },
        }}
        size="medium"
      >
        <Toaster position="bottom-right" stackingMode="stack" visibleToasts={3} />
        <DashboardBody />
      </DialogProvider>
    </DashboardProvider>
  );
};

export const runVoltDashboard = async (
  startDir = process.cwd(),
  cliScriptPath = resolve(import.meta.dir, "cli.ts"),
) => {
  ensureRendererCompatibility();

  const context = await resolveVoltWorkspaceContext({
    command: "dev",
    cwd: startDir,
    mode: "development",
  });
  const daemonDir = resolve(context.workspaceRoot, ".volt", "daemon");
  const environment: DashboardEnvironment = {
    cliScriptPath,
    context,
    logPath: resolve(daemonDir, "workspace.log"),
    mode: "development",
    refreshMs: 750,
    statePath: resolve(daemonDir, "workspace.json"),
  };

  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
  });
  const root = createRoot(renderer);
  root.render(<DashboardScreen environment={environment} />);
};

if (import.meta.main) {
  await runVoltDashboard(process.cwd());
}
