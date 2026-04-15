import { setTimeout as delay } from "node:timers/promises";
import { Socket } from "node:net";
import type {
  ManagedVoltProcess,
  ProcessHandle,
  ResourceHandle,
  VoltHandleStatus,
  VoltLogEntry,
  VoltLogger,
  VoltProcessMetadata,
  VoltReadinessProbe,
  VoltRuntimeEvent,
  VoltRuntimeOwner,
  VoltSpawnOptions,
} from "./contracts";
import { mergeEnv } from "./utils";

export interface VoltManagedProcessOptions extends VoltSpawnOptions {
  logger?: VoltLogger;
  rootDir: string;
}

interface ResourceHandleOptions {
  initialStatus?: VoltHandleStatus;
  label: string;
  logger?: VoltLogger;
  owner?: VoltRuntimeOwner;
  stop?: () => Promise<void> | void;
  wait?: () => Promise<unknown>;
}

const now = () => new Date().toISOString();

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const normalizeProbeList = (
  readiness: VoltReadinessProbe | VoltReadinessProbe[] | undefined,
) => (readiness ? (Array.isArray(readiness) ? readiness : [readiness]) : []);

const createDeferred = <TValue>() => {
  let resolve!: (value: TValue | PromiseLike<TValue>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<TValue>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });
  return { promise, reject, resolve };
};

const createEventStore = (label: string, owner?: VoltRuntimeOwner) => {
  const events: VoltRuntimeEvent[] = [];
  const logs: VoltLogEntry[] = [];

  const emit = (event: Omit<VoltRuntimeEvent, "at">) => {
    const emitted = { ...event, at: now() };
    events.push(emitted);
    owner?.emit(emitted);
    return emitted;
  };

  const pushLog = (stream: "stderr" | "stdout", line: string) => {
    const entry = { at: now(), label, line, stream };
    logs.push(entry);
    emit({
      label,
      message: line,
      scope: "process",
      stream,
      type: "log",
    });
    return entry;
  };

  return {
    emit,
    events: () => [...events],
    logs: () => [...logs],
    pushLog,
  };
};

const createResourceHandleBase = ({
  initialStatus = "idle",
  label,
  owner,
  stop,
  wait,
}: ResourceHandleOptions) => {
  let currentStatus = initialStatus;
  const store = createEventStore(label, owner);

  const setStatus = (
    status: VoltHandleStatus,
    type: VoltRuntimeEvent["type"] = "status",
    data?: Record<string, unknown>,
  ) => {
    currentStatus = status;
    store.emit({
      data,
      label,
      scope: "runtime",
      status,
      type,
    });
  };

  const handle: ResourceHandle = {
    events: store.events,
    label,
    logs: store.logs,
    status: () => currentStatus,
    stop: async () => {
      setStatus("stopping", "handle-stop");
      await stop?.();
      setStatus("stopped", "handle-stop");
    },
    wait: async () => wait?.(),
  };

  return {
    handle,
    setStatus,
    store,
  };
};

export const createRuntimeOwner = (
  label: string,
  logger?: VoltLogger,
): VoltRuntimeOwner => {
  const handles: ResourceHandle[] = [];
  const events: VoltRuntimeEvent[] = [];

  const emit = (event: Omit<VoltRuntimeEvent, "at">) => {
    const emitted = { ...event, at: now() };
    events.push(emitted);
    if (event.type === "handle-stop" || event.status === "failed") {
      logger?.warn(`owner event: ${event.label}`, {
        scope: event.scope,
        status: event.status,
        type: event.type,
      });
    }
  };

  const release = async (handle: ResourceHandle) => {
    await handle.stop();
  };

  return {
    add: (handle) => {
      if (!handles.includes(handle)) {
        handles.push(handle);
      }
      emit({
        label: handle.label,
        scope: "runtime",
        status: handle.status(),
        type: "handle-start",
      });
      return handle;
    },
    emit,
    events: () => [...events],
    release,
    releaseAll: async () => {
      for (const handle of [...handles].reverse()) {
        await release(handle);
      }
      handles.splice(0, handles.length);
    },
    snapshot: () => ({
      activeLabels: handles
        .filter((handle) => {
          const status = handle.status();
          return status !== "stopped" && status !== "failed";
        })
        .map((handle) => handle.label),
      label,
    }),
  };
};

