# Volt Loop / Daemon Prototype

This note exists to make the next architectural step concrete before changing Volt core.

## What Volt Does Today

Volt currently has:

- `targets` as runnable/buildable units
- `dependsOn` as ordering only
- config-time defaults via `defaults.build` and `defaults.dev`
- lightweight lifecycle plugins around CLI command execution

This means current target dependencies are only:

- "run this first"
- not "run this, capture what it produced, then pass that forward"

That distinction matters.

Example: `apps/volt-demo/volt.config.ts` already passes ports into multiple targets, but it does so by creating a shared `session` before target execution. The dependency graph is not carrying those values.

## The Gap

The next step for Volt is not just "more targets".

Volt needs three related but different things:

1. Ordered targets
2. Produced artifacts / generated modules
3. Long-lived daemon services

Treating all three as targets will make the API muddy.

## Proposed Model

### 1. Targets

Keep targets as the user-facing unit for:

- `build`
- `dev`
- runtime-specific app processes
- normal command processes

Targets may continue to use `dependsOn` for ordering.

### 2. Integrations

Add a new config section for external or generated things that are consumable by targets.

Good candidates:

- a JCO ComponentizeJS component
- a transpiled JS wrapper for a WASM component
- a downloaded external workspace artifact
- a Rust crate bridge
- a generated client for IPC or RPC

The core idea is:

- an integration resolves inputs
- produces outputs and metadata
- optionally generates TS-visible bindings
- may run watches inside the daemon

Prototype shape:

```ts
type VoltIntegrationPhase = "build" | "dev" | "daemon";

interface VoltIntegrationOutput {
  artifactPath?: string;
  generatedModulePath?: string;
  typesPath?: string;
  metadata?: Record<string, unknown>;
}

interface VoltIntegrationContext {
  appRoot: string;
  configPath: string;
  logger: VoltLogger;
  mode: "development" | "production";
  rootDir: string;
  workspaceRoot: string;
  writeGeneratedFile: (relativePath: string, content: string) => Promise<string>;
  writeMetadata: (name: string, data: unknown) => Promise<string>;
  spawn: VoltTargetContext["spawn"];
}

interface VoltIntegrationDefinition {
  kind: string;
  name: string;
  resolve?: (context: VoltIntegrationContext) => Promise<void> | void;
  build?: (context: VoltIntegrationContext) => Promise<VoltIntegrationOutput>;
  dev?: (context: VoltIntegrationContext) => Promise<VoltIntegrationOutput>;
  watch?: (context: VoltIntegrationContext) => Promise<ManagedVoltProcess | void>;
}
```

### 3. Daemon Services

Add a long-lived workspace daemon with plugin registration.

The daemon is where Volt should host:

- file watchers
- background codegen
- artifact downloads
- binding refresh
- logs and status
- caches and state

The daemon should not replace `volt dev`. It should back it.

## Why Integrations Are Not Just Targets

An integration is different from a target because its primary job is not "run an app".

Its primary job is to produce something consumable:

- a `.wasm`
- a transpiled JS module
- generated `.d.ts`
- a manifest with metadata

A target may depend on those outputs, but the integration itself is not necessarily a runtime endpoint.

That is the real distinction.

## Data Passing

Current Volt has no explicit output-passing channel between targets.

That is why this:

- build target A
- discover output paths, ports, manifests, generated bindings
- provide them to target B

needs a new layer.

The simplest approach is a generated manifest registry under `.volt`:

- `.volt/state/integrations/<name>.json`
- `.volt/generated/integrations/<name>/*`

Targets should then consume integration outputs by name, not by guessing file paths.

Prototype manifest:

```json
{
  "name": "fetch-component",
  "kind": "jco-component",
  "artifactPath": "/abs/path/to/component.wasm",
  "generatedModulePath": "/abs/path/to/.volt/generated/integrations/fetch-component/component.js",
  "typesPath": "/abs/path/to/.volt/generated/integrations/fetch-component/component.d.ts",
  "metadata": {
    "source": "examples/volt-jco-node-fetch-upstream",
    "transpiler": "jco",
    "world": "root"
  }
}
```

## Prototype: JCO Node Fetch

Upstream example copied locally:

- `examples/volt-jco-node-fetch-upstream/package.json`
- `examples/volt-jco-node-fetch-upstream/component.js`
- `examples/volt-jco-node-fetch-upstream/demo.js`

The upstream flow is:

