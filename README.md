# loop-kit

`loop-kit` is the Loop monorepo for contracts, kernel, CLI, UI demo surfaces, and backend automation examples.

This repo is now:

- Moonrepo-first for workspace orchestration and CI task execution
- Proto-first for pinned toolchains
- GitHub Actions-first for CI orchestration
- dotenvx-driven for local env-based automation
- Dagger-retained for transitional release automation only

## Quickstart

```bash
powershell -ExecutionPolicy Bypass -c "irm https://github.com/moonrepo/moon/releases/download/v2.0.0/moon_cli-installer.ps1 | iex"
proto install --yes
pnpm install
pnpm run ci
```

Moon is pinned to `2.0.0` for this baseline.

## Pinned toolchain

Tool versions are pinned in `.prototools`:

- `node` `22.20.0`
- `pnpm` `10.15.1`
- `rust` `1.90.0`
- `go` `1.25.0`
- `dagger` `0.20.1`
- `dotenvx` `1.53.0`

Custom Proto plugin definitions:

- `tools/proto/plugins/dotenvx.toml`

## Core automation commands

```bash
pnpm run ci
pnpm run build
pnpm run typecheck
pnpm run test
```

CI runs through GitHub Actions and Moon:

- GitHub Actions installs Moon `2.0.0`
- Proto installs the pinned binary toolchain from `.prototools`
- `moon ci :build :typecheck :test` is the CI entrypoint

Transitional Dagger commands remain available for release flows:

```bash
pnpm run dagger:functions
```

Direct Loop-debug variants are still available:

```bash
pnpm run ci:loop
pnpm run build:loop
pnpm run typecheck:loop
pnpm run test:loop
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

## Nitric example: loop registry

Example app:

- `examples/nitric/loop-registry`

It exposes a simple API registry for loop-kit artifacts (`component`, `module`, `bundle`).

Dagger + Nitric commands:

```bash
pnpm run nitric:registry:spec
pnpm run nitric:registry:build
pnpm run nitric:registry:deploy -- --stack gcp-main --env-file .env.registry
```

dotenvx flow:

```bash
cp examples/nitric/loop-registry/.env.registry.example examples/nitric/loop-registry/.env.registry
pnpm run nitric:registry:deploy:env
```

If no Nitric stack exists yet, initialize one interactively from the example directory:

```bash
proto run nitric -- stack new gcp-main gcp
```
