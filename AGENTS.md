# Loop Kit Agent Guide

## Installed Runtime Architecture

- Services own committed domain truth.
- Runtimes own lifecycle and time: root Run, installed modules, signals,
  session tasks, and cleanup.
- Bridges expose selected service/runtime surfaces to UI or external systems.
- Signals are occurrences. Use `createSignal` for things that happened.
- Stores are current state. Use `createStore` for session/runtime state.
- Tasks and Runs own async, cancelable, session work.

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
