# Loop Kit Agent Guide

## Required Session Memory

- Read `HANDOFF.md` before starting work. Treat it as external working memory,
  not optional documentation.
- Use `HANDOFF.md` to notice action triggers, current risks, active work, and
  mistakes future agents should avoid.
- Before ending a session, update `HANDOFF.md` if repo reality changed in a way
  that would help the next agent. If nothing material changed, leave it alone.
- Keep `HANDOFF.md` useful: remove stale notes, collapse resolved detail, and do
  not turn it into a transcript or duplicate task tracker.

## Repo Map

- `packages/common`: tiny shared primitives and reusable runtime utilities.
- `packages/interaction`: generic headless interaction runtime plus React
  bridge behind `@loop-kit/interaction/react`.
- `packages/dock`: headless Dock domain service, runtime, policies, state, and
  persistence.
- `packages/dock-react`: thin React bridge and rendering helpers for Dock.
- `.agents`: repo-local agent skills and reference material.
- `.codex`: Codex skills and automation instructions.
- `docs/references`: durable supporting docs that do not belong in a package.
- `prompts`: active work-in-progress prompts; archived prompts live in
  `prompts/archive`.

Keep this map structural and low-maintenance. Update it only when top-level
ownership or navigation changes, not for every file or short-lived task.

## Prompt Garden

- Active prompts live directly in `prompts/`.
- Archived prompts live in `prompts/archive/`.
- Every prompt starts with:

```md
---
status: ready | unready
last_reviewed: YYYY-MM-DD
---
```

- `ready` means the prompt is safe to run as-is.
- `unready` means the prompt is draft, blocked, stale, or needs more context.
- Active prompts should be fairly long, self-contained implementation briefs.
- Active prompts must not overlap with other active prompts. If work depends on
  another prompt, keep it separate and declare the dependency or blocker in
  frontmatter instead of duplicating the same scope.
- When a prompt becomes wrong or obsolete, update it, split it, archive it, or
  delete it. Do not maintain a separate prompt index unless it becomes clearly
  necessary.

## Installed Runtime Architecture

- Services own committed domain truth.
- Runtimes own lifecycle and time: root Run, installed modules, signals,
  session tasks, and cleanup.
- Installables own lifecycle-bound policies, effects, adapters, subscriptions,
  cross-runtime wiring, and cleanup. Install them onto runtimes and dispose
  them through leases.
- Bridges expose selected service/runtime surfaces to UI or external systems.
  Bridge providers must receive runtimes and services from high-level
  composition roots; do not hide runtime/service creation inside providers.
- UI components stay dumb: render state, accept callbacks/refs, and register
  targets through bridge hooks. They must not own cross-service behavior,
  install policies, create runtimes, or mutate services through hidden globals.
- Package services and runtimes into explicit environment objects for DI-style
  composition. Runtimes may own child runtimes and environment dependencies.
- Runtimes can have a root Run that spawns Tasks. Use Tasks/Runs for async,
  cancelable session work instead of ad hoc promise lifecycles.
- Signals are occurrences. Use `createSignal` for things that happened.
- Stores are current state. Use `createStore` for session/runtime state.
- Tasks and Runs own async, cancelable, session work.
- IRA means Installable Runtime Architecture or Installed Runtime Architecture.
  This repo is the reference implementation; examples must model it correctly.

## App Structure Guidance

- In `client`, `server`, and `shared`, prefer folders by responsibility:
  `domain` for types, schemas, commands, events, and policy contracts;
  `services` for service interfaces and implementations; `runtimes` or
  `runtime` for runtime creation and install bundles; `bridges` for React,
  DOM, API, or adapter wiring; and `components`/`ui` for dumb UI.
- Keep services and implementations grouped by domain area unless a file becomes
  genuinely too large.
- IRA applies on client and server. Do not treat React as the architecture
  boundary; React is one bridge over services and runtimes.

## Interaction Runtime Rules

- Keep `@loop-kit/interaction` generic.
- Do not add Dock, Skraps, clip, panel, asset, or app-specific behavior to the
  interaction core.
- Domain packages install policies into `InteractionRuntime`.
- React code belongs behind `@loop-kit/interaction/react`.
- Core exports must not import React.
- Provider and hook code should adapt runtime APIs, not own business logic.
- Target hierarchy is explicit through `parentId`; do not infer hierarchy from
  React trees.

## Common Primitive Guidance

- Prefer `@loop-kit/common` primitives over new local abstractions:
  `createRuntime`, `Installer`, `installed`, `installedVoid`, `createSignal`,
  `createStore`, `RuntimeLease`, `Lookup`, `Relation`, `Result`, and `Task`.
- Use `Result` for recoverable domain failures.
- Throw or assert only for programmer errors and invariant violations.
- Modify `packages/common` only for tiny broadly reusable primitives.

## Code Style

- Use interfaces for object contracts.
- Use type aliases for unions, brands, mapped types, and conditional utilities.
- Prefer arrow functions.
- Keep files readable top-down: module comment, imports, public contracts,
  public factories, internal helpers.
- Avoid hidden globals, broad framework abstractions, and provider-owned domain
  behavior.