export const createResourceHandle = ({
  initialStatus,
  label,
  logger,
  owner,
  stop,
  wait,
}: ResourceHandleOptions): ResourceHandle => {
  const base = createResourceHandleBase({
    initialStatus,
    label,
    owner,
    stop,
    wait,
  });
  if (logger) {
    base.store.emit({
      label,
      message: "resource created",
      scope: "runtime",
      status: initialStatus ?? "idle",
      type: "status",
    });
  }
  return owner?.add(base.handle) ?? base.handle;
};

const waitForPort = async (
  host: string,
  port: number,
  timeoutMs: number,
) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const isOpen = await new Promise<boolean>((resolve) => {
      const socket = new Socket();
      socket
        .once("connect", () => {
          socket.destroy();
          resolve(true);
        })
        .once("error", () => {
          socket.destroy();
          resolve(false);
        })
        .connect(port, host);
    });
    if (isOpen) {
      return;
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for port ${host}:${port}.`);
};

const waitForHttp = async (url: string, timeoutMs: number) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {}
    await delay(150);
  }
  throw new Error(`Timed out waiting for HTTP readiness at ${url}.`);
};

const waitForStdoutMatch = async (
  handle: ProcessHandle,
  pattern: RegExp | string,
  stream: "stderr" | "stdout",
  timeoutMs: number,
) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const found = handle
      .logs()
      .filter((entry) => entry.stream === stream)
      .some((entry) =>
        typeof pattern === "string"
          ? entry.line.includes(pattern)
          : pattern.test(entry.line),
      );
    if (found) {
      return;
    }
    await delay(50);
  }
  throw new Error(`Timed out waiting for ${stream} readiness on ${handle.label}.`);
};

const waitForPredicate = async (
  handle: ProcessHandle,
  run: (handle: ProcessHandle) => Promise<boolean> | boolean,
  timeoutMs: number,
) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await run(handle)) {
      return;
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for predicate readiness on ${handle.label}.`);
};

export const waitForProcessReadiness = async (
  handle: ProcessHandle,
  readiness: VoltReadinessProbe | VoltReadinessProbe[] | undefined,
) => {
  for (const probe of normalizeProbeList(readiness)) {
    switch (probe.kind) {
      case "delay":
        await delay(probe.ms);
        break;
      case "http":
        await waitForHttp(probe.url, probe.timeoutMs ?? 10_000);
        break;
      case "port":
        await waitForPort(probe.host ?? "127.0.0.1", probe.port, probe.timeoutMs ?? 10_000);
        break;
      case "predicate":
        await waitForPredicate(handle, probe.run, probe.timeoutMs ?? 10_000);
        break;
      case "stdout":
        await waitForStdoutMatch(
          handle,
          probe.pattern,
          probe.stream ?? "stdout",
          probe.timeoutMs ?? 10_000,
        );
        break;
    }
  }
};

const streamToLogs = async (
  label: string,
  stream: "stderr" | "stdout",
  input: ReadableStream<Uint8Array> | undefined,
  pushLog: (stream: "stderr" | "stdout", line: string) => void,
  forwardOutput: boolean,
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
      pushLog(stream, line);
      if (forwardOutput) {
        const formatted = `[volt:${label}] ${line}`;
        if (stream === "stderr") {
          console.error(formatted);
        } else {
          console.log(formatted);
        }
      }
    }
  }
  if (pending) {
    pushLog(stream, pending);
    if (forwardOutput) {
      const formatted = `[volt:${label}] ${pending}`;
      if (stream === "stderr") {
        console.error(formatted);
      } else {
        console.log(formatted);
      }
    }
  }
};

