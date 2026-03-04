# @loop-kit/loop-cli

CLI presentation layer for `@loop-kit/loop-kernel`.

## Commands (v0)

- `loop init`
- `loop doctor`
- `loop fix`
- `loop graph`
- `loop new app|pkg <name>`
- `loop add|update|diff <component-ref>`
- `loop extract <path> --as <component-id>`
- `loop lane list|add|auth`
- `loop toolchain status|sync`

Global option:

- `--cwd <path>` to run against another workspace root

## Package Tasks

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
