# Dock Integration

Use this note when changing `packages/dock`, `packages/loom-pack-dock`, or `apps/dock-demo`.

## Package boundaries

- `packages/dock`
  - headless dock state, service, commands, selectors, controller, policy, and drop resolution
  - depends on `@loop-kit/interaction` and `@loop-kit/state`
  - must stay React-free
- `packages/loom-pack-dock`
  - React/Loom bridge
  - owns `DockProvider`, `DockStage`, panel rendering, scoped regions, drag source and drop surface registration
- `apps/dock-demo`
  - proving ground for dock behavior
  - should demonstrate real panel splitting, layer behavior, policy boundaries, and drag/drop outcomes

## How Dock uses the interaction runtime

Dock does not own a second shortcut or drag runtime.

The split is:

- interaction runtime
  - scope hierarchy
  - shortcut dispatch
  - drag session and overlay lifecycle
- dock package
  - dock-specific actions and commands
  - panel/group/layer state
  - policy checks
  - drop resolution
- loom-pack-dock
  - bridge between drag sessions and dock commands

In practice:

1. `DockProvider` creates a dock command bus.
2. `InteractionProvider` receives that command bus.
3. `DockRuntimeBridge` listens to drag events from the interaction runtime.
4. Dock resolves the drop and returns a command plus overlay metadata.
5. The bridge dispatches the command on drop end.

## Scope registration in Dock

`loom-pack-dock` registers nested scopes for:

- stage
- layer
- group
- panel

This keeps shortcuts and overlays scoped to where the user is actually working.

Rule:

- register scopes at real interaction boundaries, not every purely visual wrapper

## Keyboard ingress and layer behavior

Modal layers should block global shortcuts and dismiss through the shared runtime.

Current pattern:

- modal layer registers a scoped Escape shortcut
- dismiss resolves to a dock action
- the action becomes a dock command

Passthrough overlays should remain interactive without blocking the background.

Rule:

- layer interaction semantics belong to dock policy and interaction capabilities, not one-off DOM listeners

## Actions vs commands in Dock

- actions
  - semantic intents such as `dock.dismiss-layer`
  - useful for keyboard and higher-level UI triggers
- commands
  - authoritative mutations such as `dock.open-panel`, `dock.split-panel`, `dock.close-panel`
- service
  - `createDockService(...)`
  - the headless authority over dock state transitions

Rule:

- add a dock action only when you need a semantic intent boundary
- add a dock command when you need a new authoritative mutation

## Policy and families

Dock policy decides whether a drop is legal.

Use panel or group metadata for stable policy inputs such as:

- family
- accepted kinds
- never-split panels
- layer constraints

Do not encode these checks ad hoc in React components.

## What belongs where

- `packages/dock`
  - reusable state transitions
  - policy resolution
  - selectors
  - command types
- `packages/loom-pack-dock`
  - rendering
  - scoped-region wiring
  - drag/drop bridge code
  - panel registry integration
- `apps/dock-demo`
  - sample groups, panels, and layers
  - demonstrations of supported behavior
  - no reusable dock policy hidden only in the demo

## Demo bar

`apps/dock-demo` should prove:

- tab drag and reattach
- split edges and resize behavior
- non-interoperable groups
- modal overlay layers
- passthrough peek layers

If the package claims a behavior, the demo should make it visible.
