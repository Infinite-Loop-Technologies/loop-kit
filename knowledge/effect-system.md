# Incremental effect system (loop:fx)

Refs/inspiration:

-   https://www.gravity4x.com/graphecs-the-graph-first-entity-component-system/
-   https://ajmmertens.medium.com/why-vanilla-ecs-is-not-enough-d7ed4e3bebe5
-   https://ajmmertens.medium.com/why-it-is-time-to-start-thinking-of-games-as-databases-e7971da33ac3
-   https://usegpu.live/docs/guides-layout-and-ui (layout/tree mental model)

## Current stance (naming closed)

-   `loop:fx` replaces `loop:reactor` to avoid the WIT reactor-kind collision. Source of truth: `wit/loop-fx/world.wit`.
-   Goal: effects/components as a tree, React-like reconciliation but host-defined, props-down/yields-up, deterministic scheduling with fibers.
-   Hosts own scheduling and diffing; components are pure-ish functions that emit child nodes, yield values, and schedule re-renders via hooks.

## WIT shape (draft)

-   Nodes: `node-spec { component, key, props }` → `render-child(parent, spec, position)` returns `{ id, reused }`. Hosts choose reuse via `key`.
-   Hooks: `use-state` (string-serde), `set-state`, `use-resource` (subscription/async slot), `mark-dirty`.
-   Scheduler: `request-tick`, `tick`, `sleep(cancel-token, ms)`.
-   Yields: `yield-value(node, value)` and `bubble-error(node, message)`.
-   Props serialization is caller-defined (string for now; switch to CBOR/JSON/bytes later).
-   Reconciliation: components call `render-child` in order; `seal(parent, child-count)` tells host to prune extras.

## Coupling to UI/GFX

-   High-level UI IR lives in `loop:ui` (layout tree, attachable to an fx node via `attach-fx-node`). Rendering happens via providers (DOM/webview/native renderer).
-   Windowing/input is separate (`loop:window`); UI IR hosts should map to a window/surface and forward events back through fx hooks or props.
-   `loop:gfx` TBD: map GPU surfaces/buffers to fx nodes for incremental updates.

## Open loops

-   Define canonical serde for props/state (likely CBOR) and structured values for `yield-value` instead of strings.
-   Specify resource lifecycle in `use-resource` (start/stop callbacks, error propagation).
-   Persist/restore graphs for hot-reload/modding; figure out stable node ids across reloads.
-   Decide on quoting/unquoting semantics for deferring subtrees and custom reconcilers.
-   Describe interop with async streams (watchers) and cancellation beyond `sleep`.
-   Explore schedulers beyond simple ticks (priorities, deadlines, cooperative fibers).
