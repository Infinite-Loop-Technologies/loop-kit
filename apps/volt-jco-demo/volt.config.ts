import { createJcoIntegration, createBunPlugin, defineVoltConfig } from "volt";

const bun = createBunPlugin();
const jco = createJcoIntegration();

export default defineVoltConfig({
  defaults: {
    build: ["component-demo"],
    dev: ["component-demo"],
  },
  integrations: {
    fetchComponent: jco.component({
      entry: "../../examples/volt-jco-node-fetch-upstream/component.js",
      sourceDir: "../../examples/volt-jco-node-fetch-upstream",
      wit: "../../examples/volt-jco-node-fetch-upstream/wit",
    }),
  },
  name: "Volt JCO Demo",
  targets: {
    "component-demo": bun.command({
      commands: {
        build: ["node", "src/run-component.mjs"],
        dev: ["node", "src/run-component.mjs"],
      },
      name: "component-demo",
      uses: ["fetchComponent"],
    }),
  },
});
