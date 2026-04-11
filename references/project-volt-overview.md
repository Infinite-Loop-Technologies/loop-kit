# Volt Overview

Preferred current docs front door: `references/project-volt-project-model.md`.

This overview is the short product-facing description. Use it for the high-level shape, then drop into the other Volt docs for detail.

Volt is a Bun-native runtime-topology and workflow layer for local software projects. It is meant to make runtime dependencies, generated values, managed resources, and future agent workflows feel explicit, typed, and composable instead of buried in shell scripts.

The preferred direction in this repo is:

- project and workspace config as the composition surface
- tasks and flows as the execution surface
- artifacts, integrations, and runtime inputs as the value/dataflow surface
- a workspace daemon plus OpenTUI as the runtime UX surface
- agent workflows as a future first-class orchestration surface built on top of the same substrate

The practical split is:

- `volt.config.ts` or workspace config decides what runnable things exist and how they compose.
- entrypoint files define typed programs with `defineEntrypoint(import.meta, handler)`.
- Volt’s runtime layer resolves artifacts/integrations/runtime inputs, starts managed resources, and supervises the resulting topology.

It is already useful for:

- Bun fullstack/server/command runtimes
- config-time artifacts and runtime inputs
- workspace and project `.env` loading for config-time and runtime env injection
- workspace-aware daemon state
- local flows and memoized setup steps
- typed local orchestration that can sit above `dev`, `build`, `lint`, `test`, codegen, and future agent runs

It is not yet a finished deploy platform, durable workflow engine, or agent runtime. The useful thing today is the model: make local topology and orchestration legible instead of magical.

## The Smallest Mental Model

```ts
import { bunFullstackTarget, defineVoltConfig } from "volt";
import webEntrypoint from "./src/web/server.runtime";

export default defineVoltConfig({
  defaults: {
    build: ["web"],
    dev: ["web"],
  },
  name: "Forge Workspace",
  targets: {
    web: bunFullstackTarget(webEntrypoint, {
      env: {
        PORT: process.env.PORT ?? "3000",
      },
      outdir: "dist/web",
    }),
  },
});
```

That is the current minimum story:

1. Define a config.
2. Define named runnable units.
3. Point them at typed entrypoints or commands.
4. Run them through Volt.

## High-Level Product Direction

The intended user-facing shape is:

- `volt` with no subcommand opens the OpenTUI
- explicit subcommands remain available for direct shell usage
- bare task names can be run directly, so `volt dev:forge` resolves like `volt task run dev:forge`
- projects declare runtime topology and orchestration in config
- the daemon owns local state, resource/session ownership, and invalidation
- tasks stay useful for deterministic work
- flows handle orchestration
- future agent workflows build on the same config, task, daemon, and TUI substrate instead of inventing a separate AI-only platform

## Entrypoints

Entrypoints are typed programs.

Current shape:

```ts
import { defineEntrypoint, type BunFullstackServices } from "volt";
import { startWebServer } from "./startWebServer";
import indexHtml from "../index.html";

export default defineEntrypoint<BunFullstackServices>(
  import.meta,
  async (services) => {
    startWebServer(services, indexHtml);
  },
);
```

Or for a server target:

```ts
import { defineEntrypoint, type BunServerServices } from "volt";
import { startGameServer } from "./startGameServer";

export default defineEntrypoint<BunServerServices>(import.meta, async (services) => {
  startGameServer(services);
});
```

`defineEntrypoint(import.meta, handler)` records:

- the source file path
- the handler
- the fact that this module is a Volt entrypoint

Volt then generates a runtime bootstrap around that entrypoint when needed.

## What Volt Generates Around An Entrypoint

For Bun targets, Volt does not run the entrypoint object directly.

It generates a temporary runtime entry file under `.volt/generated/targets/...` that does this:

```ts
import entrypoint from "../original-entrypoint";
import {
  createBunFullstackServices,
  combineVoltServices,
  loadVoltProvidedServices,
  runVoltEntrypoint,
} from "volt";

if (import.meta.main) {
  void runVoltEntrypoint(entrypoint, async () =>
    combineVoltServices(
      entrypoint,
      createBunFullstackServices(rootDir),
      await loadVoltProvidedServices(providedServicesPath),
    ),
  );
}
```

That runtime bootstrap is the bridge between:

- built-in Bun runtime services
- config-provided services written to JSON
- the typed entrypoint handler

## Built-In Bun Services

A Bun entrypoint currently receives a built-in service object.

`BunServerServices` includes:

- `env.read(name)`
- `env.require(name)`
- `fs.exists(path)`
- `fs.readText(path)`
- `logger`
- `paths.fromRoot(...segments)`
- `socket(pathname)`
- `runtime: "bun-server"`
- `target: "bun"`

`BunFullstackServices` adds:

