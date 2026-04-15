import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createStateStore, type StateStore } from "@loop-kit/state";
import { listProjectTasks } from "../task";
import type { LoadedWorkspaceProject } from "../workspace-runtime";
import {
  clampIndex,
  copyChordMs,
  launchTaskLabel,
  maxRunLogs,
  now,
  type DashboardEnvironment,
  type DashboardSnapshot,
  type DashboardStoreState,
} from "./dashboard-model";

type DashboardToastTone = "error" | "info" | "success" | "warning";

interface DashboardEffects {
  copyToClipboard: (text: string) => Promise<void>;
  notify: (tone: DashboardToastTone, message: string) => void;
  quit: () => void;
}

export interface DashboardService {
  armCopyChordOrCopy: () => void;
  copyCurrentOutput: () => Promise<void>;
  enter: () => Promise<void>;
  getSelectedProject: () => LoadedWorkspaceProject | undefined;
  getSelectedTaskName: () => string | undefined;
  moveSelection: (direction: -1 | 1) => void;
  navigateBack: () => void;
  quit: () => void;
  refresh: (options?: { notify?: boolean; silentInitial?: boolean }) => Promise<void>;
  restartDaemon: () => Promise<void>;
  runSelectedTask: () => Promise<void>;
  selectProjectIndex: (index: number) => void;
  selectTaskIndex: (index: number) => void;
  showTasks: () => void;
  stopDaemon: () => Promise<void>;
  store: StateStore<DashboardStoreState>;
}

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

const readDashboardSnapshot = async (
  statePath: string,
  logPath: string,
): Promise<DashboardSnapshot> => ({
  logLines: await readLogLines(logPath),
  state: await readJson(statePath),
});

const readProcessStream = async (stream: ReadableStream<Uint8Array> | undefined) => {
  if (!stream) {
    return "";
  }

  return new Response(stream).text();
};

const initialProjectIndex = (environment: DashboardEnvironment) =>
  clampIndex(
    environment.context.projects.findIndex(
      (project) => project.configPath === environment.context.currentProject?.configPath,
    ),
    environment.context.projects.length,
  );

const createInitialState = (environment: DashboardEnvironment): DashboardStoreState => ({
  context: environment.context,
  copyArmedAt: 0,
  refreshMs: environment.refreshMs,
  runs: [],
  selectedProjectIndex: initialProjectIndex(environment),
  selectedTaskIndex: 0,
  snapshot: {
    logLines: [],
    state: undefined,
  },
  viewMode: environment.context.currentProject ? "tasks" : "projects",
});

