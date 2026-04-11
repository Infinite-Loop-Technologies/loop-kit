---
name: dock-integration
description: Use when changing headless dock behavior, loom-pack-dock bridge code, or dock-demo patterns in loop-kit.
---

# Dock Integration

Use this skill when work touches `packages/dock`, `packages/loom-pack-dock`, or `apps/dock-demo`.

## Start Here

Read:

- `references/dock-integration.md`
- `packages/dock/src/service.ts`
- `packages/dock/src/commands.ts`
- `packages/loom-pack-dock/src/dock-v2.tsx`
- `apps/dock-demo/src/App.tsx` when validating demo expectations

## Rules

- Keep `packages/dock` headless and React-free.
- Keep drag/drop bridge wiring in `packages/loom-pack-dock`.
- Use the shared interaction runtime for shortcut and drag lifecycle.
- Keep legal-drop decisions in dock policy and drop resolution, not in ad hoc component logic.
- Make `apps/dock-demo` prove the behavior the packages claim to support.

## Checklist

1. Decide whether the change is headless dock logic, React/Loom bridge logic, or demo composition.
2. Preserve the split between actions, commands, service, and policy.
3. Verify drag/drop, layers, and group-policy behavior still have a visible demo path.
