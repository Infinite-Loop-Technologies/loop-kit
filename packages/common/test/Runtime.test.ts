import { expect, expectTypeOf, test } from "vitest";
import {
  createRuntime,
  installed,
  installedVoid,
  type Installed,
  type Installer,
  type Runtime,
  type RuntimeCleanup,
  type RuntimeLease,
  type RuntimeSnapshot,
} from "../src/Runtime.js";
import { ok } from "../src/Result.js";
import type { Run, RunDeps } from "../src/Task.js";

interface TestEnv {
  readonly name: string;
}

test("createRuntime owns env and a root Run", async () => {
  const env: TestEnv = { name: "runtime" };
  const runtime = createRuntime(env);

  expect(runtime.env).toBe(env);
  expect(runtime.run.parent).toBe(null);
  expect(runtime.run.getState().type).toBe("Running");

  expectTypeOf(runtime.env).toEqualTypeOf<TestEnv>();
  expectTypeOf(runtime.run).toEqualTypeOf<Run<RunDeps & TestEnv>>();
  expectTypeOf(runtime.snapshot()).toEqualTypeOf<RuntimeSnapshot>();

  await runtime.dispose();

  expect(runtime.run.getState().type).toBe("Settled");
});

test("installed helpers create normalized installer results", () => {
  const cleanup = () => {};

  expect(installed("value", cleanup)).toEqual({
    value: "value",
    cleanup,
  });
  expect(installedVoid(cleanup)).toEqual({
    value: undefined,
    cleanup,
  });

  expectTypeOf(installed("value")).toEqualTypeOf<Installed<string>>();
  expectTypeOf(installedVoid()).toEqualTypeOf<Installed<void>>();
});

test("install returns an idempotent lease", async () => {
  const runtime = createRuntime({ name: "runtime" });
  let cleanupCount = 0;

  const lease = await runtime.install(() =>
    installed("policy", () => {
      cleanupCount++;
    }),
  );

  expect(lease.value).toBe("policy");
  expect(runtime.snapshot()).toEqual({
    state: "Running",
    activeInstallCount: 1,
  });
  expectTypeOf(lease).toEqualTypeOf<RuntimeLease<string>>();

  await lease.dispose();
  await lease.dispose();
  await lease[Symbol.asyncDispose]();

  expect(cleanupCount).toBe(1);
  expect(runtime.snapshot()).toEqual({
    state: "Running",
    activeInstallCount: 0,
  });

  await runtime.dispose();
});

test("runtime disposal is idempotent and disposes installs in reverse order", async () => {
  const runtime = createRuntime({ name: "runtime" });
  const disposed: Array<string> = [];

  await runtime.install(() =>
    installedVoid(() => {
      disposed.push("first");
    }),
  );
  await runtime.install(() =>
    installedVoid(() => {
      disposed.push("second");
    }),
  );
  await runtime.install(() =>
    installedVoid(() => {
      disposed.push("third");
    }),
  );

  await runtime.dispose();
  await runtime.dispose();
  await runtime[Symbol.asyncDispose]();

  expect(disposed).toEqual(["third", "second", "first"]);
  expect(runtime.snapshot()).toEqual({
    state: "Disposed",
    activeInstallCount: 0,
  });
});

test("runtime disposal attempts every cleanup and aggregates failures", async () => {
  const runtime = createRuntime({ name: "runtime" });
  const disposed: Array<string> = [];
  const firstError = new Error("first failed");
  const secondError = new Error("second failed");

  await runtime.install(() =>
    installedVoid(() => {
      disposed.push("first");
      throw firstError;
    }),
  );
  await runtime.install(() =>
    installedVoid(async () => {
      disposed.push("second");
      throw secondError;
    }),
  );
  await runtime.install(() =>
    installedVoid(() => {
      disposed.push("third");
    }),
  );

  await expect(runtime.dispose()).rejects.toMatchObject({
    errors: [secondError, firstError],
  });

  expect(disposed).toEqual(["third", "second", "first"]);
  expect(runtime.snapshot()).toEqual({
    state: "Disposed",
    activeInstallCount: 0,
  });
  await expect(runtime.dispose()).rejects.toBeInstanceOf(AggregateError);
});

