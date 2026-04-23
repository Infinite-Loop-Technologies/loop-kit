/**
 * Installed Runtime Architecture — runtime primitives.
 *
 * A Runtime is a long-lived orchestration boundary. It owns:
 *
 * 1. An environment bag (`env`)
 * 2. A root Run (`run`) for structured concurrency
 * 3. Installed modules tracked for cleanup
 *
 * Runtime is not a DI container. Dependencies are explicit and lexical.
 *
 * Installers return a normalized Installed<T> shape. Runtime wraps that in a
 * RuntimeLease<T>, which is the public uninstall handle returned from install().
 *
 * This version intentionally keeps Runtime small:
 * - no lifecycle signals
 * - no service registry
 * - no borrowed external Run ownership
 *
 * If we need borrowed/external Run support later, add a separate
 * `createRuntimeFromRun(...)` instead of overloading ownership semantics.
 *
 * @module
 */

import { createRun, type Run, type RunDeps } from "./Task.js";
import type { Awaitable } from "./Types.js";

/**
 * Inputs accepted as cleanup when normalizing installer results.
 *
 * Use a type alias here because a union is the correct shape.
 */
export type RuntimeCleanupInput =
  | RuntimeCleanup
  | AsyncDisposable
  | Disposable
  | (() => Awaitable<void>);

/**
 * Normalized async cleanup shape used internally by Runtime.
 *
 * We keep Symbol.asyncDispose for native `await using` / AsyncDisposableStack
 * compatibility, and add `.dispose()` as a friendlier alias.
 */
export interface RuntimeCleanup extends AsyncDisposable {
  readonly dispose: () => Promise<void>;
}

/**
 * Normalized installer result.
 *
 * Installers always return this shape. `value` may be `void` if the installer
 * exposes no useful value to callers.
 */
export interface Installed<T> {
  readonly value: T;
  readonly cleanup?: RuntimeCleanupInput | undefined;
}

/**
 * Public handle returned from Runtime.install(...).
 *
 * Runtime owns the installation. Callers receive a lease that:
 * - exposes the installed value
 * - allows early uninstall
 * - is itself disposable
 */
export interface RuntimeLease<T> extends AsyncDisposable {
  readonly value: T;
  readonly dispose: () => Promise<void>;
}

/**
 * An installer attaches a long-lived module to a runtime.
 *
 * It receives the runtime and may:
 * - read env
 * - use the root run
 * - install other modules
 * - return a value + optional cleanup
 */
export interface Installer<TEnv, T = void> {
  (runtime: Runtime<TEnv>): Awaitable<Installed<T>>;
}

/**
 * Cheap runtime diagnostics for tests/debugging/devtools.
 *
 * Keep this intentionally tiny until there is a real use for more.
 */
export interface RuntimeSnapshot {
  readonly state: RuntimeState;
  readonly activeInstallCount: number;
}

/**
 * Runtime lifecycle state.
 */
export type RuntimeState = "Running" | "Disposing" | "Disposed";

/**
 * Runtime lifecycle root.
 */
export interface Runtime<TEnv> extends AsyncDisposable {
  readonly env: TEnv;
  readonly run: Run<RunDeps & TEnv>;

  readonly snapshot: () => RuntimeSnapshot;

  readonly install: <T>(installer: Installer<TEnv, T>) => Promise<RuntimeLease<T>>;

  readonly installAll: <T extends ReadonlyArray<Installer<TEnv, any>>>(
    installers: T,
  ) => Promise<{
    [K in keyof T]: T[K] extends Installer<TEnv, infer TResult>
      ? RuntimeLease<TResult>
      : never;
  }>;

  readonly dispose: () => Promise<void>;
}

interface InstalledModule {
  disposed: boolean;
  readonly dispose: () => Promise<void>;
}

/**
 * Helper for installers that expose a value.
 */
