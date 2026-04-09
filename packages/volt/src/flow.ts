import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import type { VoltCommand, VoltLogger } from "./contracts";
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

export interface VoltFlowStepInstruction<TValue = unknown> {
  kind: "step";
  name: string;
  run: () => MaybePromise<TValue>;
}

export type VoltFlowInstruction<TValue = unknown> =
  | VoltFlowRunProjectTaskInstruction
  | VoltFlowRunTaskInstruction
  | VoltFlowSleepInstruction
  | VoltFlowStepInstruction<TValue>;

export interface VoltFlowContext {
  memo: <TValue>(
    name: string,
    run: () => MaybePromise<TValue>,
  ) => Generator<VoltFlowInstruction<TValue>, TValue, TValue>;
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
  kind: "flow-task";
  persist?: boolean | string;
  value: VoltFlowDefinition<TInputs, TOutput>;
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

const createFlowContext = (): VoltFlowContext => {
  function* createStep<TValue>(
    instruction: VoltFlowInstruction<TValue>,
  ): Generator<VoltFlowInstruction<TValue>, TValue, TValue> {
    return (yield instruction) as TValue;
  }

  return {
    memo(name, run) {
      return createStep({
        kind: "step",
        name,
        run,
      });
    },
    runProjectTask(project, task, options) {
      return createStep({
        inputs: options?.inputs,
        kind: "run-project-task",
        name: `${project}:${task}`,
        project,
        task,
      });
    },
    runTask(name, options) {
      return createStep({
        inputs: options?.inputs,
        kind: "run-task",
        name,
      });
    },
    sleep(name, ms) {
      return createStep({
        kind: "sleep",
        ms,
        name,
      });
    },
    step(name, run) {
      return createStep({
        kind: "step",
        name,
        run,
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

export const runFlow = async <TInputs, TOutput>(
  definition: VoltFlowDefinition<TInputs, TOutput>,
  inputs: TInputs,
  options: VoltFlowRunOptions,
): Promise<TOutput> => {
  const state = await readState<TOutput>(options.statePath);
  if (state.completed) {
    return state.output as TOutput;
  }

  const iterator = definition.run(createFlowContext(), inputs);
  let next = iterator.next();

  while (!next.done) {
    const instruction = next.value;
    const memoized = state.steps[instruction.name];

    if (instruction.kind === "step" && memoized?.status === "success") {
      next = iterator.next(memoized.value);
      continue;
    }

    if (instruction.kind === "step" && memoized?.status === "error") {
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
      } else {
        options.logger?.info("flow step", {
          flow: definition.name,
          step: instruction.name,
        });
        value = await instruction.run();
        state.steps[instruction.name] = {
          status: "success",
          value,
        };
        await writeState(options.statePath, state);
      }

      next = iterator.next(value);
    } catch (error) {
      if (instruction.kind === "step") {
        state.steps[instruction.name] = {
          error: error instanceof Error ? error.message : String(error),
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
};
