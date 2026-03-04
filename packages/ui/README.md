# @loop-kit/ui

Canonical loop-kit UI package.

## What lives here

- `tokens`: semantic token schema + default light/dark tokens.
- `theme`: theme schema, CSS variable compiler, `ThemeProvider`, hooks.
- `icons`: swappable icon registry + default lucide pack.
- `assets`: asset/texture registry + `asset://` resolver.
- `primitives`: token-native `Panel`, `Button`, and `Text`.
- `blocks`: extracted reusable product blocks (graphite/editor/outline).
- `legacy`: migrated shadcn-compatible surface from the retired site package.
- `stories`: story manifest consumed by `apps/workbench`.

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

Use the Vite workbench app:

- `pnpm --filter @loop-kit/workbench dev`
- Routes: `/primitives`, `/blocks`, `/legacy`

## Extraction note

The legacy dock demo code was copied into `src/blocks/dock` but is not exported from
`@loop-kit/ui/blocks` yet because its old API does not match the rewritten `@loop-kit/dock`
surface.
