# ARCHITECTURE.md

## What loop-kit is

`loop-kit` is a prototype monorepo for composable UI/runtime capabilities and the products built on top of them, especially Forge, Dock, and Loom.

The repo is trying to grow reusable capability-oriented packages without letting demo-app shortcuts become permanent architecture.

## Current prototype boundary

- `apps/forge` is the main product-facing prototype.
- `apps/dock-demo` is the focused demo surface for dock behavior.
- `apps/loom-demo` is the focused demo surface for Loom concepts.
- `packages/` holds the reusable runtime, UI, and bridge packages.
- `tools/` holds lightweight Bun-first repo automation.
- `experiments/` holds smaller prototype labs that are not yet promoted into product/package architecture.

## Core concepts

- artifact kinds
- WIT contracts
- providers
- grants
- host/kernel
- registry model
- Forge relationship

## Current architectural bets

- Bun is the default repo runtime for scripts, tests, and small automation.
- Reusable packages should stay smaller, clearer, and less app-coupled than the demos built on top of them.
- Forge should move toward clearer state, services, commands, and provider boundaries rather than ad hoc demo wiring.
- Dock should prove real interaction behavior in `apps/dock-demo`, not only in package internals.
- Loom should stay themeable from the outside instead of choosing themes internally.

## Invariants / non-negotiables

- Packs, primitives, provider bridges, and reusable UI packages must not hardcode theme names, concrete theme package imports, or app-level CSS assumptions as part of their public behavior.
- Theme selection belongs to the app shell or outer Loom provider. Reusable packages may consume Loom context, but they must not choose the active theme for the caller.
- Headless packages must stay React-free unless React is the declared purpose of the package. `@loop-kit/dock` is headless; `@loop-kit/loom-pack-dock` is the React bridge.
- Project support docs should stay lightweight. Durable repo-wide truth belongs here or in one obvious file under `references/`, not scattered across many linked notes.

## Subsystem map

- `apps/forge`
  - Forge prototype app and the main place where product architecture pressure shows up first
- `apps/dock-demo`
  - dock-specific demonstration surface; should prove splitting, groups, layers, and drag/drop behavior
- `apps/loom-demo`
  - Loom-focused demo surface
- `packages/dock`
  - headless dock model and behavior
- `packages/loom-pack-dock`
  - React bridge and Loom-facing dock integration
- `packages/loom-*`
  - Loom contracts, renderer, interactions, and themes
- `packages/state`
  - emerging shared state package; useful for simplifying Forge architecture
- `tools/`
  - top-level Bun scripts for repo automation
- `experiments/`
  - prototype labs and notes that are not yet stable package architecture

## Open architectural tensions

- how much of Forge should remain demo-oriented versus hardened into reusable product architecture
- how Dock layering/group policy should surface across headless and React integration boundaries
- how much reference/process material the repo should keep before it becomes maintenance overhead
- how aggressively to promote experiment/package ideas into durable architecture docs

## Terms / glossary

- `slice`
  - the smallest coherent unit of work worth tracking across Git, validation, and blockers
- `pack`
  - a reusable higher-level unit that composes lower-level Loom capabilities
- `theme agnostic`
  - configurable by the caller without the reusable package choosing the concrete theme
