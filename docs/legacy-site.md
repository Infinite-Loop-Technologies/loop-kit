# Legacy Site Migration

`packages/site` has been removed from the monorepo.

## What changed

- The legacy Next.js registry app is retired.
- Reusable UI was extracted into `packages/ui`.
- `apps/ui-demo` now provides the canonical local UI preview and dock/token demo.
- Vercel site deployment workflow (`.github/workflows/vercel-site.yml`) was removed.

## New preview workflow

```bash
pnpm --filter @loop-kit/ui-demo dev
```

The UI demo is a single docked workspace showing:

- local Loop CLI component workflows
- graphite-first dynamic docking
- theme switching and full design-token reskinning
- shortcut settings in a modal

## Why

- Keep one canonical UI package (`@loop-kit/ui`).
- Remove Next.js app-specific coupling from reusable components.
- Simplify CI and local iteration for component extraction/refactoring.
