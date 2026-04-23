# Dockyard Agent Guide

## Purpose

Dockyard is a Bun monorepo for a registry-driven Dock ecosystem. It separates small stable packages from installable editable source items and uses `apps/registry` as the public docs and showcase surface.

## Repo Structure

- `apps/registry` -> public site, docs, registry browsing, and registry endpoints
- `packages/common` -> small reusable primitives
- `packages/dock-core` -> headless dock engine boundary
- `packages/dock-react` -> React bridge only
- `packages/loom` -> experimental runtime and theming research
- `registry/items` -> installable editable source items
- `examples/dock-demo` -> tiny direct package usage example

## Decision Rule

- Put code in packages when it is stable, reusable, and boundary-worthy.
- Put code in registry items when it is app-facing, installable source, editable UI, or policy-heavy glue.

## Where Should This Code Go?

- `packages/common` -> small reusable primitives
- `packages/dock-core` -> headless dock engine, model, and types
- `packages/dock-react` -> React bridge only
- `packages/loom` -> experimental runtime and theming research
- `registry/items` -> installable editable app-facing code
- `apps/registry` -> public site, docs, and showcase

## Runbook

- `bun install`
- `bun run dev`
- `bun run build`
- `bun run check`

## Change Expectations

- Keep changes scoped and intentional.
- Prefer simple architecture over clever layering.
- Prefer editing existing files over adding framework sprawl.
- Verify work before asking for review.

## Package Constraints

- Keep `dock-core` headless.
- Keep `dock-react` thin.
- Keep `common` small.
- Keep `loom` experimental unless explicitly expanded.

## Git Workflow

- Prefer scoped branches and a Git-based workflow.
- Do not push directly to `main`.
