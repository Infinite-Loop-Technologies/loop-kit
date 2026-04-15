import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { type MaybeAsync } from "@loop-kit/common";
import type { ResourceHandle, VoltCommand, VoltLogger } from "./contracts";
import { createRuntimeOwner } from "./process";
import { writeJsonFile } from "./utils";

interface VoltFlowStepState {
  readonly error?: string;
  readonly status: "error" | "success";
  readonly value?: unknown;
}

interface VoltFlowRunState<TOutput = unknown> {
  completed?: boolean;
  output?: TOutput;
  steps: Record<string, VoltFlowStepState>;
}

export interface VoltFlowForkHandle<TValue = unknown> {
  readonly cancel: () => Promise<void>;
  readonly label: string;
  readonly promise: Promise<TValue>;
  readonly release: () => Promise<void>;
  readonly status: () => "cancelled" | "completed" | "failed" | "running";
}

export interface VoltFlowContext {
  readonly all: <TValue>(
    name: string,
    handles: ReadonlyArray<VoltFlowForkHandle<TValue>>,
  ) => Promise<ReadonlyArray<TValue>>;
  readonly fork: <TValue>(
    name: string,
    run: (signal: AbortSignal) => MaybeAsync<TValue>,
  ) => Promise<VoltFlowForkHandle<TValue>>;
  readonly forkProjectTask: <TValue = unknown>(
    project: string,
    task: string,
    options?: { inputs?: unknown },
  ) => Promise<VoltFlowForkHandle<TValue>>;
  readonly forkTask: <TValue = unknown>(
    name: string,
    options?: { inputs?: unknown },
  ) => Promise<VoltFlowForkHandle<TValue>>;
  readonly join: <TValue>(handle: VoltFlowForkHandle<TValue>) => Promise<TValue>;
  readonly log: (
    name: string,
    message: string,
    data?: Record<string, unknown>,
    level?: "error" | "info" | "warn",
  ) => Promise<void>;
  readonly memo: <TValue>(
    name: string,
    run: () => MaybeAsync<TValue>,
  ) => Promise<TValue>;
  readonly race: <TValue>(
    name: string,
    handles: ReadonlyArray<VoltFlowForkHandle<TValue>>,
  ) => Promise<TValue>;
  readonly release: (
    name: string,
    handle: ResourceHandle | VoltFlowForkHandle,
  ) => Promise<void>;
  readonly runProjectTask: <TValue = unknown>(
    project: string,
    task: string,
    options?: { inputs?: unknown },
  ) => Promise<TValue>;
  readonly runTask: <TValue = unknown>(
    name: string,
    options?: { inputs?: unknown },
  ) => Promise<TValue>;
  readonly sleep: (name: string, ms: number) => Promise<void>;
  readonly step: <TValue>(
    name: string,
    run: () => MaybeAsync<TValue>,
  ) => Promise<TValue>;
  readonly waitFor: <TValue = unknown>(
    name: string,
    subject: (() => MaybeAsync<boolean>) | ResourceHandle | VoltFlowForkHandle<TValue>,
    options?: { timeoutMs?: number },
  ) => Promise<void>;
}

export interface VoltFlowDefinition<TInputs = unknown, TOutput = unknown> {
  readonly kind: "flow-definition";
  readonly name: string;
  readonly run: (context: VoltFlowContext, inputs: TInputs) => MaybeAsync<TOutput>;
}

export interface VoltFlowTaskDefinition<TInputs = unknown, TOutput = unknown> {
  readonly command?: VoltCommand;
  readonly dependsOn?: string[];
  readonly inputs?: string[];
  readonly kind: "flow-task";
  readonly outputs?: string[];
  readonly persist?: boolean | string;
  readonly value: VoltFlowDefinition<TInputs, TOutput>;
  readonly watch?: string[];
}

