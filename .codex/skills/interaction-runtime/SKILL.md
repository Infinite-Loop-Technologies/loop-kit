---
name: interaction-runtime
description: Use when work touches scopes, actions, shortcuts, focus routing, drag/drop surfaces, overlays, or the shared interaction runtime split in loop-kit.
---

# Interaction Runtime

Use this skill when changing `packages/interaction`, `packages/interaction-react`, or app code that should integrate with them.

## Start Here

Read the smallest useful set first:

- `references/interaction-runtime.md`
- `packages/interaction/src/runtime.ts`
- `packages/interaction-react/src/provider.tsx`
- the app-specific action registry you are touching

## Rules

- Keep `packages/interaction` headless.
- Keep browser and React wiring in `packages/interaction-react`.
- Reuse the shared runtime before inventing app-local interaction systems.
- Register scopes at real interaction boundaries.
- Keep actions semantic, commands authoritative, and workflows orchestrational.
- Prefer feature hooks and bridge code over raw service access in leaf UI.

## Checklist

1. Decide whether the change belongs in the headless runtime, the React bridge, or app-specific action wiring.
2. Confirm scope hierarchy and keyboard ingress are using the shared bridge.
3. Put reusable behavior in the shared packages, not only in Forge or dock-demo.
4. If the change affects Dock behavior too, read `.codex/skills/dock-integration/SKILL.md`.
