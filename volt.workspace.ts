import demoProject from "./apps/volt-demo/volt.config";
import forgeProject from "./apps/forge/volt.config";
import siteProject from "./apps/volt-site/volt.config";
import { flow } from "./packages/volt/src/flow";
import { defineWorkspaceConfig } from "./packages/volt/src/workspace";

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
      const forge = yield* ctx.runProjectTask("forge", "dev:web");
      const demo = yield* ctx.runProjectTask("demo", "dev:full");
      return { demo, forge };
    }),
    "dev:site": flow("dev:site", function* (ctx) {
      return yield* ctx.runProjectTask("site", "dev:site");
    }),
  },
});