export const installed = <T>(
  value: T,
  cleanup?: RuntimeCleanupInput,
): Installed<T> => ({
  value,
  cleanup,
});

/**
 * Helper for installers that expose no value.
 */
export const installedVoid = (
  cleanup?: RuntimeCleanupInput,
): Installed<void> => ({
  value: undefined,
  cleanup,
});

const toRuntimeCleanup = (
  input: RuntimeCleanupInput,
): RuntimeCleanup => {
  if ("dispose" in input && typeof input.dispose === "function") {
    return input as RuntimeCleanup;
  }

  if (typeof input === "function") {
    const dispose = async (): Promise<void> => {
      await input();
    };

    return {
      dispose,
      [Symbol.asyncDispose]: dispose,
    };
  }

  if (Symbol.asyncDispose in input) {
    const dispose = async (): Promise<void> => {
      await input[Symbol.asyncDispose]();
    };

    return {
      dispose,
      [Symbol.asyncDispose]: dispose,
    };
  }

  const dispose = async (): Promise<void> => {
    input[Symbol.dispose]();
  };

  return {
    dispose,
    [Symbol.asyncDispose]: dispose,
  };
};

const createRuntimeError = (message: string): Error => new Error(message);

export const createRuntime = <TEnv>(env: TEnv): Runtime<TEnv> => {
  const run = createRun(env);

  const modules = new Set<InstalledModule>();
  let state: RuntimeState = "Running";
  let disposePromise: Promise<void> | undefined;

  const failIfNotRunning = (): void => {
    if (state !== "Running") {
      throw createRuntimeError(
        `Runtime is ${state.toLowerCase()} and cannot accept new installs.`,
      );
    }
  };

  const runtime: Runtime<TEnv> = {
    env,
    run,

    snapshot: () => ({
      state,
      activeInstallCount: modules.size,
    }),

    install: async <T>(installer: Installer<TEnv, T>): Promise<RuntimeLease<T>> => {
      failIfNotRunning();

      const result = await installer(runtime);
      const cleanup = result.cleanup
        ? toRuntimeCleanup(result.cleanup)
        : undefined;

      if (state !== "Running") {
        if (cleanup) await cleanup.dispose();
        throw createRuntimeError(
          "Runtime began disposal while an install was in progress.",
        );
      }

      let disposed = false;

      const dispose = async (): Promise<void> => {
        if (disposed) return;
        disposed = true;
        modules.delete(module);
        if (cleanup) await cleanup.dispose();
      };

      const module: InstalledModule = {
        get disposed() {
          return disposed;
        },
        dispose,
      };

      modules.add(module);

      return {
        value: result.value,
        dispose,
        [Symbol.asyncDispose]: dispose,
      };
    },

    installAll: async (installers) => {
      const leases: unknown[] = [];

      for (const installer of installers) {
        leases.push(await runtime.install(installer));
      }

      return leases as {
        [K in keyof typeof installers]: (typeof installers)[K] extends Installer<
          TEnv,
          infer TResult
        >
          ? RuntimeLease<TResult>
          : never;
      };
    },

    dispose: async (): Promise<void> => {
      if (disposePromise) return disposePromise;

      disposePromise = (async () => {
        if (state === "Disposed") return;
        state = "Disposing";

        const errors: unknown[] = [];
        const installedModules = Array.from(modules).reverse();

        for (const module of installedModules) {
          try {
            await module.dispose();
          } catch (error) {
            errors.push(error);
          }
        }

        try {
          await run[Symbol.asyncDispose]();
        } catch (error) {
          errors.push(error);
        }

        state = "Disposed";

        if (errors.length === 1) {
          throw errors[0];
        }

        if (errors.length > 1) {
          throw new AggregateError(errors, "Runtime disposal failed.");
        }
      })();

      return disposePromise;
    },

    [Symbol.asyncDispose]: async () => {
      await runtime.dispose();
    },
  };

  return runtime;
};