- `html(entrypoint)`
- `runtime: "bun-fullstack"`

This means entrypoints already have a small runtime capability surface instead of reading directly from global process state everywhere.

## A Real Fullstack Example

The current `apps/volt-demo` is the best example because it uses several Volt features together.

The config:

```ts
import {
  bunFullstackTarget,
  bunServerTarget,
  defineServices,
  defineVoltConfig,
} from "volt";
import gameEntrypoint from "./src/game-server/server.runtime";
import webEntrypoint from "./src/web/server.runtime";
import {
  createDemoSessionArtifact,
  type DemoRuntimeSession,
} from "./src/dev/demoSession";

const sessionArtifact = createDemoSessionArtifact({
  command,
  enableShare,
  mode,
  rootDir: import.meta.dir,
  shareProvider,
});

export default defineVoltConfig({
  artifacts: {
    runtimeSession: sessionArtifact,
  },
  defaults: {
    build: ["web", "game"],
    dev: ["web"],
  },
  name: "Volt Demo",
  targets: {
    game: bunServerTarget(gameEntrypoint, {
      artifacts: ["runtimeSession"],
      outdir: "dist/game-server",
      services: defineServices(({ artifacts }) => {
        const session = artifacts.requireValue<DemoRuntimeSession>("runtimeSession");
        return {
          demoGame: {
            healthUrl: `${session.game.localHttpUrl}/health`,
            mode: session.mode,
            port: session.game.port,
            websocketUrl: session.game.localWsUrl,
          },
        };
      }),
    }),
    web: bunFullstackTarget(webEntrypoint, {
      artifacts: ["runtimeSession"],
      dependsOn: ["game"],
      outdir: "dist/web",
      services: defineServices(({ artifacts }) => {
        const session = artifacts.requireValue<DemoRuntimeSession>("runtimeSession");
        return {
          demoWeb: {
            browserConfig: session.browserConfig,
            mode: session.mode,
            port: session.web.port,
          },
        };
      }),
    }),
  },
});
```

What this shows:

- one artifact can compute shared runtime session state up front
- both targets can consume that artifact
- each target can derive its own typed service payload from the artifact
- `dependsOn` still controls target ordering
- the web target can depend on the game target without needing to manually wire every path in the entrypoint

## Artifacts

Artifacts are the first real value-producing layer in Volt.

Current shape:

```ts
import { defineArtifact } from "volt";

export const runtimeSession = defineArtifact({
  kind: "runtime-session",
  async build(context) {
    return {
      generatedModulePath: "...",
      metadata: { shareEnabled: false },
      value: {
        webPort: 6101,
        gamePort: 6202,
      },
    };
  },
});
```

Targets opt into them with:

```ts
web: bunFullstackTarget(webEntrypoint, {
  artifacts: ["runtimeSession"],
});
```

Current behavior:

- artifacts resolve before the target runs
- artifact state is written under `.volt/state/artifacts/<name>.json`
- generated files can be written under `.volt/generated/artifacts/...`
- target service providers can read artifact outputs through:
  - `artifacts.get(name)`
  - `artifacts.require(name)`
  - `artifacts.requireValue(name)`

This is more than plain process ordering. It is the start of a value graph.

## Config-Provided Services

Volt can serialize config-resolved service values to disk, then merge them into the runtime services available to the entrypoint.

You define them with `defineServices(...)`.

```ts
import { defineServices } from "volt";

const webServices = defineServices(({ artifacts }) => {
  const session = artifacts.requireValue<DemoRuntimeSession>("runtimeSession");

  return {
    demoWeb: {
      browserConfig: session.browserConfig,
      mode: session.mode,
      port: session.web.port,
    },
  };
});
```

Then attach them to a target:

```ts
web: bunFullstackTarget(webEntrypoint, {
  artifacts: ["runtimeSession"],
  services: webServices,
});
```

The corresponding entrypoint can require those services in its type:

```ts
import { defineEntrypoint, type BunFullstackServices } from "volt";
import type { DemoWebRuntimeServices } from "../dev/demoSession";

export default defineEntrypoint<BunFullstackServices & DemoWebRuntimeServices>(
  import.meta,
  async (services) => {
    const port = services.demoWeb.port;
    const mode = services.demoWeb.mode;
    const gameWsUrl = services.demoWeb.browserConfig.gameWsUrl;
  },
);
```

Current limitation: this is a serializable-value service model. It is for config values, URLs, ports, flags, paths, metadata, and similar runtime inputs. It is not yet arbitrary non-serializable dependency injection from config into runtime.

## Fibers

Volt also has an experimental local workflow utility via `defineFiber(...)` and `runFiber(...)`.

The `apps/volt-demo` session artifact uses it to memoize named setup steps like port selection and optional sharing.

