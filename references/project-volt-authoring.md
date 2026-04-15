# Volt Authoring

Read `references/project-volt-project-model.md` first. This note is the practical authoring companion.

## Authoring Rules

- Prefer `defineProjectConfig(...)` over `defineVoltConfig(...)`.
- Prefer runtime bindings over hand-authored target objects.
- Keep contracts, specs, and runtime code in normal TypeScript modules.
- Keep `volt.config.ts` and `volt.workspace.ts` focused on composition and orchestration.
- Prefer plain named functions over builder-heavy DSLs.
- Do not let `volt.config.ts` become a giant implementation file; push real logic into nearby modules and keep config declarative.

## Recommended Project Layout

- `src/contracts/`
- `src/entrypoints/`
- `src/runtime/`
- `src/dev/`
  - only when the project really needs local setup helpers
- `volt.config.ts`

## Runtime Bindings

Use one binding instance, then derive named tasks from it.

The binding options now carry the metadata the daemon and affected-task layer need:

- `runtimeInputs`
- `readiness`
- `inputs`
- `watch`
- `outputs`
- `artifacts`
- `uses`

That keeps the public story concrete:

- what this task depends on
- what it watches
- what it produces
- what runtime values it needs
- what it waits for before it is considered ready

## Flow Guidance

Use `flow(...)` when orchestration is real. Flows are plain async functions with a Volt context; Volt no longer expects generator-based authoring.

Preferred primitives:

- `await ctx.runTask(...)`
- `await ctx.runProjectTask(...)`
- `await ctx.step(...)`
- `await ctx.memo(...)`
- `await ctx.fork(...)`
- `await ctx.forkTask(...)`
- `await ctx.join(...)`
- `await ctx.all(...)`
- `await ctx.race(...)`
- `await ctx.waitFor(...)`
- `await ctx.release(...)`
- `await ctx.log(...)`

Use them for:

- starting multiple resources
- waiting for readiness
- racing helpers
- keeping cleanup explicit
- composing project-to-project topologies in the workspace

Do not use flows just to wrap a single async function.

## Agent Workflow Guidance

If Volt adds first-class agent workflows, author them with the same discipline:

- config wires the workflow into the project or workspace
- prompts, policies, schemas, and orchestration helpers live in normal modules
- agent workflows call named Volt tasks/flows instead of re-embedding `dev`, `build`, `lint`, or `test` logic inside prompts
- approval and user-input boundaries stay explicit
- structured logs/events are required; plain terminal transcripts are not enough

For simple local AI automation, config wiring may be enough. For anything non-trivial, keep the workflow implementation out of `volt.config.ts`.

## Runtime Inputs

Preferred names:

- `runtimeInputs`
- `defineRuntimeInputs(...)`

Compatibility only:

- `defineServices(...)`

The preferred values are concrete:

- ports
- URLs
- health endpoints
- generated module paths
- browser config
- emulator endpoints
- local tokens or tunnel URLs when needed

## Topology Example

The flagship example in `apps/volt-demo` should read as:

1. Build a `runtimeSession` artifact.
2. Use it to derive typed runtime inputs.
3. Start `dev:game`.
4. Wait for the managed process to become ready.
5. Start `dev:web`.
6. Wait for its readiness.
7. Keep both handles under the same flow-owned lifecycle.

That is the intended value proposition. The config should show the topology directly instead of burying it in shell scripts.

The same principle should hold for future agent workflows: the config should show what the agent owns, depends on, and may invoke, instead of hiding the shape in a giant prompt.

## Emulator / External Tool Pattern

The intended pattern for emulators, tunnels, webhook forwarders, and similar tools is:

- model them as named tasks, artifacts, or integrations
- own the process lifecycle through Volt
- expose outputs through runtime inputs or artifact metadata
- do not pretend Volt itself owns the external product

## AST / Codegen Strategy

Volt is not building a generic AST framework.

Use:

- OXC for fast parse/analysis or validation passes
- recast when Volt must preserve formatting during rewrites
- ts-morph for narrow TS-aware generation and inspection

The current concrete path is `contractBindingsTask(...)`:

- generate the TypeScript module with ts-morph
- syntax-check the result with OXC
- write the cheap manifest beside it

That keeps codegen cheap and explicit without inventing another abstraction layer.

## Effect Stance

Effect is allowed internally where it genuinely helps:

- scopes
- cancellation
- cleanup ordering
- supervision

Do not push it into Volt app authoring. Volt’s public API remains Volt-native and generator-first.
