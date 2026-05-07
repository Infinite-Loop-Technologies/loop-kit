---
status: unready
last_reviewed: 2026-05-06
blocked_by: []
---

# Dock Floating Windows Followup

Archived after implementation on 2026-05-06.

## Goal

Turn dock floating-window model support into a tested package and workbench
surface. The result should prove move, resize, active-window, z-order, and
restore behavior without moving domain policy into React components.

## Context

- Start with `HANDOFF.md`, `AGENTS.md`, `.codex/skills/dock-integration/SKILL.md`,
  `packages/dock/src/DockService.ts`, `packages/dock/src/DockRuntime.ts`,
  `packages/dock/src/DockInteractionPolicies.ts`, and the workbench Windows lab.
- `DockLayout` already includes `floatingWindows`, but the default React
  renderer is still primarily group/split/modal oriented.
- The workbench Windows lab is a pressure surface, not proof of behavior yet.

## Constraints

- Keep `packages/dock` headless and React-free.
- Keep React rendering and target hooks in `packages/dock-react` or the example.
- Legal move/resize decisions belong in dock service/runtime/policy code.
- Do not add app-specific window behavior to `@loop-kit/interaction`.

## Next Work

- Add or expose service/runtime operations for active window, z-order, move, and
  resize if the current package surface is insufficient.
- Add dock target data and React target hooks for window title bars and resize
  handles.
- Extend the default dock React renderer only for generic window behavior.
- Update the workbench Windows lab to show committed frame state, active window,
  z-order, move preview, and resize preview.
- Add package tests before relying on browser-only validation.

## Validation

- `bun run typecheck:packages`
- `bun --filter @loop-kit/dock test:unit`
- `bun --filter @loop-kit/example-workbench typecheck`
- `bun --filter @loop-kit/example-workbench build`
- Browser-check window focus, move, resize, z-order, and state restoration in
  `https://workbench.localhost`.
