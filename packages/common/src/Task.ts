import { err, type Result } from "./Result.js";

export interface TaskContext {
  readonly signal?: AbortSignal;
}

export interface AbortError {
  readonly type: "AbortError";
  readonly reason?: unknown;
}

export type MaybeAsync<T> = T | PromiseLike<T>;

export interface Task<T, E> {
  <TContext extends TaskContext | undefined = undefined>(
    context?: TContext,
  ): Promise<
    Result<T, TContext extends { signal: AbortSignal } ? E | AbortError : E>
  >;
}

export const isAsync = <T>(
  value: MaybeAsync<T>,
): value is PromiseLike<T> =>
  typeof (value as { then?: unknown } | null)?.then === "function";

export const toTask = <T, E>(
  run: (context?: TaskContext) => Promise<Result<T, E>>,
): Task<T, E> =>
  (async (context) => {
    const signal = context?.signal;
    if (!signal) {
      return run(context);
    }

    if (signal.aborted) {
      return err({
        reason: signal.reason,
        type: "AbortError",
      }) as Result<T, E | AbortError>;
    }

    const abortPromise = new Promise<Result<T, AbortError>>((resolve) => {
      signal.addEventListener(
        "abort",
        () =>
          resolve(
            err({
              reason: signal.reason,
              type: "AbortError",
            }),
          ),
        { once: true },
      );
    });

    return Promise.race([run(context), abortPromise]) as Promise<
      Result<T, E | AbortError>
    >;
  }) as Task<T, E>;
