---
status: unready
last_reviewed: 2026-05-11
blocked_by: []
---

# Dock Drag/Drop Correctness Followup

Implemented on 2026-05-11. Keep this prompt unready unless new correctness
regressions are found and the brief is refreshed.

## Goal

Fix the current Dock/workbench interaction bugs before adding more demo surface
area. The priority is correctness and immediate feedback: no disappearing
panels, no misplaced ghosts, no delayed resize feedback, and no accidental text
selection during Dock drags or resizes.

## Context

- Start with `AGENTS.md`, `HANDOFF.md`,
  `docs/references/architecture/dock-and-interaction.md`,
  `docs/references/ui-principles.md`, `.codex/skills/dock-integration/SKILL.md`,
  `.codex/skills/interaction-runtime/SKILL.md`, `packages/dock/src`,
  `packages/dock-react/src`, and `examples/workbench`.
- Workbench target is `https://workbench.localhost` when available.
- IRA layering is mandatory. `DockService` owns committed layout truth,
  `DockRuntime` owns previews/session state, interaction policies translate
  generic signals into Dock commands, and React renders state plus registers
  targets.
- The most severe observed bug: dragging the `Explorer` tab into a center drop
  zone can make the other tab disappear, leaving a full-screen `Explorer` panel.
  Treat this as a data-integrity bug in drop validation/commit, not just a UI
  issue.

## Required Work

- Reproduce and fix the disappearing-tab bug. Add regression coverage for the
  service/policy path that drops a tab into the center zone of a compatible
  group, including the expected stack/active-panel behavior and no lost panel
  ids.
- Fix panel/tab drag ghosts so they are positioned near the pointer throughout
  the drag. Do not rely on viewport-centered placeholder rendering.
- Make split resize and floating-window resize/move show realtime previews while
  dragging, then commit cleanly when the pointer ends. The UI should not wait
  until drag end and then snap.
- Prevent accidental text selection during active tab drag, split resize,
  floating-window move, and floating-window resize. Preserve text selection in
  editable controls.
- Remove the decorative drag-handle icon from floating windows if the title bar
  itself is the drag region.
- Bound event logs such as `Policy events`, `Dock events`, and similar signal
  streams so appended text cannot stretch the demo/inspector layout. Prefer a
  shared scrollable log component or a small primitive over repeated ad hoc CSS.
- Remove the top-right `Bun` and `Dock + Interaction` badges from the workbench
  shell.

## Constraints

- Keep `@loop-kit/interaction` generic. Do not add Dock-specific behavior to the
  interaction core.
- Keep legal Dock placement decisions in Dock service/policy/runtime code, not
  scattered through component conditionals.
- Do not make `DockRender` the primary workbench UI. The workbench should keep
  proving bring-your-own Dock rendering.
- Use semantic styling tokens. Do not hardcode Tailwind color families for the
  new UI fixes.

## Validation

- `bun --filter @loop-kit/interaction test:unit`
- `bun --filter @loop-kit/dock test:unit`
- `bun --filter @loop-kit/example-workbench typecheck`
- `bun --filter @loop-kit/example-workbench build`
- Browser-check `https://workbench.localhost`: tab ghosts follow the cursor,
  center-zone tab drops keep all tabs reachable, resize previews update during
  drag, event logs stay bounded, no accidental page text selection occurs during
  drag/resize, and the top-right badges are gone.
