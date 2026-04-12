import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import type {
  ResourceHandle,
  VoltCommand,
  VoltLogger,
} from "./contracts";
import { createRuntimeOwner } from "./process";
import { writeJsonFile } from "./utils";

type MaybePromise<T> = Promise<T> | T;

interface VoltFlowStepState {
  error?: string;
  status: "error" | "success";
  value?: unknown;
}

interface VoltFlowRunState<TOutput = unknown> {
  completed?: boolean;
  output?: TOutput;
  steps: Record<string, VoltFlowStepState>;
}

export interface VoltFlowForkHandle<TValue = unknown> {
  cancel: () => Promise<void>;
  label: string;
  promise: Promise<TValue>;
  release: () => Promise<void>;
  status: () => "cancelled" | "completed" | "failed" | "running";
}

export interface VoltFlowRunTaskInstruction {
  inputs?: unknown;
  kind: "run-task";
  name: string;
}

export interface VoltFlowRunProjectTaskInstruction {
  inputs?: unknown;
  kind: "run-project-task";
  name: string;
  project: string;
  task: string;
}

export interface VoltFlowSleepInstruction {
  kind: "sleep";
  ms: number;
  name: string;
}

export interface VoltFlowMemoInstruction<TValue = unknown> {
  kind: "memo";
  name: string;
  run: () => MaybePromise<TValue>;
}

export interface VoltFlowStepInstruction<TValue = unknown> {
  kind: "step";
  name: string;
  run: () => MaybePromise<TValue>;
}

export interface VoltFlowForkInstruction<TValue = unknown> {
  kind: "fork";
  name: string;
  run: (signal: AbortSignal) => MaybePromise<TValue>;
}

export interface VoltFlowJoinInstruction<TValue = unknown> {
  handle: VoltFlowForkHandle<TValue>;
  kind: "join";
  name: string;
}

export interface VoltFlowAllInstruction<TValue = unknown> {
  handles: VoltFlowForkHandle<TValue>[];
  kind: "all";
  name: string;
}

export interface VoltFlowRaceInstruction<TValue = unknown> {
  handles: VoltFlowForkHandle<TValue>[];
  kind: "race";
  name: string;
}

export interface VoltFlowWaitForInstruction<TValue = unknown> {
  kind: "wait-for";
  name: string;
  subject:
    | (() => MaybePromise<boolean>)
    | ResourceHandle
    | VoltFlowForkHandle<TValue>;
  timeoutMs?: number;
}

export interface VoltFlowReleaseInstruction {
  handle: ResourceHandle | VoltFlowForkHandle;
  kind: "release";
  name: string;
}

export interface VoltFlowLogInstruction {
  data?: Record<string, unknown>;
  kind: "log";
  level?: "error" | "info" | "warn";
  message: string;
  name: string;
}

export type VoltFlowInstruction<TValue = unknown> =
  | VoltFlowAllInstruction<TValue>
  | VoltFlowForkInstruction<TValue>
  | VoltFlowJoinInstruction<TValue>
  | VoltFlowLogInstruction
  | VoltFlowMemoInstruction<TValue>
  | VoltFlowRaceInstruction<TValue>
  | VoltFlowReleaseInstruction
  | VoltFlowRunProjectTaskInstruction
  | VoltFlowRunTaskInstruction
  | VoltFlowSleepInstruction
  | VoltFlowStepInstruction<TValue>
  | VoltFlowWaitForInstruction<TValue>;

export interface VoltFlowContext {
  all: <TValue>(
    name: string,
    handles: VoltFlowForkHandle<TValue>[],
  ) => Generator<VoltFlowInstruction<TValue[]>, TValue[], TValue[]>;
  fork: <TValue>(
    name: string,
    run: (signal: AbortSignal) => MaybePromise<TValue>,
  ) => Generator<VoltFlowInstruction<VoltFlowForkHandle<TValue>>, VoltFlowForkHandle<TValue>, VoltFlowForkHandle<TValue>>;
  forkProjectTask: <TValue = unknown>(
    project: string,
    task: string,
    options?: { inputs?: unknown },
  ) => Generator<VoltFlowInstruction<VoltFlowForkHandle<TValue>>, VoltFlowForkHandle<TValue>, VoltFlowForkHandle<TValue>>;
  forkTask: <TValue = unknown>(
    name: string,
    options?: { inputs?: unknown },
  ) => Generator<VoltFlowInstruction<VoltFlowForkHandle<TValue>>, VoltFlowForkHandle<TValue>, VoltFlowForkHandle<TValue>>;
  join: <TValue>(
    handle: VoltFlowForkHandle<TValue>,
  ) => Generator<VoltFlowInstruction<TValue>, TValue, TValue>;
  log: (
    name: string,
    message: string,
    data?: Record<string, unknown>,
    level?: "error" | "info" | "warn",
  ) => Generator<VoltFlowInstruction<void>, void, void>;
  memo: <TValue>(
    name: string,
    run: () => MaybePromise<TValue>,
  ) => Generator<VoltFlowInstruction<TValue>, TValue, TValue>;
  race: <TValue>(
    name: string,
    handles: VoltFlowForkHandle<TValue>[],
  ) => Generator<VoltFlowInstruction<TValue>, TValue, TValue>;
  release: (
    name: string,
    handle: ResourceHandle | VoltFlowForkHandle,
  ) => Generator<VoltFlowInstruction<void>, void, void>;
  runProjectTask: <TValue = unknown>(
    project: string,
    task: string,
    options?: { inputs?: unknown },
  ) => Generator<VoltFlowInstruction<TValue>, TValue, TValue>;
  runTask: <TValue = unknown>(
    name: string,
    options?: { inputs?: unknown },
  ) => Generator<VoltFlowInstruction<TValue>, TValue, TValue>;
  sleep: (
    name: string,
    ms: number,
  ) => Generator<VoltFlowInstruction<void>, void, void>;
  step: <TValue>(
    name: string,
    run: () => MaybePromise<TValue>,
  ) => Generator<VoltFlowInstruction<TValue>, TValue, TValue>;
  waitFor: <TValue = unknown>(
    name: string,
    subject: (() => MaybePromise<boolean>) | ResourceHandle | VoltFlowForkHandle<TValue>,
    options?: { timeoutMs?: number },
  ) => Generator<VoltFlowInstruction<void>, void, void>;
}

