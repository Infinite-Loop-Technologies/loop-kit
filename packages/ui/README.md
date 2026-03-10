# @loop-kit/ui

Canonical loop-kit UI package.

## What lives here

- `tokens`: semantic token schema + default light/dark tokens.
- `theme`: theme schema, CSS variable compiler, `ThemeProvider`, hooks.
- `icons`: swappable icon registry + default lucide pack.
- `assets`: asset/texture registry + `asset://` resolver.
- `primitives`: token-native `Panel`, `Button`, and `Text`.
- `blocks`: extracted reusable product blocks (graphite/editor/outline/dock/theme tooling).
- `legacy`: migrated shadcn-compatible surface from the retired site package.
- `stories`: story manifest consumed by `apps/ui-demo`.

## Public surfaces

- `@loop-kit/ui`
- `@loop-kit/ui/tokens`
- `@loop-kit/ui/theme`
- `@loop-kit/ui/icons`
- `@loop-kit/ui/assets`
- `@loop-kit/ui/primitives`
- `@loop-kit/ui/blocks`
- `@loop-kit/ui/legacy`
- `@loop-kit/ui/stories`

Compatibility aliases are kept for existing consumers:

- `@loop-kit/ui/button`
- `@loop-kit/ui/card`
- `@loop-kit/ui/input`
- `@loop-kit/ui/label`
- `@loop-kit/ui/textarea`
- `@loop-kit/ui/prose`
- `@loop-kit/ui/prose.css`
- `@loop-kit/ui/utils`

## Local commands

- `pnpm --filter @loop-kit/ui typecheck`
- `pnpm --filter @loop-kit/ui test`

## Preview UI

Use the Vite UI demo app:

- `pnpm --filter @loop-kit/ui-demo dev`