export const createDashboardService = (
  environment: DashboardEnvironment,
  effects: DashboardEffects,
): DashboardService => {
  const store = createStateStore(createInitialState(environment), { maxHistory: 0 });
  let hasRefreshedOnce = false;

  const getSelectedProject = () => {
    const state = store.getState();
    const projects = state.context.projects;
    return projects[clampIndex(state.selectedProjectIndex, projects.length)];
  };

  const getSelectedTaskNames = () => {
    const project = getSelectedProject();
    return project ? listProjectTasks(project.project) : [];
  };

  const getSelectedTaskName = () => {
    const taskNames = getSelectedTaskNames();
    return taskNames[clampIndex(store.getState().selectedTaskIndex, taskNames.length)];
  };

  const getOutputToCopy = () => {
    const state = store.getState();
    const activeRun = state.runs[0];
    return activeRun ? activeRun.logs.join("\n") : state.snapshot.logLines.join("\n");
  };

  const setSnapshot = (
    snapshot: DashboardSnapshot,
    options?: { notify?: boolean; silentInitial?: boolean },
  ) => {
    const previous = store.getState().snapshot.state;
    store.setState(
      (state) => ({
        ...state,
        snapshot,
      }),
      { history: false },
    );

    const next = snapshot.state;
    if (!options?.notify) {
      return;
    }

    if (!hasRefreshedOnce && options?.silentInitial !== false) {
      hasRefreshedOnce = true;
      return;
    }

    hasRefreshedOnce = true;

    if (next?.id && previous?.id && next.id !== previous.id) {
      effects.notify("info", `Connected to daemon ${next.id}.`);
      return;
    }

    if (next?.status && previous?.status && next.status !== previous.status) {
      effects.notify(
        next.status === "running" ? "success" : next.status === "stopped" ? "warning" : "info",
        next.id ? `Daemon ${next.status}: ${next.id}` : `Daemon ${next.status}.`,
      );
    }
  };

  const runVoltCli = async (args: string[]) => {
    const child = Bun.spawn({
      cmd: [process.execPath, environment.cliScriptPath, ...args],
      cwd: environment.context.workspaceRoot,
      env: process.env,
      stderr: "pipe",
      stdin: "ignore",
      stdout: "pipe",
    });

    const [stdout, stderr, exitCode] = await Promise.all([
      readProcessStream(child.stdout),
      readProcessStream(child.stderr),
      child.exited,
    ]);

    return {
      exitCode,
      stderr: stderr.trim(),
      stdout: stdout.trim(),
    };
  };

  const appendRunLog = (runId: string, line: string) => {
    if (!line) {
      return;
    }

    store.setState(
      (state) => ({
        ...state,
        runs: state.runs.map((run) =>
          run.id !== runId
            ? run
            : {
                ...run,
                logs: [...run.logs, line].slice(-maxRunLogs),
              },
        ),
      }),
      { history: false },
    );
  };

  const refresh: DashboardService["refresh"] = async (options) => {
    const snapshot = await readDashboardSnapshot(environment.statePath, environment.logPath);
    setSnapshot(snapshot, options);
  };

  const copyCurrentOutput: DashboardService["copyCurrentOutput"] = async () => {
    const output = getOutputToCopy();
    if (!output.trim()) {
      effects.notify("warning", "No output is available to copy yet.");
      return;
    }

    try {
      await effects.copyToClipboard(output);
      effects.notify(
        store.getState().runs[0] ? "success" : "info",
        store.getState().runs[0]
          ? "Run output copied to clipboard."
          : "Daemon output copied to clipboard.",
      );
    } catch (error) {
      effects.notify(
        "error",
        error instanceof Error ? error.message : "Failed to copy output to the clipboard.",
      );
    }
  };

  const moveSelection: DashboardService["moveSelection"] = (direction) => {
    store.setState(
      (state) => {
        if (state.viewMode === "projects") {
          return {
            ...state,
            selectedProjectIndex: clampIndex(
              state.selectedProjectIndex + direction,
              state.context.projects.length,
            ),
          };
        }

        return {
          ...state,
          selectedTaskIndex: clampIndex(
            state.selectedTaskIndex + direction,
            getSelectedTaskNames().length,
          ),
        };
      },
      { history: false },
    );
  };

  const showTasks = () => {
    if (!getSelectedProject()) {
      return;
    }

    store.setState(
      (state) => ({
        ...state,
        selectedTaskIndex: 0,
        viewMode: "tasks",
      }),
      { history: false },
    );
  };

  const navigateBack = () => {
    store.setState(
      (state) =>
        state.viewMode === "tasks" && state.context.projects.length > 1
          ? {
              ...state,
              viewMode: "projects",
            }
          : state,
      { history: false },
    );
  };

  const runSelectedTask: DashboardService["runSelectedTask"] = async () => {
    const project = getSelectedProject();
    const taskName = getSelectedTaskName();
    if (!project || !taskName) {
      return;
    }

    const command = launchTaskLabel(project, taskName);
    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const child = Bun.spawn({
      cmd: [process.execPath, environment.cliScriptPath, "task", "run", project.alias, taskName],
      cwd: environment.context.workspaceRoot,
      env: process.env,
      stderr: "pipe",
      stdin: "ignore",
      stdout: "pipe",
    });

    store.setState(
      (state) => ({
        ...state,
        runs: [
          {
            command,
            cwd: environment.context.workspaceRoot,
            id: runId,
            logs: [`$ ${command}`],
            projectAlias: project.alias,
            startedAt: now(),
            status: "running",
            taskName,
          },
          ...state.runs,
        ],
      }),
      { history: false },
    );
    effects.notify("info", `Running ${project.alias} ${taskName}`);

    const pipe = async (stream: ReadableStream<Uint8Array> | undefined) => {
      if (!stream) {
        return;
      }

      const reader = stream.getReader();
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
          appendRunLog(runId, line);
        }
      }

      if (pending.trim()) {
        appendRunLog(runId, pending);
      }
    };

    void pipe(child.stdout);
    void pipe(child.stderr);

    void child.exited.then((code) => {
      store.setState(
        (state) => ({
          ...state,
          runs: state.runs.map((run) =>
            run.id !== runId
              ? run
              : {
                  ...run,
                  exitCode: code,
                  logs: [...run.logs, `[exit ${code}]`].slice(-maxRunLogs),
                  status: code === 0 ? "succeeded" : "failed",
                },
          ),
        }),
        { history: false },
      );

      effects.notify(
        code === 0 ? "success" : "error",
        code === 0
          ? `${project.alias} ${taskName} exited cleanly.`
          : `${project.alias} ${taskName} exited with code ${code}.`,
      );
    });
  };

  const enter: DashboardService["enter"] = async () => {
    if (store.getState().viewMode === "projects") {
      showTasks();
      return;
    }

    await runSelectedTask();
  };

  const armCopyChordOrCopy = () => {
    const current = Date.now();
    const armedAt = store.getState().copyArmedAt;
    if (current - armedAt <= copyChordMs) {
      store.setState(
        (state) => ({
          ...state,
          copyArmedAt: 0,
        }),
        { history: false },
      );
      void copyCurrentOutput();
      return;
    }

    store.setState(
      (state) => ({
        ...state,
        copyArmedAt: current,
      }),
      { history: false },
    );
    effects.notify("info", "Press c again to copy the current output.");
  };

  const stopDaemon: DashboardService["stopDaemon"] = async () => {
    const result = await runVoltCli(["daemon", "stop"]);
    if (result.exitCode !== 0) {
      effects.notify("error", result.stderr || `Failed to stop daemon (exit ${result.exitCode}).`);
      return;
    }

    effects.notify("warning", "Stopping Volt daemon.");
    await refresh({ notify: true, silentInitial: false });
  };

  const restartDaemon: DashboardService["restartDaemon"] = async () => {
    const stopResult = await runVoltCli(["daemon", "stop"]);
    if (stopResult.exitCode !== 0 && stopResult.stderr) {
      effects.notify("warning", stopResult.stderr);
    }

    const startResult = await runVoltCli(["daemon", "start", "--mode", environment.mode]);
    if (startResult.exitCode !== 0) {
      effects.notify("error", startResult.stderr || `Failed to restart daemon (exit ${startResult.exitCode}).`);
      return;
    }

    effects.notify("success", "Restarted Volt daemon.");
    await refresh({ notify: true, silentInitial: false });
  };

  const selectProjectIndex = (index: number) => {
    store.setState(
      (state) => ({
        ...state,
        selectedProjectIndex: clampIndex(index, state.context.projects.length),
        selectedTaskIndex: 0,
      }),
      { history: false },
    );
  };

  const selectTaskIndex = (index: number) => {
    store.setState(
      (state) => ({
        ...state,
        selectedTaskIndex: clampIndex(index, getSelectedTaskNames().length),
      }),
      { history: false },
    );
  };

  return {
    armCopyChordOrCopy,
    copyCurrentOutput,
    enter,
    getSelectedProject,
    getSelectedTaskName,
    moveSelection,
    navigateBack,
    quit: effects.quit,
    refresh,
    restartDaemon,
    runSelectedTask,
    selectProjectIndex,
    selectTaskIndex,
    showTasks,
    stopDaemon,
    store,
  };
};
