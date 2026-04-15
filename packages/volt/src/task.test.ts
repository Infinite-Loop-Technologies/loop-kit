import { describe, expect, it } from "bun:test";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { flow } from "./flow";
import { executeProjectTask, task, type LoadedVoltProjectLike } from "./task";

describe("Volt tasks", () => {
  it("runs flow tasks and reuses persisted named steps", async () => {
    const rootDir = resolve(import.meta.dir, "..", "..");
    const statePath = resolve(rootDir, ".tmp-volt-flow-task.json");
    let calls = 0;

    const project: LoadedVoltProjectLike = {
      configPath: resolve(rootDir, "apps", "volt-demo", "volt.config.ts"),
      defaults: {
        build: [],
        dev: ["dev:full"],
      },
      name: "Task Test",
      rootDir,
      tasks: {
        "dev:compute": task({
          run: ({ inputs }) => Number(inputs ?? 0) + 1,
        }),
        "dev:full": flow(
          "dev:full",
          async (ctx) => {
            const value = await ctx.runTask("dev:compute", {
              inputs: 1,
            });
            const stable = await ctx.memo("stable-step", () => {
              calls += 1;
              return Number(value) + 1;
            });
            return stable;
          },
          {
            persist: statePath,
          },
        ),
      },
      targets: {},
      workspaceRoot: rootDir,
    };

    await rm(statePath, { force: true });

    await expect(executeProjectTask(project, "dev:full")).resolves.toMatchObject({
      result: 3,
    });
    await expect(executeProjectTask(project, "dev:full")).resolves.toMatchObject({
      result: 3,
    });
    expect(calls).toBe(1);

    await rm(statePath, { force: true });
  });

  it("supports fork, join, race, and all in flows", async () => {
    const rootDir = resolve(import.meta.dir, "..", "..");

    const project: LoadedVoltProjectLike = {
      configPath: resolve(rootDir, "apps", "volt-demo", "volt.config.ts"),
      defaults: {
        build: [],
        dev: ["dev:parallel"],
      },
      name: "Task Parallel Test",
      rootDir,
      tasks: {
        "dev:parallel": flow("dev:parallel", async (ctx) => {
          const slow = await ctx.fork("slow", async () => {
            await Bun.sleep(30);
            return "slow";
          });
          const fast = await ctx.fork("fast", async () => {
            await Bun.sleep(5);
            return "fast";
          });

          const first = await ctx.race("first-finished", [slow, fast]);
          const all = await ctx.all("collect-all", [slow, fast]);
          const joined = await ctx.join(fast);

          return { all, first, joined };
        }),
      },
      targets: {},
      workspaceRoot: rootDir,
    };

    await expect(executeProjectTask(project, "dev:parallel")).resolves.toMatchObject({
      result: {
        all: ["slow", "fast"],
        first: "fast",
        joined: "fast",
      },
    });
  });
});
