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

- Volt entrypoints should be authored with `defineEntrypoint(import.meta, handler)`.
- Prefer importing entrypoint objects directly into `volt.config.ts` instead of passing only string source paths.
- Runtime selection belongs in `volt.config.ts`, not inside the entrypoint module.
- For Bun targets, prefer direct target creators such as `bunFullstackTarget`, `bunServerTarget`, and `bunCommandTarget`.
- `createBunPlugin()` still exists for grouped `bun.fullstack(...)` style, but it is now the compatibility surface, not the preferred docs surface.
- Config can now provide serializable service values into entrypoints with `defineServices(...)`.
- Config can now define value-producing `artifacts` that resolve before targets and can be consumed by service providers.
- Volt now has an experimental generator-based workflow utility via `defineFiber(...)` and `runFiber(...)`.
- Bun runtime services currently provide built-in capabilities such as `env.read`, `env.require`, filesystem helpers, logging, and root-relative paths.
- The workspace daemon is substrate infrastructure. Future durable workflows, effect systems, and agents should layer above it rather than being fused into the daemon itself.

## Agent / Workflow Direction

- Model tools as effects first. A tool is an effect exposed to a model.
- Keep service dependencies ephemeral and mounted by Volt/plugin infrastructure.
- Keep durable boundaries explicit. Resonate-like workflow semantics belong around sleeps, waits, RPC/task dispatch, approvals, retries, and resumable steps.
- The current fiber runner is local and optional-persistence only. Treat it as the prototype programming model, not the final durability story.
- Do not pretend Volt already has a finished durable workflow API. Check `references/project-volt-authoring.md` for the current recommendation and open questions.

## When Changing Volt

If you change Volt source in a way that affects authoring, runtime behavior, daemon behavior, or architecture:

1. Update this skill in the same slice.
2. Update at least one relevant repo reference doc or checklist item.
3. Keep the skill concise; put deeper design notes in `references/`.

## Notes

- This skill is the lightweight docs front door for Volt in this repo.
- More detailed or unsettled material should live in `references/` and `CHECKLIST.md`, not be copied into this file.
