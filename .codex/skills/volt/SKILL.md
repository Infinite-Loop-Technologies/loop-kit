---
name: volt
description: Use for Volt tasks and Volt questions in this repo: `volt.config.ts`, entrypoints, runtimes, daemon behavior, integrations, workflow/agent design, and current Volt architecture. Treat this skill as the current Volt docs surface. If you change Volt itself, update this skill in the same slice so it stays in sync with the code.
---

# Volt

Use this skill whenever work touches Volt source, Volt app configs, Volt entrypoints, Volt integrations, the Volt daemon, or questions about Volt's intended direction in this repo.

## Start Here

Read the smallest useful set of files first:

- `packages/volt/src/contracts.ts`
- `packages/volt/src/plugins/bun/plugin.ts`
- `packages/volt/src/daemon.ts`
- `references/project-volt-daemon.md`
- `references/project-volt-authoring.md`
- the relevant `volt.config.ts`
- the relevant entrypoint module

Use CKB early for non-trivial Volt work.

## Current Model

- Volt should feel small:
  - entrypoint
  - task
  - flow
  - artifact
  - integration
  - process/resource
  - project config
  - workspace config
- Prefer project configs with `defineProjectConfig(...)`.
- Prefer Bun runtime bindings with:
  - `bunFullstack(...)`
  - `bunServer(...)`
  - `bunCommand(...)`
- Prefer `defineRuntimeInputs(...)` for serializable config-time runtime values.
- Prefer `flow(...)` for orchestration over named tasks, readiness, concurrency, joins, races, waits, and cleanup.
- `defineVoltConfig(...)`, direct target helpers, `defineServices(...)`, `defineFiber(...)`, and `createBunPlugin()` are compatibility surfaces.
- Prefer importing entrypoint values directly into config instead of passing only source strings.
- Runtime selection belongs in config, not inside the entrypoint module.
- Bun runtime services currently provide built-in capabilities such as `env.read`, `env.require`, filesystem helpers, logging, and root-relative paths.
- Runtime topology is one of Volt’s main reasons to exist. Prefer managed processes/resources with explicit readiness over shell-ordering tricks.
- The workspace daemon now owns Parcel-watcher snapshots, lightweight affected-task invalidation, and shared resource/status state.
- Dev Bun targets now execute from the workspace root so Bun watch mode can see sibling workspace packages; Volt passes `VOLT_ROOT_DIR` for per-project runtime services.
- `volt dashboard` / `volt ui` is the experimental keyboard-first OpenTUI UI over daemon state; it is a consumer of the runtime model, not a replacement for it.
- Effect is internal-only. Do not expose Effect-shaped APIs in Volt’s public story.
- Current docs front doors:
  - `references/project-volt-project-model.md`
  - `references/project-volt-authoring.md`
  - `references/project-volt-daemon.md`
  - `references/project-volt-technology-choices.md`

## Agent / Workflow Direction

- Model tools as small owned process/runtime helpers first, not as giant abstract capability systems.
- Keep runtime inputs narrow and serializable.
- Keep durable boundaries explicit. Resonate-like workflow semantics belong around sleeps, waits, RPC/task dispatch, approvals, retries, and resumable steps.
- The current fiber runner is local and optional-persistence only. Treat it as the prototype programming model, not the final durability story.
- Do not pretend Volt already has a finished durable workflow API. Check `references/project-volt-project-model.md` first, then `references/project-volt-authoring.md` for deeper background.

## When Changing Volt

If you change Volt source in a way that affects authoring, runtime behavior, daemon behavior, or architecture:

1. Update this skill in the same slice.
2. Update at least one relevant repo reference doc or checklist item.
3. Keep the skill concise; put deeper design notes in `references/`.

## Notes

- This skill is the lightweight docs front door for Volt in this repo.
- More detailed or unsettled material should live in `references/` and `CHECKLIST.md`, not be copied into this file.