test("runtime disposal aggregates a single failure as AggregateError", async () => {
  const runtime = createRuntime({ name: "runtime" });
  const cleanupError = new Error("cleanup failed");

  await runtime.install(() =>
    installedVoid(() => {
      throw cleanupError;
    }),
  );

  try {
    await runtime.dispose();
    throw new Error("Expected runtime disposal to fail.");
  } catch (error) {
    expect(error).toBeInstanceOf(AggregateError);
    expect((error as AggregateError).errors).toEqual([cleanupError]);
  }
});

test("install throws after runtime disposal starts", async () => {
  const runtime = createRuntime({ name: "runtime" });
  const cleanup = Promise.withResolvers<void>();

  await runtime.install(() => installedVoid(() => cleanup.promise));

  const disposePromise = runtime.dispose();

  await expect(runtime.install(() => installedVoid())).rejects.toThrow(
    "Runtime is disposing and cannot accept new installs.",
  );
  cleanup.resolve();
  await disposePromise;

  await expect(runtime.install(() => installedVoid())).rejects.toThrow(
    "Runtime is disposed and cannot accept new installs.",
  );
});

test("install cleans up when runtime begins disposal before installer finishes", async () => {
  const runtime = createRuntime({ name: "runtime" });
  const installation = Promise.withResolvers<Installed<string>>();
  let cleanupCount = 0;

  const installPromise = runtime.install(() => installation.promise);
  const disposePromise = runtime.dispose();

  installation.resolve(
    installed("late", () => {
      cleanupCount++;
    }),
  );

  await expect(installPromise).rejects.toThrow(
    "Runtime began disposal while an install was in progress.",
  );
  await disposePromise;

  expect(cleanupCount).toBe(1);
  expect(runtime.snapshot()).toEqual({
    state: "Disposed",
    activeInstallCount: 0,
  });
});

test("cleanup accepts functions and disposable objects", async () => {
  const runtime = createRuntime({ name: "runtime" });
  const disposed: Array<string> = [];

  const asyncCleanup: RuntimeCleanup = {
    dispose: async () => {
      disposed.push("runtime-cleanup");
    },
    [Symbol.asyncDispose]: async () => {
      disposed.push("runtime-cleanup-symbol");
    },
  };

  await runtime.install(() =>
    installedVoid(() => {
      disposed.push("function");
    }),
  );
  await runtime.install(() =>
    installedVoid({
      [Symbol.dispose]: () => {
        disposed.push("sync-disposable");
      },
    }),
  );
  await runtime.install(() =>
    installedVoid({
      [Symbol.asyncDispose]: async () => {
        disposed.push("async-disposable");
      },
    }),
  );
  await runtime.install(() => installedVoid(asyncCleanup));

  await runtime.dispose();

  expect(disposed).toEqual([
    "runtime-cleanup",
    "async-disposable",
    "sync-disposable",
    "function",
  ]);
});

test("installAll returns typed leases in installer order", async () => {
  const runtime = createRuntime({ name: "runtime" });
  const installNumber: Installer<TestEnv, number> = () => installed(1);
  const installString: Installer<TestEnv, string> = () => installed("value");

  const leases = await runtime.installAll([
    installNumber,
    installString,
  ] as const);

  expect(leases[0].value).toBe(1);
  expect(leases[1].value).toBe("value");
  expect(runtime.snapshot().activeInstallCount).toBe(2);
  expectTypeOf(leases).toEqualTypeOf<
    readonly [RuntimeLease<number>, RuntimeLease<string>]
  >();

  await runtime.dispose();
});

test("installed modules can use runtime env and root Run explicitly", async () => {
  const runtime = createRuntime({ name: "runtime" });

  const lease = await runtime.install(async (runtime) => {
    const value = await runtime.run.orThrow(() => ok(runtime.env.name));
    return installed(value);
  });

  expect(lease.value).toBe("runtime");

  await runtime.dispose();
});

test("Runtime is a generic lifecycle root, not a registry", async () => {
  const runtime = createRuntime({ name: "runtime" });

  expect("get" in runtime).toBe(false);
  expect("set" in runtime).toBe(false);
  expect("emit" in runtime).toBe(false);

  await runtime.dispose();
});
