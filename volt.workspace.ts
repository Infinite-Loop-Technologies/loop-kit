import { flow } from "volt/flow";
import { defineWorkspaceConfig } from "volt/workspace";

export default defineWorkspaceConfig({
  defaults: {
    dev: "dev:demo+forge",
  },
  name: "Loop Kit Volt Workspace",
  projects: {
    "dock-demo": { configPath: "apps/dock-demo/volt.config.ts" },
    forge: { configPath: "apps/forge/volt.config.ts" },
    "loom-demo": { configPath: "apps/loom-demo/volt.config.ts" },
    "volt-canvas-demo": { configPath: "apps/volt-canvas-demo/volt.config.ts" },
    "volt-demo": { configPath: "apps/volt-demo/volt.config.ts" },
    "volt-jco-demo": { configPath: "apps/volt-jco-demo/volt.config.ts" },
    "volt-site": { configPath: "apps/volt-site/volt.config.ts" },
  },
  tasks: {
    "dev:canvas": flow("dev:canvas", async (ctx) =>
      ctx.runProjectTask("volt-canvas-demo", "dev:desktop"),
    ),
    "dev:demo+forge": flow("dev:demo+forge", async (ctx) => {
      await ctx.log("workspace-topology-start", "starting workspace demo + forge");
      const forgeTask = await ctx.forkProjectTask("forge", "dev:web");
      const demoTask = await ctx.forkProjectTask("volt-demo", "dev:full");
      const forge = await ctx.join(forgeTask);
      const demo = await ctx.join(demoTask);
      return { demo, forge };
    }, {
      watch: ["apps/forge/src/**/*", "apps/volt-demo/src/**/*", "packages/volt/src/**/*"],
    }),
    "dev:forge": flow("dev:forge", async (ctx) =>
      ctx.runProjectTask("forge", "dev:web"),
    ),
    "dev:site": flow("dev:site", async (ctx) =>
      ctx.runProjectTask("volt-site", "dev:site"),
    ),
  },
});