1. `jco componentize -w wit -o component.wasm component.js`
2. `jco transpile -o dist/transpiled component.wasm`
3. import from `dist/transpiled/component.js`

That maps well to a Volt integration:

```ts
export default defineVoltConfig({
  defaults: {
    build: ["server", "web"],
    dev: ["server", "web"],
  },
  integrations: {
    fetchComponent: jco.component({
      sourceDir: "./examples/volt-jco-node-fetch-upstream",
      wit: "./examples/volt-jco-node-fetch-upstream/wit",
      entry: "./examples/volt-jco-node-fetch-upstream/component.js",
      componentOut: ".volt/artifacts/fetch-component/component.wasm",
      transpileOut: ".volt/generated/integrations/fetch-component",
    }),
  },
  targets: {
    server: bun.server({
      name: "server",
      source: "./src/server.ts",
      outdir: "dist/server",
      uses: ["fetchComponent"],
    }),
    web: bun.fullstack({
      name: "web",
      source: "./src/web/server.runtime.ts",
      outdir: "dist/web",
      uses: ["fetchComponent"],
    }),
  },
});
```

In this model:

- `uses` means "I need the integration outputs available"
- Volt resolves `uses` before target build/dev
- Volt exposes manifest data and generated import paths to the target context

That is still ordered execution, but with explicit output registration.

## Current Workspace Daemon Behavior

Volt now uses one workspace-scoped daemon process per repo, not one pid/log/state triple per `volt.config.ts`.

Current properties:

- root-level `volt daemon start|status|logs|stop` discovers `apps/*/volt.config.ts` automatically when `--config` is omitted
- daemon state lives under root `/.volt/daemon/`
- `volt dev` ensures the workspace daemon is running and that the current app config is included in its managed config set
- the daemon state file records the managed config list and per-config watcher/service counts

This is a better fit for a monorepo because the daemon is now "the workspace background process" instead of "whatever config path happened to be in the current directory when the command ran"

## Daemon Prototype

Suggested commands:

- `volt daemon start`
- `volt daemon stop`
- `volt daemon logs`
- `volt daemon status`
- `volt daemon start --config apps/volt-demo/volt.config.ts`

Suggested daemon responsibilities:

- load config
- discover and track managed app configs at workspace scope
- start plugin/integration watchers
- write generated files
- stream logs
- expose status for active integrations and targets

## Resonate Fit

Resonate looks like the right layer above the local Volt daemon, not a replacement for it.

Use the Volt daemon for:

- local workspace watchers
- generated file maintenance
- integration refresh
- plugin-owned background services that are tightly coupled to the local repo

Use Resonate for:

- durable waits and sleeps
- human approval checkpoints
- AI workflows that react to project or data changes
- retries, resumability, and cross-process progress tracking
- Forge-side long-running jobs like authentication email verification and node-triggered AI flows

That split keeps the local daemon simple and makes the durable workflow layer explicit.

Suggested daemon plugin shape:

```ts
interface VoltDaemonPlugin {
  name: string;
  setup: (builder: VoltDaemonPluginBuilder) => Promise<void> | void;
}

interface VoltDaemonPluginBuilder {
  registerService: (service: VoltDaemonService) => void;
}

interface VoltDaemonService {
  name: string;
  start: (context: VoltDaemonContext) => Promise<ManagedVoltProcess | void>;
}
```

## Recommended First Slice

Do not build the full "loop" vision first.

Build this sequence:

1. Add daemon CLI surface and process management.
2. Add generated file + manifest helpers under `.volt`.
3. Add one experimental `integrations` config section.
4. Implement one JCO integration using the local `jco-node-fetch-upstream` example.
5. Let one target consume the generated transpiled module path from the integration manifest.
6. Only after that, add continuous watch/update behavior.

## Defaults

Volt already has target selection defaults.

If Volt grows a daemon and integrations layer, the next useful defaults are likely:

- default generated output locations under `.volt/generated`
- default metadata locations under `.volt/state`
- default daemon enablement for `volt dev`
- default per-integration output naming conventions

That is different from shipping one giant default config object in the package.

The better default strategy is:

- keep config explicit
- provide helper constructors with sensible defaults
- let users override paths and hooks where needed

## Current Conclusion

The right next experiment is:

- not "make targets smarter"
- but "add one integration model plus one daemon model"

That preserves the clarity of existing targets while giving Volt a path toward generated bindings, external artifacts, and richer multi-runtime workflows.
