# Volt Project Model

Volt in one sentence:

Volt is a typed runtime-topology and orchestration layer for entrypoints, tasks, flows, artifacts, integrations, and workspace-aware local workflows.

## What Volt Is

- a library-first programmable runtime layer
- strong at local runtime topology and supervision
- strong at typed task and flow composition in TypeScript
- strong at turning external build/codegen/runtime helpers into named artifacts and integrations
- strong at workspace-aware local change detection and selective invalidation
- a good substrate for daemon-backed tooling and future agent workflows

## What Volt Is Not

- not a generic task runner
- not a Moonrepo/Turbo replacement
- not a deployment platform replacement
- not a public Effect framework
- not a giant schema or AST framework
- not a secret manager

## Core Concepts

- `entrypoint`
  - a typed runnable program module
- `task`
  - a named unit for dev, build, codegen, automation, or resource startup
- `flow`
  - a generator-based orchestration task with memoized steps, concurrency, joins, races, waits, and cleanup
- `artifact`
  - a produced value or generated file/module resolved before dependent tasks
- `integration`
  - an external bridge that produces metadata, generated bindings, or runtime-facing outputs
- `process/resource`
  - an owned runtime handle with status, logs, readiness, wait, and stop semantics
- `project config`
  - per-app composition of tasks, flows, artifacts, integrations, and runtime bindings
- `workspace config`
  - thin cross-project composition and workspace-level flows

## Runtime Topology First

Runtime topology is the main reason Volt exists.

The intended shape is:

1. Start one or more managed resources.
2. Wait for concrete readiness, not wishful ordering.
3. Capture ports, URLs, generated paths, and runtime metadata as typed values.
4. Inject those values into dependent tasks and entrypoints.
5. Supervise the whole topology together.
6. Stop it cleanly without leaking child processes.

This is why Volt now centers on:

- runtime bindings like `bunServer(...)` and `bunFullstack(...)`
- `managedProcess(...)` and runtime owners
- explicit readiness probes
- flow primitives like `fork`, `join`, `all`, `race`, `waitFor`, and `release`

## Preferred API

Preferred public surfaces:

- `defineProjectConfig(...)`
- `defineWorkspaceConfig(...)`
- `bunServer(...)`, `bunFullstack(...)`, `bunCommand(...)`
- `task(...)`
- `flow(...)`
- `defineRuntimeInputs(...)`
- `defineEntrypointSpec(...)`, `implementEntrypoint(...)`
- `defineArtifact(...)`
- `defineInterface(...)`, `defineContract(...)`, `contractBindingsTask(...)`

Compatibility surfaces, not the preferred story:

- `defineVoltConfig(...)`
- `bun*Target(...)`
- `bun*Task(...)`
- `defineServices(...)`
- `defineFiber(...)`, `runFiber(...)`
- `createBunPlugin()`

## Preferred Authoring Shape

```ts
import { defineProjectConfig, defineRuntimeInputs, flow } from "volt";
import { bunFullstack, bunServer } from "volt/bun";

const gameInputs = defineRuntimeInputs(({ artifacts }) => ({
  demoGame: artifacts.requireValue("runtimeSession").game,
}));

const game = bunServer(GameServer, {
  artifacts: ["runtimeSession"],
  readiness: { kind: "stdout", pattern: "game server listening" },
  runtimeInputs: gameInputs,
  watch: ["src/game-server/**/*.ts", "src/runtime/gameServer.ts"],
});

const web = bunFullstack(WebApp, {
  artifacts: ["runtimeSession"],
  readiness: { kind: "stdout", pattern: "web app listening" },
  runtimeInputs: webInputs,
  watch: ["src/web/**/*.ts", "src/browser/**/*.tsx"],
});

export default defineProjectConfig({
  defaults: {
    build: ["build:game", "build:web"],
    dev: "dev:full",
  },
  name: "Volt Demo",
  tasks: {
    ...game.tasks("game"),
    ...web.tasks("web"),
    "dev:full": flow("dev:full", function* (ctx) {
      const gameTask = yield* ctx.forkTask("dev:game");
      const gameHandle = yield* ctx.join(gameTask);
      yield* ctx.waitFor("game-ready", gameHandle, { timeoutMs: 15_000 });

      const webTask = yield* ctx.forkTask("dev:web");
      const webHandle = yield* ctx.join(webTask);
      yield* ctx.waitFor("web-ready", webHandle, { timeoutMs: 15_000 });

      return { gameHandle, webHandle };
    }),
  },
});
```

## Runtime Inputs

`runtimeInputs` is the preferred name and story.

Use it for serializable, concrete runtime values:

- ports
- URLs
- browser config
- feature flags
- generated paths
- emulator endpoints
- tokens or local connection details when appropriate

Do not treat it as a giant dependency injection container.

## Workspace-Aware Change Detection

Volt now owns a lightweight affected-task layer for local workflows.

Current stance:

- explicit task `inputs`, `watch`, and `outputs`
- explicit task/project dependencies
- `@parcel/watcher` snapshots and `getEventsSince(...)`
- selective invalidation and refresh
- daemon-backed workspace state

Non-goals:

- remote cache
- giant inferred repo graph
- generalized scheduler platform

Volt differs from Moonrepo/Turbo here:

- Volt cares first about runtime topology, typed runtime values, and owned local process/resource orchestration
- broader monorepo execution platforms can still sit above or beside Volt

## Bun, Effect, and OpenTUI

Bun:

- Bun is the default runtime and process substrate
- Volt uses Bun-native spawn/build/runtime behavior directly

Effect:

- Effect is an internal implementation tool only
- use it for scopes, cleanup, cancellation, and supervision internals
- do not make Volt’s public API feel like renamed Effect

OpenTUI:

- OpenTUI is the direction for Volt UX
- it sits on top of structured runtime status, resource state, and log/event streams
- the dashboard is explicitly experimental, but the event/status model is not

## Contracts And Codegen

Contracts stay practical:

- normal TypeScript modules, not config DSL
- cheap generated bindings
- narrow bridge toward future WIT/component work

Current tooling stance:

- OXC for fast analysis and syntax validation
- recast for formatting-preserving rewrites when Volt edits user code
- ts-morph for narrow TS-aware generation and inspection
- SWC is not part of the default Volt path in this slice

## Daemon Role

The daemon remains:

- workspace-scoped
- explicit about ownership
- responsible for watchers, invalidation state, and shared runtime status
- not allowed to leak orphan processes

Use `references/project-volt-daemon.md` for the daemon-specific guarantees and state model.

## Proto Stance

- Proto stays the repo-level toolchain bootstrap story
- Volt should be easy to call from Proto-managed environments
- Volt should integrate with external tools cleanly, not absorb ownership of every tool
