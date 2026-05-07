---
status: ready
last_reviewed: 2026-05-07
blocked_by: []
---

# Dock Workbench Interaction and Surface Polish

## Goal

Polish the workbench Dock and Drag/Drop labs so they clearly prove current Dock
and Interaction behavior: state-driven drag ghosts, legal drop overlays, closeable
floating windows, real tab-only stacks, non-tab metadata, and a useful Dock
debug inspector.

## Context

- Start with `HANDOFF.md`, `AGENTS.md`,
  `docs/references/architecture/dock-and-interaction.md`,
  `packages/dock/src`, `packages/dock-react/src`, and `examples/workbench`.
- IRA layering is mandatory. `DockService` owns committed dock truth,
  `DockRuntime` owns transient previews, interaction policies translate generic
  signals into service/runtime calls, and React UI renders state plus registers
  targets.
- The workbench is a bring-your-own Dock UI proof surface. Do not make
  `DockRender` the primary app UI.

## Required Work

- Keep Dock drop overlays hidden until a dock drag preview is active, then show
  only the legal/active placement affordances needed for debugging.
- Add or refine state-driven ghosts/previews for Dock panel drags, split resize,
  floating window move/resize, and the Drag/Drop Lab reorder flow.
- Keep tabs visible only when `DockGroupNode.stackMode === "tabs"`; render
  compact metadata for `none`, `overlay`, `modal`, and `queue` groups.
- Ensure tab clicks select/focus the active panel through `DockService`, and make
  the current active panel visible in the inspector.
- Keep floating window close controls wired through a committed Dock service
  command, not local React state.
- Expand the Dock Lab inspector with selectable views for panels, surfaces,
  windows, groups, and policy/placement checks using `canApplyPlacement`.
- Fix any discovered visual/interaction regressions that are clearly part of
  this surface-polish slice.

## Constraints

- Keep `packages/dock` headless and React-free.
- Keep `@loop-kit/interaction` generic. Do not add Dock, panel, or app-specific
  behavior to interaction core.
- Do not put legal drop decisions in component conditionals; components may
  display policy/service decisions.
- Preserve ordinary text selection in editable controls while preventing
  accidental selection during active pointer drags.

## Validation

- `bun --filter @loop-kit/interaction test:unit`
- `bun --filter @loop-kit/dock test:unit`
- `bun --filter @loop-kit/example-workbench typecheck`
- `bun --filter @loop-kit/example-workbench build`
- Browser-check `https://workbench.localhost` when available:
  no text selection during resize/move, overlays appear only during drag, ghosts
  are visible, floating close works, tabs only appear for `tabs` groups, and the
  inspector reflects live service/runtime state.
