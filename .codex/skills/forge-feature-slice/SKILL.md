---
name: forge-feature-slice
description: Use when adding or reorganizing Forge feature code, providers, hooks, app structure, or product-facing feature slices.
---

# Forge Feature Slice

Use this skill when work touches `apps/forge` architecture or feature organization.

## Start Here

Read:

- `references/forge-app-structure.md`
- `apps/forge/src/app.tsx`
- the current feature files you are editing
- `.codex/skills/interaction-runtime/SKILL.md` if the slice includes shortcuts, actions, or scoped interaction

## Rules

- Keep routing shallow.
- Organize by feature or domain slice.
- Prefer `@loop-kit/state` for local app or workspace state where it fits.
- Prefer app-facing hooks over raw service access in leaf components.
- Keep providers as composition boundaries, not logic sinks.
- Split actions, commands, workflows, queries, and UI responsibilities when the feature actually needs those boundaries.
- Promote reusable interaction and dock behavior into shared packages instead of re-implementing them inside Forge.

## Preferred folders

- `entrypoints/`
- `app/`
- `runtime/`
- `actions/`
- `commands/`
- `workflows/`
- `features/`
- `queries/`
- `ui/`

## Middle layer reminder

Use:

1. headless or domain hook
2. dumb-ish presentational component
3. feature/container composition
