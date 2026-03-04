# Loop Kernel Architecture (v0)

## Provider Host Lifecycle

1. Kernel starts and registers built-in providers:
    - lanes: `local`, `file`, `git` stub, `http` stub
    - toolchain: `typescript`
2. Kernel loads `loop.json` and reads `modules[]`.
3. For each enabled module ref:
    - resolve module manifest (`loop.module.json`)
    - dynamic import module entry
    - call exported provider registration hook
4. Providers are registered by capability (`lane-provider`, `patch-adapter`, `toolchain-adapter`).
5. CLI commands call kernel APIs; kernel delegates to the appropriate provider by capability + id.

## Patch Plan Lifecycle

1. A command/rule builds a `PatchPlan` (operations + provenance).
2. Patch executor loads files into an in-memory buffer.
3. Operations run deterministically in order and mutate buffered content.
4. Executor collects per-op results, diagnostics, and unified diffs.
5. `--dry-run` returns previews only.
6. Apply mode writes changed files transactionally (best-effort rollback on write failure).
7. Component installs/updates persist lock metadata in `loop/installs/components.lock.json`.

## Graphite Compatibility Seams

- Loop patch IR is filesystem/workspace-centric and remains independent in v0.
- Provider and precondition boundaries are JSON-safe and contract-based, so guard/policy systems can be adapted later.
- Selector/query targeting can be bridged in a future adapter package without changing CLI/kernel command contracts.
