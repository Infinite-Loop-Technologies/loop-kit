# loop-kit

`loop-kit` is the Loop monorepo for contracts, kernel, CLI, UI demo surfaces, and backend automation examples.

This repo is now:

- Moonrepo-first for workspace orchestration and CI task execution
- Proto-first for pinned toolchains
- GitHub Actions-first for CI orchestration
- dotenvx-driven for local env-based automation
- Dagger-free in repository automation

## Quickstart

```powershell
irm https://moonrepo.dev/install/proto.ps1 | iex
proto install --yes
proto run pnpm -- install --frozen-lockfile
proto run moon -- ci
```

Moon is pinned to `2.0.4`, and Proto is pinned to `0.55.4` through `.moon/toolchains.yml`.

More detailed usage notes live in `docs/moon-proto.md`.

## Pinned toolchain

Tool versions are pinned in `.prototools`:

- `moon` `2.0.4`
- `node` `22.20.0`
- `pnpm` `10.15.1`
- `dotenvx` `1.53.0`

Custom Proto plugin definitions:

- `tools/proto/plugins/dotenvx.toml`

## Core automation commands

```bash
pnpm run ci
pnpm run build
pnpm run lint
pnpm run typecheck
pnpm run test
```

Moon infers project tasks directly from `package.json` scripts, so app/package targets like `moon run ui-demo:dev` and `moon run loop-cli:test` work without per-project boilerplate.

CI runs through GitHub Actions and Moon:

- GitHub Actions uses `moonrepo/setup-toolchain@v0`
- Proto installs the pinned binary toolchain from `.prototools`, including Moon
- `proto run moon -- ci :build :typecheck :test` is the CI entrypoint

Manual publish flows:

```bash
pnpm run release:publish:all:dry
pnpm run release:publish:cli:dry
```

The CLI stack is also publishable through a manual GitHub Actions workflow dispatch.

## Loop CLI helpers

```bash
pnpm run loop
pnpm run loop:smoke
```

## npm publishing

Dry-run:

```bash
pnpm run release:publish:all:dry
pnpm run release:publish:cli:dry
```

Real publish:

```bash
pnpm run release:publish:all
pnpm run release:publish:cli
```

dotenvx-based publish:

```bash
cp .env.release.example .env.release
pnpm run release:publish:all:env
pnpm run release:publish:cli:env
```
