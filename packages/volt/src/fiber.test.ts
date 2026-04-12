import { describe, expect, it } from "bun:test";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { defineFiber, runFiber } from "./fiber";

describe("Volt fibers", () => {
  it("memoizes named steps when a state path is provided", async () => {
    const statePath = resolve(import.meta.dir, "..", "..", ".tmp-volt-fiber-test.json");
    let calls = 0;

    const fiber = defineFiber({
      name: "memo-test",
      *run(context, input: number) {
        const result = yield context.step("compute", () => {
          calls += 1;
          return input + 1;
        });

        return result as number;
      },
    });

    await rm(statePath, { force: true });

    await expect(runFiber(fiber, 1, { statePath })).resolves.toBe(2);
    await expect(runFiber(fiber, 1, { statePath })).resolves.toBe(2);
    expect(calls).toBe(1);

    await rm(statePath, { force: true });
  });
});
