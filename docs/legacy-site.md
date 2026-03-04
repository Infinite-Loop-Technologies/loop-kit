# Legacy Site Migration

`packages/site` has been removed from the monorepo.

## What changed

- The legacy Next.js registry app is retired.
- Reusable UI was extracted into `packages/ui`.
- `apps/workbench` now provides local UI preview for primitives, blocks, and legacy surfaces.
- Vercel site deployment workflow (`.github/workflows/vercel-site.yml`) was removed.

## New preview workflow

```bash
pnpm --filter @loop-kit/workbench dev
```

Workbench routes:

- `/primitives` - token-native foundation primitives
- `/blocks` - extracted graphite/editor/outline blocks
- `/legacy` - migrated shadcn-compatible catalog

Note: the old dock demo implementation was copied for follow-up work but is not exported yet because
it targets a pre-refactor dock API.

## Why

- Keep one canonical UI package (`@loop-kit/ui`).
- Remove Next.js app-specific coupling from reusable components.
- Simplify CI and local iteration for component extraction/refactoring.
