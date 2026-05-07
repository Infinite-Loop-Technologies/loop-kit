---
status: ready
last_reviewed: 2026-05-07
blocked_by: []
---

# Interaction Shortcut Routing Followup

## Goal

Design and implement a generic scoped shortcut-routing layer for
`@loop-kit/interaction`, then prove it in the workbench without implying global
shortcuts should fire blindly inside editable controls.

## Context

- Start with `HANDOFF.md`, `AGENTS.md`,
  `.codex/skills/interaction-runtime/SKILL.md`,
  `packages/interaction/src/InteractionRuntime.ts`,
  `packages/interaction/src/installKeyboardSignalSynthesis.ts`, and the
  workbench Keyboard lab.
- The current interaction package has raw and synthesized key signals, focus
  state, target ancestry, and explicit `parentId` hierarchy.
- The package intentionally does not implement shortcut routing yet.
- The workbench drag/drop lab now proves the current target/focus baseline with
  a command boundary, draggable/dropzone rows, drag handles, and a registered
  text-input target before shortcut routing is added.
- Pointer drag synthesis now suppresses accidental native text selection only
  after a draggable target crosses the drag threshold. Treat that as baseline
  interaction behavior, not shortcut-routing scope.

## Constraints

- Keep `@loop-kit/interaction` generic and headless.
- Keep browser and React wiring behind `@loop-kit/interaction/react`.
- Use explicit target ancestry and focus boundaries; do not infer hierarchy from
  React or DOM trees.
- Editable controls must be treated explicitly so examples do not demonstrate
  unsafe global shortcut behavior.

## Next Work

- Define the smallest generic shortcut registration and routing API.
- Route shortcuts by focused target ancestry and declared command boundaries.
- Add tests for focused target routing, ancestor fallback, disabled scopes,
  modifier matching, repeat handling, and editable-control suppression.
- Add a workbench demo with multiple command regions and visible routed command
  events.

## Validation

- `bun run typecheck:packages`
- `bun --filter @loop-kit/interaction test:unit`
- `bun --filter @loop-kit/example-workbench typecheck`
- `bun --filter @loop-kit/example-workbench build`
- Browser-check routed shortcuts in `https://workbench.localhost` across
  command button focus, text input focus, and empty-region focus.