export interface VoltFlowDefinition<TInputs = unknown, TOutput = unknown> {
  kind: "flow-definition";
  name: string;
  run: (
    context: VoltFlowContext,
    inputs: TInputs,
  ) => Generator<VoltFlowInstruction, TOutput, unknown>;
}

export interface VoltFlowTaskDefinition<TInputs = unknown, TOutput = unknown> {
  command?: VoltCommand;
  dependsOn?: string[];
  inputs?: string[];
  kind: "flow-task";
  outputs?: string[];
  persist?: boolean | string;
  value: VoltFlowDefinition<TInputs, TOutput>;
  watch?: string[];
}

export interface VoltFlowRunner {
  runProjectTask: (
    project: string,
    task: string,
    options?: { inputs?: unknown },
  ) => Promise<unknown>;
  runTask: (name: string, options?: { inputs?: unknown }) => Promise<unknown>;
}

export interface VoltFlowRunOptions {
  logger?: VoltLogger;
  runner: VoltFlowRunner;
  statePath?: string;
}

const delay = (ms: number) =>
  new Promise<void>((resolveDelay) => setTimeout(resolveDelay, ms));

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

const waitForCondition = async (
  subject: (() => MaybePromise<boolean>) | ResourceHandle | VoltFlowForkHandle,
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

const createFlowContext = (): VoltFlowContext => {
  function* createStep<TYield, TValue>(
    instruction: TYield,
  ): Generator<TYield, TValue, TValue> {
    return (yield instruction) as TValue;
  }

  return {
    all(name, handles) {
      return createStep<VoltFlowAllInstruction<any>, any[]>({
        handles,
        kind: "all",
        name,
      });
    },
    fork(name, run) {
      return createStep<VoltFlowForkInstruction<any>, VoltFlowForkHandle<any>>({
        kind: "fork",
        name,
        run,
      });
    },
    forkProjectTask(project, task, options) {
      return createStep<VoltFlowForkInstruction<any>, VoltFlowForkHandle<any>>({
        kind: "fork",
        name: `${project}:${task}`,
        run: () => ({ options, project, task }),
      });
    },
    forkTask(name, options) {
      return createStep<VoltFlowForkInstruction<any>, VoltFlowForkHandle<any>>({
        kind: "fork",
        name,
        run: () => ({ name, options }),
      });
    },
    join(handle) {
      return createStep<VoltFlowJoinInstruction<any>, any>({
        handle,
        kind: "join",
        name: handle.label,
      });
    },
    log(name, message, data, level = "info") {
      return createStep<VoltFlowLogInstruction, void>({
        data,
        kind: "log",
        level,
        message,
        name,
      });
    },
    memo(name, run) {
      return createStep<VoltFlowMemoInstruction<any>, any>({
        kind: "memo",
        name,
        run,
      });
    },
    race(name, handles) {
      return createStep<VoltFlowRaceInstruction<any>, any>({
        handles,
        kind: "race",
        name,
      });
    },
    release(name, handle) {
      return createStep<VoltFlowReleaseInstruction, void>({
        handle,
        kind: "release",
        name,
      });
    },
    runProjectTask(project, task, options) {
      return createStep<VoltFlowRunProjectTaskInstruction, any>({
        inputs: options?.inputs,
        kind: "run-project-task",
        name: `${project}:${task}`,
        project,
        task,
      });
    },
    runTask(name, options) {
      return createStep<VoltFlowRunTaskInstruction, any>({
        inputs: options?.inputs,
        kind: "run-task",
        name,
      });
    },
    sleep(name, ms) {
      return createStep<VoltFlowSleepInstruction, void>({
        kind: "sleep",
        ms,
        name,
      });
    },
    step(name, run) {
      return createStep<VoltFlowStepInstruction<any>, any>({
        kind: "step",
        name,
        run,
      });
    },
    waitFor(name, subject, options) {
      return createStep<VoltFlowWaitForInstruction<any>, void>({
        kind: "wait-for",
        name,
        subject,
        timeoutMs: options?.timeoutMs,
      });
    },
  };
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

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

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
  const iterator = definition.run(createFlowContext(), inputs);
  let next = iterator.next();

  try {
    while (!next.done) {
      const instruction = next.value;
      const memoized = state.steps[instruction.name];

      if (instruction.kind === "memo" && memoized?.status === "success") {
        next = iterator.next(memoized.value);
        continue;
      }

      if (instruction.kind === "memo" && memoized?.status === "error") {
        throw new Error(memoized.error ?? `Flow step failed: ${instruction.name}`);
      }

      try {
        let value: unknown;

        if (instruction.kind === "sleep") {
          options.logger?.info("flow sleep", {
            flow: definition.name,
            ms: instruction.ms,
            step: instruction.name,
          });
          await delay(instruction.ms);
        } else if (instruction.kind === "run-task") {
          options.logger?.info("flow task", {
            flow: definition.name,
            step: instruction.name,
            task: instruction.name,
          });
          value = await options.runner.runTask(instruction.name, {
            inputs: instruction.inputs,
          });
        } else if (instruction.kind === "run-project-task") {
          options.logger?.info("flow project task", {
            flow: definition.name,
            project: instruction.project,
            step: instruction.name,
            task: instruction.task,
          });
          value = await options.runner.runProjectTask(
            instruction.project,
            instruction.task,
            {
              inputs: instruction.inputs,
            },
          );
        } else if (instruction.kind === "memo") {
          options.logger?.info("flow memo", {
            flow: definition.name,
            step: instruction.name,
          });
          value = await instruction.run();
          state.steps[instruction.name] = {
            status: "success",
            value,
          };
          await writeState(options.statePath, state);
        } else if (instruction.kind === "step") {
          options.logger?.info("flow step", {
            flow: definition.name,
            step: instruction.name,
          });
          value = await instruction.run();
        } else if (instruction.kind === "fork") {
          options.logger?.info("flow fork", {
            flow: definition.name,
            step: instruction.name,
          });
          const controller = new AbortController();
          let currentStatus: VoltFlowForkHandle["status"] extends () => infer TStatus
            ? TStatus
            : never = "running";
          let resolvedResource: ResourceHandle | undefined;

          const promise = (async () => {
            const result = await instruction.run(controller.signal);
            if (
              typeof result === "object" &&
              result !== null &&
              "project" in result &&
              "task" in result
            ) {
              return options.runner.runProjectTask(
                (result as { project: string }).project,
                (result as { task: string }).task,
                (result as { options?: { inputs?: unknown } }).options,
              ) as Promise<unknown>;
            }
            if (
              typeof result === "object" &&
              result !== null &&
              "name" in result &&
              "options" in result
            ) {
              return options.runner.runTask(
                (result as { name: string }).name,
                (result as { options?: { inputs?: unknown } }).options,
              ) as Promise<unknown>;
            }
            return result;
          })()
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

          const handle: VoltFlowForkHandle = {
            cancel: async () => {
              controller.abort();
              if (resolvedResource) {
                await owner.release(resolvedResource);
              }
              currentStatus = "cancelled";
            },
            label: instruction.name,
            promise,
            release: async () => {
              if (resolvedResource) {
                await owner.release(resolvedResource);
              }
            },
            status: () => currentStatus,
          };
          forkHandles.push(handle);
          value = handle;
        } else if (instruction.kind === "join") {
          value = await instruction.handle.promise;
        } else if (instruction.kind === "all") {
          value = await Promise.all(
            instruction.handles.map((handle) => handle.promise),
          );
        } else if (instruction.kind === "race") {
          value = await Promise.race(
            instruction.handles.map((handle) => handle.promise),
          );
        } else if (instruction.kind === "wait-for") {
          await waitForCondition(instruction.subject, instruction.timeoutMs);
        } else if (instruction.kind === "release") {
          if (isForkHandle(instruction.handle)) {
            await instruction.handle.release();
          } else {
            await owner.release(instruction.handle);
          }
        } else if (instruction.kind === "log") {
          options.logger?.[instruction.level ?? "info"](instruction.message, {
            flow: definition.name,
            step: instruction.name,
            ...instruction.data,
          });
        }

        next = iterator.next(value);
      } catch (error) {
        if (instruction.kind === "memo") {
          state.steps[instruction.name] = {
            error: toErrorMessage(error),
            status: "error",
          };
          await writeState(options.statePath, state);
        }
        throw error;
      }
    }

    state.completed = true;
    state.output = next.value;
    await writeState(options.statePath, state);
    return next.value;
  } finally {
    for (const handle of [...forkHandles].reverse()) {
      if (handle.status() === "running") {
        await handle.cancel();
      }
    }
    await owner.releaseAll();
  }
};
