import { createJcoIntegration, defineProjectConfig } from "volt";
import { bunCommand } from "volt/bun";

const jco = createJcoIntegration();
const componentDemo = bunCommand({
  commands: {
    build: ["node", "src/run-component.mjs"],
    dev: ["node", "src/run-component.mjs"],
  },
  uses: ["fetchComponent"],
});

export default defineProjectConfig({
  adapters: {
    "component-demo": componentDemo,
  },
  defaults: {
    build: ["build:component-demo"],
    dev: ["dev:component-demo"],
  },
  integrations: {
    fetchComponent: jco.component({
      entry: "../../examples/volt-jco-node-fetch-upstream/component.js",
      sourceDir: "../../examples/volt-jco-node-fetch-upstream",
      wit: "../../examples/volt-jco-node-fetch-upstream/wit",
    }),
  },
  name: "Volt JCO Demo",
  tasks: {},
});
