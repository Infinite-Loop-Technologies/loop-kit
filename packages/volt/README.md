# Volt

Volt is a Bun-native runtime topology and codegen layer for local projects.

## Terms

- `project config`
  - the composition surface in `volt.config.ts`
- `adapter`
  - a first-class runtime value such as `bunFullstack(...)`, `bunServer(...)`, `bunCommand(...)`, or `electrobun(...)`
  - adapters expose typed `exports` and expand into normal `build:*` / `dev:*` tasks
- `task`
  - a named deterministic unit of work
- `flow`
  - an async orchestration task written with plain `async`/`await`, not generators
- `artifact`
  - a pre-run value or generated module that other tasks consume
- `runtime inputs`
  - serializable values injected into runtime entrypoints
- `codegen`
  - Volt’s generated-file pipeline; adapters and helpers emit files into `.volt/` through one service
- `daemon`
  - the workspace-scoped owner for watchers, invalidation state, and long-running task resources

## Preferred Shape

```ts
import { defineProjectConfig } from "volt";
import { bunFullstack } from "volt/bun";
import { electrobun } from "volt/electrobun";

const webUi = bunFullstack({
  entry: () => import("./src/mainview/server.runtime"),
  port: Number(process.env.VOLT_CANVAS_WEB_UI_PORT ?? 3310),
});

const desktop = electrobun({
  needs: [webUi],
  window: {
    title: "Volt Canvas",
    width: 1280,
    height: 800,
    url: webUi.exports.url!,
  },
});

export default defineProjectConfig({
  adapters: { "web-ui": webUi, desktop },
  name: "Volt Canvas Demo",
  tasks: {},
});
```

The CLI still runs normal task names. `defineProjectConfig(...)` expands adapters
into the task graph, keeps daemon ownership the same, and lets adapters reuse
typed exports instead of stringly-typed task references.

## Direction

- Keep config declarative and move boilerplate into adapters/codegen.
- Keep flows simple and explicit with plain async functions.
- Keep runtime ownership in the daemon.
- Keep codegen pluggable; Volt ships a ts-morph + OXC pipeline and optional
  formatter hooks.
