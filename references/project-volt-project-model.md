# Volt Project / Workspace Model

This note captures the current preferred Volt authoring model after the task/runtime rework in this repo.

It is intentionally honest about what is implemented now, what is compatibility surface, and what is still scaffolding for later work.

## New Mental Model

Prefer thinking about Volt in this order:

- contracts and resources live in normal TypeScript modules
- entrypoint specs and implementations live in normal TypeScript modules
- project config composes named tasks plus higher-level flows
- workspace config composes projects plus workspace-level flows
- targets still exist, but mostly as adapter internals or compatibility surface

The preferred split is now:

- contract/interface/resource = typed boundary description
- entrypoint = typed program module
- task = runnable unit
- flow = generator-based orchestration over tasks and stable steps
- project config = composition and defaults
- workspace config = cross-project composition

## Project Config vs Workspace Config

Use `defineProjectConfig(...)` inside app-local `volt.config.ts`.

Project config should mainly express:

- named tasks
- named flows
- defaults like `dev` and `build`
- artifacts and integrations
- plugin composition

Use `defineWorkspaceConfig(...)` in a workspace-level file such as `volt.workspace.ts`.

Workspace config should mainly express:

- imported project configs
- workspace-level task aliases
- workspace-level flows that run project tasks

Workspace config currently works by importing project config values directly in TypeScript. That is deliberate. It does not require codegen first.

## Tasks, Flows, Targets, And Entrypoints

- task
  - the unit the CLI runs
  - examples: `dev:web`, `build:site`, `codegen:demo`
- flow
  - a generator-based task that orchestrates stable named steps and nested tasks
  - examples: `dev:full`, `dev:demo+forge`
- target
  - still the runtime binding shape used by adapters such as Bun
  - current Bun task helpers compile down to target-backed tasks internally
- entrypoint
  - the program module a runtime target executes
  - now has a preferred `defineEntrypointSpec(...)` + `implementEntrypoint(...)` surface

## Where Contracts And Specs Live

Preferred project layout:

- `src/contracts/`
- `src/entrypoints/`
- `src/runtime/`
- `src/tasks/` when task helpers are large enough to deserve their own modules
- `volt.config.ts`

Rules:

- domain contracts do not belong in `volt.config.ts`
- entrypoint specs do not belong in `volt.config.ts`
- `volt.config.ts` should stay focused on composition, orchestration, and high-level wiring

## Type Inference Today

`volt/contracts` is currently a TypeScript-first schema/value layer.

Implemented now:

- `t.string()`
- `t.number().int().min(...)`
- `t.boolean()`
- `t.literal(...)`
- `t.object(...)`
- `t.array(...)`
- `t.fn({ input, output })`
- `defineInterface(...)`
- `defineResource(...)`
- `defineContract(...)`

What is inferred purely in TypeScript today:

- object shapes
- function input/output types
- branded primitive types

What is not solved fully yet:

- lossless lowering into WIT or component-model artifacts
- automatic runtime validation
- automatic lowering/raising of rich resource semantics

That gap is intentional. Volt now has a cheap metadata/codegen path instead of pretending the full WASM story is already finished.

## Codegen And Integrations

There is now one concrete codegen path:

- `contractBindingsTask(...)` writes TypeScript metadata and optional JSON manifests from contract definitions

This is used in `apps/volt-demo` as `codegen:demo`.

What it proves:

- contracts can live outside config
- config can compose a codegen task
- generated outputs can be placed under `.volt/generated` and `.volt/state`
- the workflow is cheap enough to use before a full WIT/component pipeline exists

What it does not claim yet:

- it is not WIT generation
- it is not a full component ABI compiler
- it is not a deployment/runtime bridge by itself

## Flow Model

Preferred flow surface:

- `flow("name", function* (ctx) { ... })`
- `yield* ctx.step("name", fn)`
- `yield* ctx.memo("name", fn)`
- `yield* ctx.runTask("task:name")`
- `yield* ctx.runProjectTask("project", "task:name")`
- `yield* ctx.sleep("name", ms)`

What the generator model already buys:

- stable named steps
- persisted memoization for step outputs when a flow persists state
- nested orchestration over project tasks
- a plausible path toward richer resumable semantics later

What is still future work:

- durable distributed execution
- retries/backoff policies
- approvals/inboxes
- remote worker coordination

## Daemon Fit

The daemon remains workspace substrate.

It is still responsible for:

- workspace process state
- integration watches
- plugin daemon services
- status/logs

It is not yet the full flow engine.

The current model is:

- tasks and flows are the public execution API
- target-backed dev tasks ensure the workspace daemon is running
- richer durable orchestration can still layer above this later

## Old API To New API

Current compatibility map:

- `defineVoltConfig(...)`
  - still works
  - now normalizes into generated task names like `dev:web` and `build:web`
- `bunFullstackTarget(...)`, `bunServerTarget(...)`, `bunCommandTarget(...)`
  - still work
  - preferred new surface is `bunFullstackTask(...)`, `bunServerTask(...)`, `bunCommandTask(...)`
- `defineEntrypoint(import.meta, handler)`
  - still works
  - preferred new surface is entrypoint spec + implementation modules
- `defineFiber(...)` / `runFiber(...)`
  - still work
  - preferred new orchestration surface is `flow(...)`

## What Is Fully Implemented Now

- project configs with named tasks and defaults
- task-oriented CLI commands:
  - `volt task list`
  - `volt task run <name>`
- `volt dev` and `volt build` resolving through task defaults
- Bun task helpers
- workspace config with project composition and workspace-level flows
- a TypeScript-first contract/resource surface
- entrypoint spec + implementation authoring
- one real contract metadata codegen task

## What Is Compatibility Surface

- target-first `defineVoltConfig(...)`
- direct target helpers
- legacy entrypoint authoring with `defineEntrypoint(import.meta, ...)`
- legacy fibers

## What Is Still Scaffolding

- richer runtime/resource matching between entrypoint specs and concrete runtime service objects
- stronger inspect/debug tooling for resolved task graphs
- broader plugin/adapter libraries beyond Bun
- real WIT/WASM/component lowering
- durable execution beyond local persisted flow state