```ts
import { defineFiber, runFiber } from "volt";

const demoSessionFiber = defineFiber({
  name: "volt-demo.runtime-session",
  *run(context, input) {
    const webPort = yield context.step("web-port", () => getOpenPort());
    const gamePort = yield context.step("game-port", () => getOpenPort());
    const webPublicUrl = yield context.step("share-web", async () => {
      return input.enableShare ? input.shareProvider?.publish("volt-web", webPort) : null;
    });

    return {
      webPort,
      gamePort,
      webPublicUrl,
    };
  },
});

const session = await runFiber(demoSessionFiber, input, {
  statePath: ".volt/state/fibers/runtime-session.build.json",
});
```

Current behavior:

- the workflow is generator-based
- steps have stable names
- successful step results are memoized
- if `statePath` is set, state is persisted to JSON
- later runs can reuse completed step outputs

This is a prototype programming model, not yet the full durable workflow story.

## The Compatibility Surface

Volt still supports the older grouped Bun plugin style:

```ts
import { createBunPlugin, defineVoltConfig } from "volt";

const bun = createBunPlugin();

export default defineVoltConfig({
  defaults: {
    build: ["web"],
    dev: ["web"],
  },
  name: "__APP_NAME__",
  targets: {
    web: bun.fullstack({
      env: {
        PORT: process.env.PORT ?? "3000",
      },
      name: "web",
      outdir: "dist/web",
      source: "./src/web/server.runtime.ts",
    }),
  },
});
```

That still works, but it is now the compatibility surface. The preferred docs surface is:

- import the entrypoint object directly
- use `bunFullstackTarget(...)`
- use `bunServerTarget(...)`
- use `bunCommandTarget(...)`

## `dependsOn`, `uses`, And `artifacts`

These three ideas are easy to confuse.

- `dependsOn`
  - target ordering only
- `artifacts`
  - named config-defined values/modules produced before a target runs
- `uses`
  - named integrations a target wants resolved before it runs

The direction is that Volt should become better at explicit dataflow, not only process ordering.

## Integrations

Volt also has an `integrations` layer. Today it is mainly a producer/registry surface for generated files, metadata, and future external artifact flows.

Current integration outputs can include:

- `artifactPath`
- `generatedModulePath`
- `typesPath`
- `metadata`

Resolved integration state is written under `.volt/state/integrations/...`, and generated integration code can live under `.volt/generated/integrations/...`.

This is the current route for things like WASM/component/binding-style workflows rather than treating everything as just another app target.

## A Concrete Entrypoint Pattern

A good current Volt entrypoint pattern is:

```ts
import indexHtml from "../index.html";
import { defineEntrypoint, type BunFullstackServices } from "volt";
import type { DemoWebRuntimeServices } from "../dev/demoSession";
import { loadProjectEnv } from "../shared/loadProjectEnv";
import { startWebServer } from "./startWebServer";

export default defineEntrypoint<BunFullstackServices & DemoWebRuntimeServices>(
  import.meta,
  async (services) => {
    await loadProjectEnv(import.meta.dir);
    startWebServer(services, indexHtml);
  },
);
```

This keeps the entrypoint small:

- import typed services
- do any local bootstrapping
- call the actual runtime/server startup function

The runtime details stay in config, and the server details stay in a normal module like `startWebServer.ts`.

## What A Target Context Can See

When Volt runs a target, its target context already includes:

- `appRoot`
- `rootDir`
- `workspaceRoot`
- `mode`
- `command`
- `configPath`
- `currentTarget`
- `artifacts`
- `integrations`
- `logger`
- `spawn(label, cmd, options)`

That is why target-level config providers can compute values from artifacts and integrations without hardcoding everything into one giant script.

## Current Volt Direction In One Paragraph

Right now Volt is best understood as a Bun-native host layer for typed entrypoints, project-defined runtime topology, and local workflows, with an emerging value graph around artifacts/integrations/runtime inputs and a workspace daemon beneath it. The most important split is:

- entrypoint = typed program
- task/flow = executable orchestration unit
- runtime binding = how code becomes an owned local resource
- `volt.config.ts` = graph, defaults, ordering, artifacts, integrations, runtime inputs, and future agent workflow composition

## Best Files To Read Next

If someone wants to understand Volt from the code, these are the best starting points in this repo:

- `packages/volt/src/contracts.ts`
- `packages/volt/src/config.ts`
- `packages/volt/src/plugins/bun/plugin.ts`
- `packages/volt/src/plugins/bun/app.ts`
- `packages/volt/src/plugins/bun/services.ts`
- `packages/volt/src/daemon.ts`
- `packages/volt/src/fiber.ts`
- `apps/volt-demo/volt.config.ts`
- `apps/forge/volt.config.ts`
- `apps/volt-site/volt.config.ts`
- `references/project-volt-authoring.md`
- `references/project-volt-daemon.md`
