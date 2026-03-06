# loop-kit

`loop-kit` is the Loop monorepo for contracts, kernel, CLI, UI workbench, and backend automation examples.

This repo is now:

- Proto-first for pinned toolchains
- Dagger-first for CI/build/test/publish/deploy orchestration
- dotenvx-driven for local env-based automation
- Nitric-enabled for local simulation and cloud deployment workflows

## Quickstart

```bash
proto install --yes
pnpm install
pnpm run ci
```

Prerequisites:

- Docker Desktop (or another compatible Docker engine) running

## Pinned toolchain

Tool versions are pinned in `.prototools`:

- `node` `22.20.0`
- `pnpm` `10.15.1`
- `rust` `1.90.0`
- `go` `1.25.0`
- `dagger` `0.20.1`
- `dotenvx` `1.53.0`
- `nitric` `1.61.1`

Custom Proto plugin definitions:

- `tools/proto/plugins/dotenvx.toml`
- `tools/proto/plugins/nitric.toml`

## Core automation commands

```bash
pnpm run dagger:functions
pnpm run ci
pnpm run build
pnpm run typecheck
pnpm run test
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