export const startManagedProcess = (
  label: string,
  cmd: string[],
  options: VoltManagedProcessOptions,
): ManagedVoltProcess => {
  const cwd = options.cwd ?? options.rootDir;
  const metadata: VoltProcessMetadata = {
    cmd,
    cwd,
    pid: undefined,
    startedAt: now(),
  };
  const base = createResourceHandleBase({
    initialStatus: "starting",
    label,
    owner: options.owner,
  });
  const forwardOutput = options.forwardOutput ?? true;
  const processRef = Bun.spawn({
    cmd,
    cwd,
    env: mergeEnv(process.env, options.env),
    stderr: "pipe",
    stdin: "ignore",
    stdout: "pipe",
  });
  metadata.pid = processRef.pid;
  options.logger?.info("spawning process", { cmd, cwd, label, pid: processRef.pid });
  base.store.emit({
    data: { cmd, cwd, pid: processRef.pid },
    label,
    scope: "process",
    status: "starting",
    type: "handle-start",
  });

  void streamToLogs(
    label,
    "stdout",
    processRef.stdout,
    base.store.pushLog,
    forwardOutput,
  );
  void streamToLogs(
    label,
    "stderr",
    processRef.stderr,
    base.store.pushLog,
    forwardOutput,
  );

  const stopProcess = async (signal?: number | NodeJS.Signals) => {
    if (base.handle.status() === "stopped") {
      return;
    }
    base.setStatus("stopping", "handle-stop");
    try {
      processRef.kill(signal);
    } catch {}
    await Promise.race([processRef.exited, delay(1_000)]);
    if (base.handle.status() !== "stopped") {
      try {
        processRef.kill("SIGKILL");
      } catch {}
    }
  };

  const exited = processRef.exited.then((code) => {
    metadata.exitCode = code;
    metadata.stoppedAt = now();
    if (code === 0) {
      base.setStatus("stopped", "handle-stop", { code });
    } else {
      base.setStatus("failed", "handle-stop", { code });
    }
    return code;
  });

  const handle = {
    ...base.handle,
    kill: async (signal?: number | NodeJS.Signals) => {
      await stopProcess(signal);
    },
    metadata: () => ({ ...metadata }),
    process: processRef,
    ready: Promise.resolve(),
    stderr: processRef.stderr,
    stdout: processRef.stdout,
    stop: async () => {
      await stopProcess("SIGTERM");
    },
    wait: async () => exited,
  } satisfies ProcessHandle;

  const ready = waitForProcessReadiness(handle, options.readiness)
    .then(() => {
      base.setStatus("ready", "handle-ready");
      return undefined;
    })
    .catch((error) => {
      base.setStatus("failed", "readiness", { error: toErrorMessage(error) });
      throw error;
    });
  handle.ready = ready;

  if (options.timeoutMs) {
    void delay(options.timeoutMs, undefined, { signal: options.signal })
      .then(async () => {
        await stopProcess("SIGTERM");
      })
      .catch(() => undefined);
  }

  if (options.signal) {
    options.signal.addEventListener(
      "abort",
      () => {
        void stopProcess("SIGTERM");
      },
      { once: true },
    );
  }

  base.setStatus("running", "status", { pid: processRef.pid });
  return options.owner?.add(handle) ?? handle;
};

export const managedProcess = startManagedProcess;

export const stopManagedProcess = async (processRef: ManagedVoltProcess) => {
  await processRef.stop();
};

export const waitForManagedProcess = async (
  processRef: ManagedVoltProcess,
  failureLabel = processRef.label,
) => {
  processRef.events();
  const code = (await processRef.wait()) as number;
  if (code !== 0) {
    throw new Error(`${failureLabel} exited with code ${code}.`);
  }
};

export const waitForManagedProcesses = async (
  processes: ManagedVoltProcess[],
) => {
  if (!processes.length) {
    return;
  }

  const owner = createRuntimeOwner("wait-for-managed-processes");
  for (const processRef of processes) {
    owner.add(processRef);
  }

  const onSignal = () => {
    void owner.releaseAll();
  };

  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  const firstExit = await Promise.race(
    processes.map(async (processRef) => ({
      code: (await processRef.wait()) as number,
      label: processRef.label,
    })),
  );

  await owner.releaseAll();
  if (firstExit.code !== 0) {
    throw new Error(`${firstExit.label} exited with code ${firstExit.code}.`);
  }
};
