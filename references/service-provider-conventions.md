# Service And Provider Conventions

Use this as the lightweight repo-level reference for app-facing architecture, especially in prototypes that are likely to become reusable later.

## App shape

Prefer this shape when an app has real behavior:

- `app/`
  - shell composition
  - provider composition
- `services/`
  - app-first service contracts
  - host-specific implementations
- `providers/`
  - bridge layers that provide app deps and runtime adapters
- `actions/`
  - semantic user intents and command-palette metadata
- `commands/`
  - authoritative mutations against stores/services
- `workflows/`
  - async or multi-step orchestration
- `features/`
  - domain slices that compose hooks, policy, and view models
- `ui/`
  - presentational composition and Loom-facing components

Do not create empty taxonomy. Collapse folders when a concept only needs one small file.

## Services

- Start with app-first contracts. Extract to shared packages only after the shape survives real use.
- Services are imperative libraries with durable behavior and host knowledge.
- Provide implementations near the app boundary, not from leaf components.
- Leaf UI should consume hooks, view models, or narrow feature APIs instead of raw services.

## External surfaces

- Native webviews, iframes, extension outlets, and similar embeds are external interaction surfaces.
- External surfaces are not normal DOM. They may be host-managed overlays with separate hit-testing and compositor timing.
- Model them as services with explicit capabilities and typed operations.
- Keep attach/show/hide/navigate/passthrough/sync/dispose policy out of leaf UI.
- Use workflows or runtime coordinators when overlay, drag, or modal state must affect the external surface.

## Commands And Workflows

- Actions express intent.
- Commands perform authoritative mutations.
- Workflows coordinate multi-step async behavior or service policy.
- Do not collapse actions, commands, workflows, and providers into one giant service object.

## State package direction

- Prefer `@loop-kit/state` for app-local state that benefits from patch history and undo/redo.
- Use store-context helpers instead of hand-rolling provider/store/selector boilerplate.
- Avoid object-literal selectors unless the selector helper guarantees stable snapshots.
- Prefer slice-level history when only part of the store needs undo/redo.
- Leave room for future workflow-style optimistic validation instead of pushing async policy into UI components.

## Comments And File Structure

- Put short module comments at the top of files that hide non-standard behavior.
- Good comment targets:
  - native overlay synchronization
  - host-specific lifecycle quirks
  - service/provider boundaries
  - unusual state/history mechanics
- Keep interfaces and exported types near the top of the file.
- Prefer one coherent file per concept over many tiny wrapper files.
