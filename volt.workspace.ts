import demoProject from "./apps/volt-demo/volt.config";
import forgeProject from "./apps/forge/volt.config";
import siteProject from "./apps/volt-site/volt.config";
import { flow } from "volt/flow";
import { defineWorkspaceConfig } from "volt/workspace";

export default defineWorkspaceConfig({
  defaults: {
    dev: "dev:demo+forge",
  },
  name: "Loop Kit Volt Workspace",
  projects: {
    demo: demoProject,
    forge: forgeProject,
    site: siteProject,
  },
  tasks: {
    "dev:demo+forge": flow("dev:demo+forge", function* (ctx) {
      yield* ctx.log("workspace-topology-start", "starting workspace topology");
      const forgeTask = yield* ctx.forkProjectTask("forge", "dev:web");
      const demoTask = yield* ctx.forkProjectTask("demo", "dev:full");
      const forge = yield* ctx.join(forgeTask);
      const demo = yield* ctx.join(demoTask);
      return { demo, forge };
    }, {
      watch: ["apps/forge/src/**/*", "apps/volt-demo/src/**/*", "packages/volt/src/**/*"],
    }),
    "dev:site": flow("dev:site", function* (ctx) {
      return yield* ctx.runProjectTask("site", "dev:site");
    }),
  },
});
