# Volt Authoring And Workflow Direction

This note captures the current authoring model for Volt in `loop-kit` and the main design gaps that still block the more powerful workflow/effect model.

For the current preferred public shape, read `references/project-volt-project-model.md` first. This file now mainly explains the older prototype path and the design pressure that led to the new task/project/workspace model.

## Current decisions

- The Volt daemon is workspace substrate, not the agent brain.
- Runtime choice belongs in `volt.config.ts`.
- Entrypoints should be authored as typed entrypoint objects with `defineEntrypoint(import.meta, handler)`.
- `volt.config.ts` should prefer importing entrypoint objects directly instead of only passing relative string paths.
- Bun targets now have direct creator functions:
  - `bunFullstackTarget`
  - `bunServerTarget`
  - `bunCommandTarget`
- `createBunPlugin()` remains available, but it is now the compatibility/grouped style.
- Volt now has an experimental config-to-entrypoint service model via `defineServices(...)`.
- Volt now has an experimental artifact/value graph via config `artifacts`.
- Volt now has an experimental generator-based workflow API via `defineFiber(...)` and `runFiber(...)`.
- Built-in Bun services provide basic runtime capabilities such as:
  - `env.read`
  - `env.require`
  - filesystem helpers
  - logging
  - root-relative path helpers

## What this fixes

This removes the old split where:

- `volt.config.ts` chose a runtime target
- the entrypoint module also had to opt into a runtime wrapper such as `bunFullstackApp(...)`

That split was the main obstacle to making entrypoints feel like reusable typed programs with requirements while keeping runtime choice in config.

The new prototype also fixes part of the next gap:

- config can now provide typed serializable service objects into runtime entrypoints
- targets can now consume config-defined artifact values before they run
- generator-style workflows now exist as a reusable local primitive instead of only being an architectural note

## Current prototype surfaces

### 1. Config-provided services

Volt now supports:

- `defineServices(({ artifacts, integrations, ...context }) => ({ ... }))`
- target options like `services: defineServices(...)`

Current behavior:

- providers run at target build/dev time
- provider outputs are written under `.volt/state/services/<target>.json`
- generated runtime bootstraps load those provided values and merge them with the base runtime services

Current limitation:

- this is intentionally a serializable-value model for now
- config-defined providers do not yet mount arbitrary non-serializable runtime implementations directly

That limitation is acceptable for the current slice because it is enough for config contracts, env/config objects, URLs, ports, feature flags, and artifact-derived values.

### 2. Artifacts

Volt now supports config-defined artifacts:

```ts
artifacts: {
  runtimeSession: defineArtifact({
    kind: "runtime-session",
    async build(context) {
      return { value: ... };
    },
  }),
}
```

Targets opt into artifact consumption with:

```ts
artifacts: ["runtimeSession"]
```

Current behavior:

- artifacts resolve before targets run
- artifact values and metadata are written under `.volt/state/artifacts/<name>.json`
- service providers can read them through `artifacts.require(...)` and `artifacts.requireValue(...)`

This is the first real step from pure ordering into dataflow.

### 3. Fibers

Volt now has:

- `defineFiber(...)`
- `runFiber(...)`

Current behavior:

- fibers are generator-based
- named steps are memoized
- if a `statePath` is provided, step results and final output are persisted to JSON
- the same API works as a local programming utility even without a durable backend

This is intentionally close to the Resonate mental model:

- explicit steps
- replay/memoization boundary per named step
- optional persistence

Current limitation:

- there is no daemon worker orchestration, approvals, retries, or remote durable engine backing yet
- this is a local prototype of the programming model, not the final orchestration system

## What still blocks the more powerful design

Volt still does not have first-class support for:

1. Non-serializable runtime service provisioning from config into entrypoints
2. A proper effect model
3. Durable workflow/fiber execution for dev/build/agents
4. A richer value-flow graph between targets, artifacts, and integrations
5. A settled artifact/binding model for local and external WASM components

More concretely:

- service providers are serializable-value only for now.
- artifact dependencies exist, but targets still only have `dependsOn` rather than a fully unified graph model.
- integrations and artifacts still live as separate concepts and have not yet been unified under one clearer user-facing layer.
- there is no first-class “agent message input”, “approval wait”, “sleep”, “rpc”, or “task dispatch” Volt workflow layer yet.
- generated runtime bootstraps still embed absolute app-local paths, which is acceptable for the prototype but not the final deployment story.

## Resonate options

There are four realistic ways to use Resonate here.

### 1. Volt-owned workflow API on top of Resonate

This is the recommended direction.

- Volt exposes its own workflow/effect/fiber API.
- Resonate provides durable execution under the hood.
- Volt keeps control over authoring style, plugins, requirements, and daemon integration.

This gives Volt a stable authoring surface while still borrowing the durability model and generator-based step semantics.

### 2. Volt workflow API with optional direct Resonate escape hatches

This is also reasonable.

- Most users stay inside Volt APIs.
- Advanced users can reach raw Resonate handles where needed.

This is likely the best medium-term compromise if Volt wants to stay extensible without hiding too much.

### 3. Encourage direct Resonate usage as a normal dependency

This is useful for experiments, but not as the main story.

- It fragments the authoring model.
- It weakens Volt’s ability to provide uniform plugin/runtime behavior.
- It pushes too much durable execution detail into app code.

### 4. Use Resonate only internally

This is the least desirable long-term option.

- It makes Volt workflows magical.
- It hides the operational model too much.
- It makes it harder for users to reason about durability and replay boundaries.

## Recommendation

Treat Resonate as the durable engine for a Volt-owned workflow API.

That API should probably introduce:

- services
- effects
- fibers or workflows
- agents as workflows that can expose effects as tools

The key semantic split should be:

- services are ephemeral and plugin-mounted
- effects are explicit invocation boundaries
- workflows/fibers are resumable programs
- agents are workflows with model orchestration and tool exposure

## Target and entrypoint direction

The long-term goal should be:

- entrypoints express requirements and program shape
- targets choose runtime, platform, and provisioning strategy
- the same entrypoint can be reused across multiple targets when the target can satisfy its requirements

This is the important conceptual split:

- entrypoint = typed program
- target = host/runtime binding

## WASM / bindings direction

The current working distinction should be:

1. External artifact integration
2. Local target-produced artifact

For external artifacts:

- integrations should generate bindings, manifests, and any runtime loading glue
- consuming targets should import generated modules as normal code

For locally produced artifacts:

- Volt still needs a clearer artifact model
- target outputs and integration outputs should not be conflated
- there likely needs to be a first-class produced-artifact layer or a richer integration/output graph

This is still unsettled and should stay in `references/` until the model is clearer.

## Next prototype slices

1. Add a first-class service token/provider model for entrypoint requirements.
2. Add effect primitives on top of the current fiber runner rather than letting users hand-roll every step shape.
3. Let the daemon host workflow workers, approval inboxes, and runtime state once the authoring model is clear.
4. Add a clearer unified artifact/binding graph for WASM, generated modules, and target-produced values.
5. Add a Volt inspect surface so config, target graphs, env, integrations, artifacts, and workflow state are visible.
