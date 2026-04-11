# Interaction Runtime

Use this note when the work touches scopes, actions, shortcuts, surfaces, drag/drop, or overlays.

## Package boundaries

- `packages/interaction`
  - headless runtime state and dispatch
  - scope hierarchy
  - shortcut matching
  - action handler resolution
  - drag session state
  - overlay state
- `packages/interaction-react`
  - React and DOM bridge
  - `InteractionProvider`
  - `ScopedRegion`
  - scope registration hooks
  - keyboard ingress and pointer ingress
  - overlay host rendering
- App code
  - declares app-specific action ids, shortcut maps, and feature-level handlers
  - should not fork a second interaction runtime unless the shared runtime is actually insufficient

## Runtime shape

The shared mental model is:

1. Register a scope hierarchy.
2. Register actions and shortcuts inside scopes.
3. Feed keyboard/pointer ingress into the runtime once.
4. Let actions resolve against the active scope path.
5. Let commands or feature logic perform the authoritative mutation.

`packages/interaction` owns steps 2 through 4.
`packages/interaction-react` owns step 1 and browser ingress.

## Scope registration and hierarchy

Scopes are nested regions with optional capabilities.

- use `ScopedRegion` for visible UI regions that should participate in focus and active-scope routing
- use `useRegisterScope(...)` for non-component registration cases
- parent scope is inherited from context unless explicitly overridden
- scope capabilities such as `modal`, `textInput`, and `blocksGlobalShortcuts` shape shortcut resolution

Simple example:

```tsx
<ScopedRegion scopeId="forge-root" scopeKind="forge-root">
  <ScopedRegion scopeId="forge-workspace" scopeKind="forge-workspace">
    <WorkspaceShell />
  </ScopedRegion>
</ScopedRegion>
```

Rule:

- prefer a small number of meaningful scopes over one scope per tiny visual element

## Keyboard ingress and scoped shortcuts

`InteractionProvider` already wires document-level keyboard and pointer ingress.

- `keydown` becomes a normalized gesture
- the runtime checks the active scope path from inner to outer
- bindings can be disabled in text inputs unless `allowInTextInput` is set
- modal paths and `blocksGlobalShortcuts` prevent accidental global fallback

Register shortcuts close to the feature or bridge that owns them:

```tsx
useScopedShortcutMap([
  { actionId: forgeActionIds.toggleCommandPalette, gesture: "Mod+K" },
  { actionId: forgeActionIds.toggleInspector, gesture: "Mod+Shift+I" },
]);
```

Rule:

- shortcut registration belongs with the scope or feature boundary, not buried in generic providers

## Actions vs commands vs workflows

- actions
  - semantic user intents
  - examples: `forge.command-palette.toggle`, `dock.dismiss-layer`
- commands
  - authoritative mutations against a service or store
  - examples: `dock.open-panel`, `dock.split-panel`
- workflows
  - async or multi-step orchestration that may call commands and services
  - examples: setup flows, fetch-and-open flows, runtime startup flows

Do not use actions as the mutation layer. Do not use commands as a catch-all orchestration layer.

## Providers vs services vs policy vs store

- provider
  - bridge into React composition
  - owns wiring, context, and lifecycle
- service
  - stateful capability with public operations
  - often backed by a store
- policy
  - decision rules that determine what is allowed
  - examples: which panels can attach, which groups can split
- store
  - authoritative local state container

Rule:

- providers should wire services and runtime context, not become the place where policy and product logic accumulate

## Drag, drop, surfaces, overlays

Use the shared hooks from `interaction-react`:

- `useRegisterSurface(...)`
- `useRegisterDropSurface(...)`
- `useRegisterDragSource(...)`
- `InteractionOverlayHost`

The runtime owns:

- current drag session
- active drop surface
- overlay position

The feature owns:

- payload shape
- policy resolution
- mutation after drop

That split is what Dock uses.

## TUI reuse direction

Keep reusable interaction semantics headless.

- scope hierarchy
- action dispatch
- shortcut resolution
- drag session state

Renderer-specific ingress belongs in a bridge package:

- React/browser ingress lives in `packages/interaction-react`
- future TUI ingress should follow the same pattern instead of duplicating runtime semantics in app code
