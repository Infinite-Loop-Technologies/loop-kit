# ARCHITECTURE.md

## What loop-kit is

`loop-kit` is a prototype monorepo for composable UI/runtime capabilities and the products built on top of them, especially Forge, Dock, Loom, and now Volt as the first serious host surface.

The repo is trying to grow reusable capability-oriented packages without letting demo-app shortcuts become permanent architecture. Volt now sits inside that effort as the platform-facing host and metaframework layer that can load artifacts, services, and future contract-driven runtime integrations.

## Current prototype boundary

- `apps/forge` is the main product-facing prototype.
- `apps/dock-demo` is the focused demo surface for dock behavior.
- `apps/loom-demo` is the focused demo surface for Loom concepts.
- `apps/volt-demo`, `apps/volt-site`, and `apps/volt-jco-demo` are the imported Volt proof surfaces.
- Forge and Loom now boot through Volt-managed Bun fullstack targets instead of Next.js/Vite-specific app runners.
- Dock Demo also now boots through Volt-managed Bun fullstack targets.
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
- Volt host model
- Forge relationship

## Current architectural bets

- Bun is the default repo runtime for scripts, tests, and small automation.
- Reusable packages should stay smaller, clearer, and less app-coupled than the demos built on top of them.
- Shared interaction behavior should live in reusable packages instead of being reimplemented per app.
- Forge should resolve product architecture pressure first and move toward clearer state, services, actions, commands, workflows, and provider boundaries rather than ad hoc demo wiring.
- Dock should prove real interaction behavior in `apps/dock-demo`, not only in package internals.
- Loom should stay themeable from the outside instead of choosing themes internally.
- Volt should stay Bun-native, explicit, and plugin-driven while absorbing loop-kit’s artifact and contract model instead of becoming a second disconnected platform.
- Volt’s daemon should be workspace-scoped infrastructure. Higher-level durable orchestration can then sit on top, rather than re-encoding daemon state inside ad hoc local watchers.

## Interaction runtime split

- `packages/interaction` is the headless interaction runtime for scopes, actions, shortcuts, surfaces, overlays, and drag sessions.
- `packages/interaction-react` is the React bridge for DOM ingress, scope registration, shortcut ingress, drag wiring, and overlay hosting.
- Apps should extend this shared runtime when interaction behavior is reusable instead of inventing app-local alternatives.

## Product pressure and proving grounds

- `apps/forge` is the main app where product architecture pressure should resolve first.
- `apps/dock-demo` is the proving ground for dock behavior and the new interaction runtime in practice.
- Reusable packages should be hardened through Forge and dock-demo pressure, then kept smaller and less app-coupled than those apps.

## Separation of concerns

- Providers are composition boundaries and bridges into UI frameworks.
- Services own durable stateful behavior and authoritative mutations.
- Actions represent semantic user intent.
- Commands are authoritative mutations against services/stores.
- Workflows own async or multi-step orchestration.
- Reusable interaction and dock policy should live in shared packages rather than being rebuilt per app screen.
- Prefer app-first service contracts and provider composition before promoting abstractions into shared packages.

## External interaction surfaces

- Embedded browser contexts, iframes, native webviews, extension outlets, and similar integrations are external interaction surfaces.
- External surfaces are not normal DOM. They may render in host-managed overlays, with their own hit-testing, compositor timing, and stacking behavior.
- UI components should not directly own native-surface lifecycle or policy. Treat those concerns as services/workflows provided near the app boundary.
- Shared packages may offer helpers for coordinating overlays, passthrough, and focus, but host-specific lifecycle should stay outside Loom primitives.

## Invariants / non-negotiables

- Packs, primitives, provider bridges, and reusable UI packages must not hardcode theme names, concrete theme package imports, or app-level CSS assumptions as part of their public behavior.
- Theme selection belongs to the app shell or outer Loom provider. Reusable packages may consume Loom context, but they must not choose the active theme for the caller.
- Headless packages must stay React-free unless React is the declared purpose of the package. `@loop-kit/interaction` and `@loop-kit/dock` are headless; `@loop-kit/interaction-react` and `@loop-kit/loom-pack-dock` are the React bridges.
- Providers must not become logic sinks. Keep policy, store logic, and orchestration outside provider components.
- Project support docs should stay lightweight. Durable repo-wide truth belongs here or in one obvious file under `references/`, not scattered across many linked notes.
- If a feature depends on external surfaces, model the capability explicitly instead of pretending CSS z-index and pointer-events are enough.

## Subsystem map

- `apps/forge`
  - Forge prototype app and the main place where product architecture pressure shows up first
- `apps/dock-demo`
  - dock-specific demonstration surface; should prove splitting, groups, layers, and drag/drop behavior
- `apps/loom-demo`
  - Loom-focused demo surface
- `apps/volt-demo`
  - Volt browser/server demo showing multi-target local orchestration
- `apps/volt-site`
  - Volt product/site surface and narrative shell
- `apps/volt-jco-demo`
  - Volt integration demo for generated bindings and JCO-style artifact flows
- `packages/dock`
  - headless dock model and behavior
- `packages/interaction`
  - headless interaction runtime for scopes, actions, shortcuts, surfaces, drag sessions, overlays, and command bus facades
- `packages/interaction-react`
  - React bridge for interaction providers, scope registration, DOM ingress, and overlay hosts
- `packages/loom-pack-dock`
  - React bridge and Loom-facing dock integration
- `packages/loom-*`
  - Loom contracts, renderer, packs, and themes
- `packages/state`
  - emerging shared state package; useful for simplifying Forge architecture
- `packages/volt`
  - Bun-native host/metaframework for coordinating targets, integrations, and daemon-style services
- `packages/create-volt`
  - scaffolder for Volt starter templates
- `tools/`
  - top-level Bun scripts for repo automation, including Volt package publishing
- `experiments/`
  - prototype labs and notes that are not yet stable package architecture

## Open architectural tensions

- how much of Forge should remain demo-oriented versus hardened into reusable product architecture
- how Dock layering/group policy should surface across headless and React integration boundaries
- how loop-kit's registry/artifact/contract model should map into Volt integrations and daemon services
- how Resonate should layer on top of Volt for durable AI workflows, waits, approvals, and background jobs without making the local daemon itself too magical
- how much reference/process material the repo should keep before it becomes maintenance overhead
- how aggressively to promote experiment/package ideas into durable architecture docs

## Terms / glossary

- `slice`
  - the smallest coherent unit of work worth tracking across Git, validation, and blockers
- `pack`
  - a reusable higher-level unit that composes lower-level Loom capabilities
- `theme agnostic`
  - configurable by the caller without the reusable package choosing the concrete theme