export interface VoltFlowRunner {
  readonly runProjectTask: (
    project: string,
    task: string,
    options?: { inputs?: unknown },
  ) => Promise<unknown>;
  readonly runTask: (name: string, options?: { inputs?: unknown }) => Promise<unknown>;
}

export interface VoltFlowRunOptions {
  readonly logger?: VoltLogger;
  readonly runner: VoltFlowRunner;
  readonly statePath?: string;
}

const delay = (ms: number) =>
  new Promise<void>((resolveDelay) => setTimeout(resolveDelay, ms));

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const isResourceHandle = (value: unknown): value is ResourceHandle =>
  typeof value === "object" &&
  value !== null &&
  "stop" in value &&
  "wait" in value &&
  "status" in value;

const isProcessLike = (value: ResourceHandle): value is ResourceHandle & { ready: Promise<void> } =>
  "ready" in value;

const isForkHandle = (value: unknown): value is VoltFlowForkHandle =>
  typeof value === "object" &&
  value !== null &&
  "cancel" in value &&
  "promise" in value &&
  "release" in value;

const readState = async <TOutput>(
  statePath?: string,
): Promise<VoltFlowRunState<TOutput>> => {
  if (!statePath || !existsSync(statePath)) {
    return { steps: {} };
  }

  return JSON.parse(await readFile(statePath, "utf8")) as VoltFlowRunState<TOutput>;
};

const writeState = async <TOutput>(
  statePath: string | undefined,
  state: VoltFlowRunState<TOutput>,
) => {
  if (!statePath) {
    return;
  }

  await writeJsonFile(statePath, state);
};

const waitForCondition = async (
  subject: (() => MaybeAsync<boolean>) | ResourceHandle | VoltFlowForkHandle,
  timeoutMs?: number,
) => {
  const startedAt = Date.now();

  while (true) {
    if (typeof subject === "function") {
      if (await subject()) {
        return;
      }
    } else if (isForkHandle(subject)) {
      await subject.promise;
      return;
    } else {
      if (isProcessLike(subject)) {
        await subject.ready;
      } else {
        await subject.wait();
      }
      return;
    }

    if (timeoutMs && Date.now() - startedAt > timeoutMs) {
      throw new Error("Flow waitFor timed out.");
    }

    await delay(100);
  }
};

export const defineFlowDefinition = <TInputs = unknown, TOutput = unknown>(
  name: string,
  run: VoltFlowDefinition<TInputs, TOutput>["run"],
): VoltFlowDefinition<TInputs, TOutput> => ({
  kind: "flow-definition",
  name,
  run,
});

export const flow = <TInputs = unknown, TOutput = unknown>(
  name: string,
  run: VoltFlowDefinition<TInputs, TOutput>["run"],
  options: Omit<VoltFlowTaskDefinition<TInputs, TOutput>, "kind" | "value"> = {},
): VoltFlowTaskDefinition<TInputs, TOutput> => ({
  ...options,
  kind: "flow-task",
  value: defineFlowDefinition(name, run),
});

