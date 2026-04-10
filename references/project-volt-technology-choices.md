# Volt Technology Choices

## Bun Process APIs

Volt uses Bun-native process/runtime primitives because runtime topology is a core product concern.

Why:

- direct control over child processes and streams
- low-friction Bun-to-Bun execution
- one runtime for local scripts, builds, and app processes
- fewer adapters between the library and the CLI/daemon

Current usage:

- `Bun.spawn`
- Bun build/runtime entrypoints
- readiness over captured stdout/stderr and runtime metadata

## @parcel/watcher

Volt uses `@parcel/watcher` for the lightweight affected-task layer.

Why:

- recursive watching
- coalesced event delivery
- snapshots with `writeSnapshot(...)`
- incremental startup via `getEventsSince(...)`
- practical ignore pattern support

This is enough for Volt’s local invalidation story without turning Volt into a giant monorepo scheduler.

## Effect

Effect is internal-only in Volt.

Why:

- useful for cleanup ordering, scopes, supervision, and cancellation
- not desirable as the public user mental model for Volt authoring

Rule:

- use Effect internally when it removes complexity
- do not export “Effect with different names”

## AST / Codegen Split

Volt’s default split is:

- OXC
  - fast parse/analysis
  - syntax validation for generated code
- recast
  - formatting-preserving rewrites when Volt edits existing user files
- ts-morph
  - narrow TS-aware generation or inspection
- SWC
  - not part of the default Volt path in this slice

Current real usage:

- `contractBindingsTask(...)` uses ts-morph for generation and OXC to validate the generated TypeScript before writing it

## OpenTUI

OpenTUI is included because Volt wants a real runtime UX, not just shell text.

Role:

- consume structured daemon state
- show multiple resources and statuses
- surface recent logs and invalidations
- provide the path toward richer task/resource views

The dashboard remains experimental, but the event/status model it consumes is part of the real product direction.

## Proto

Proto remains the repo-level toolchain bootstrap mechanism.

Volt’s stance:

- work well inside Proto-managed environments
- do not compete with Proto
- do not make Volt depend on a second tool bootstrap story
