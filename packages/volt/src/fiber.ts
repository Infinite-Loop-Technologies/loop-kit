import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import type { VoltLogger } from "./contracts";
import { writeJsonFile } from "./utils";

type MaybePromise<T> = Promise<T> | T;

interface VoltFiberStepState {
  error?: string;
  status: "error" | "success";
  value?: unknown;
}

interface VoltFiberRunState {
  completed?: boolean;
  output?: unknown;
  steps: Record<string, VoltFiberStepState>;
}

interface VoltFiberInstruction<TValue> {
  kind: "sleep" | "step";
  name: string;
  run?: () => MaybePromise<TValue>;
  sleepMs?: number;
}

export interface VoltFiberContext {
  sleep: (name: string, ms: number) => VoltFiberInstruction<void>;
  step: <TValue>(
    name: string,
    run: () => MaybePromise<TValue>,
  ) => VoltFiberInstruction<TValue>;
}

export interface VoltFiber<TInput, TOutput> {
  name: string;
  run: (
    context: VoltFiberContext,
    input: TInput,
  ) => Generator<VoltFiberInstruction<any>, TOutput, any>;
}

export interface VoltFiberRunOptions {
  logger?: VoltLogger;
  statePath?: string;
}

const delay = (ms: number) =>
  new Promise<void>((resolveDelay) => setTimeout(resolveDelay, ms));

const readState = async (statePath?: string): Promise<VoltFiberRunState> => {
  if (!statePath || !existsSync(statePath)) {
    return { steps: {} };
  }

  return JSON.parse(await readFile(statePath, "utf8")) as VoltFiberRunState;
};

const writeState = async (
  statePath: string | undefined,
  state: VoltFiberRunState,
) => {
  if (!statePath) {
    return;
  }

  await writeJsonFile(statePath, state);
};

const createContext = (): VoltFiberContext => ({
  sleep: (name, ms) => ({
    kind: "sleep",
    name,
    sleepMs: ms,
  }),
  step: (name, run) => ({
    kind: "step",
    name,
    run,
  }),
});

export const defineFiber = <TInput, TOutput>(
  fiber: VoltFiber<TInput, TOutput>,
): VoltFiber<TInput, TOutput> => fiber;

export const runFiber = async <TInput, TOutput>(
  fiber: VoltFiber<TInput, TOutput>,
  input: TInput,
  options: VoltFiberRunOptions = {},
): Promise<TOutput> => {
  const state = await readState(options.statePath);

  if (state.completed) {
    return state.output as TOutput;
  }

  const iterator = fiber.run(createContext(), input);
  let next = iterator.next();

  while (!next.done) {
    const instruction = next.value;
    const memoized = state.steps[instruction.name];

    if (memoized?.status === "success") {
      next = iterator.next(memoized.value);
      continue;
    }

    if (memoized?.status === "error") {
      throw new Error(memoized.error ?? `Fiber step failed: ${instruction.name}`);
    }

    try {
      let value: unknown;

      if (instruction.kind === "sleep") {
        options.logger?.info("fiber sleep", {
          fiber: fiber.name,
          ms: instruction.sleepMs ?? 0,
          step: instruction.name,
        });
        await delay(instruction.sleepMs ?? 0);
        value = undefined;
      } else {
        options.logger?.info("fiber step", {
          fiber: fiber.name,
          step: instruction.name,
        });
        value = await instruction.run?.();
      }

      state.steps[instruction.name] = {
        status: "success",
        value,
      };
      await writeState(options.statePath, state);
      next = iterator.next(value);
    } catch (error) {
      state.steps[instruction.name] = {
        error: error instanceof Error ? error.message : String(error),
        status: "error",
      };
      await writeState(options.statePath, state);
      throw error;
    }
  }

  state.completed = true;
  state.output = next.value;
  await writeState(options.statePath, state);
  return next.value;
};