export const runFlow = async <TInputs, TOutput>(
  definition: VoltFlowDefinition<TInputs, TOutput>,
  inputs: TInputs,
  options: VoltFlowRunOptions,
): Promise<TOutput> => {
  const state = await readState<TOutput>(options.statePath);
  if (state.completed) {
    return state.output as TOutput;
  }

  const owner = createRuntimeOwner(`flow:${definition.name}`, options.logger);
  const forkHandles: VoltFlowForkHandle[] = [];

  const step = async <TValue>(
    name: string,
    run: () => MaybeAsync<TValue>,
    persist: boolean,
  ): Promise<TValue> => {
    const memoized = state.steps[name];
    if (persist && memoized?.status === "success") {
      return memoized.value as TValue;
    }

    if (persist && memoized?.status === "error") {
      throw new Error(memoized.error ?? `Flow step failed: ${name}`);
    }

    try {
      const value = await run();
      if (persist) {
        state.steps[name] = {
          status: "success",
          value,
        };
        await writeState(options.statePath, state);
      }
      return value;
    } catch (error) {
      if (persist) {
        state.steps[name] = {
          error: toErrorMessage(error),
          status: "error",
        };
        await writeState(options.statePath, state);
      }
      throw error;
    }
  };

  const createForkHandle = async <TValue>(
    name: string,
    run: (signal: AbortSignal) => MaybeAsync<TValue>,
  ): Promise<VoltFlowForkHandle<TValue>> => {
    options.logger?.info("flow fork", {
      flow: definition.name,
      step: name,
    });

    const controller = new AbortController();
    let currentStatus: ReturnType<VoltFlowForkHandle["status"]> = "running";
    let resolvedResource: ResourceHandle | undefined;

    const promise = Promise.resolve(run(controller.signal))
      .then((result) => {
        if (isResourceHandle(result)) {
          resolvedResource = owner.add(result);
        }
        currentStatus = "completed";
        return result;
      })
      .catch((error) => {
        currentStatus = controller.signal.aborted ? "cancelled" : "failed";
        throw error;
      });

    const handle: VoltFlowForkHandle<TValue> = {
      cancel: async () => {
        controller.abort();
        if (resolvedResource) {
          await owner.release(resolvedResource);
        }
        currentStatus = "cancelled";
      },
      label: name,
      promise,
      release: async () => {
        if (resolvedResource) {
          await owner.release(resolvedResource);
        }
      },
      status: () => currentStatus,
    };

    forkHandles.push(handle);
    return handle;
  };

  const context: VoltFlowContext = {
    all: async (_name, handles) => Promise.all(handles.map((handle) => handle.promise)),
    fork: async (name, run) => createForkHandle(name, run),
    forkProjectTask: async (project, task, flowOptions) =>
      createForkHandle(`${project}:${task}`, () =>
        options.runner.runProjectTask(project, task, flowOptions) as Promise<any>,
      ) as Promise<VoltFlowForkHandle<any>>,
    forkTask: async (name, flowOptions) =>
      createForkHandle(name, () =>
        options.runner.runTask(name, flowOptions) as Promise<any>,
      ) as Promise<VoltFlowForkHandle<any>>,
    join: async (handle) => handle.promise,
    log: async (name, message, data, level = "info") => {
      options.logger?.[level](message, {
        flow: definition.name,
        step: name,
        ...data,
      });
    },
    memo: async (name, run) =>
      step(name, async () => await run(), true),
    race: async (_name, handles) => Promise.race(handles.map((handle) => handle.promise)),
    release: async (_name, handle) => {
      if (isForkHandle(handle)) {
        await handle.release();
        return;
      }

      await owner.release(handle);
    },
    runProjectTask: async (project, task, flowOptions) => {
      options.logger?.info("flow project task", {
        flow: definition.name,
        project,
        task,
      });
      return options.runner.runProjectTask(project, task, flowOptions) as Promise<any>;
    },
    runTask: async (name, flowOptions) => {
      options.logger?.info("flow task", {
        flow: definition.name,
        step: name,
        task: name,
      });
      return options.runner.runTask(name, flowOptions) as Promise<any>;
    },
    sleep: async (name, ms) => {
      options.logger?.info("flow sleep", {
        flow: definition.name,
        ms,
        step: name,
      });
      await delay(ms);
    },
    step: async (name, run) =>
      step(name, async () => await run(), false),
    waitFor: async (name, subject, flowOptions) => {
      options.logger?.info("flow wait", {
        flow: definition.name,
        step: name,
      });
      await waitForCondition(subject, flowOptions?.timeoutMs);
    },
  };

  try {
    const output = await definition.run(context, inputs);
    state.completed = true;
    state.output = output;
    await writeState(options.statePath, state);
    return output;
  } finally {
    for (const handle of [...forkHandles].reverse()) {
      if (handle.status() === "running") {
        await handle.cancel();
      }
    }
    await owner.releaseAll();
  }
};
