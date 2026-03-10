# Codex

## Toolchain Policy

- Proto is the required toolchain manager for this repo.
- Use `.prototools` as the single source of pinned tool versions.
- Do not install ad-hoc global CLIs for repo workflows when a Proto-managed tool exists.
- Installed through Proto (pinned): `node`, `pnpm`, `rust`, `go`, `dagger`, `dotenvx`, `nitric`.
- Local custom Proto plugins live in `tools/proto/plugins/`.

## Bootstrap

```bash
proto install --yes
pnpm install
```

## Automation Policy

- Dagger is the orchestration layer for build/test/ci/publish/deploy workflows.
- Do not add or rely on GitHub Actions for core pipelines in this repo.
- Discover available automation functions:

```bash
pnpm run dagger:functions
```

- Default pipeline entrypoints:
    - `pnpm run ci`
    - `pnpm run build`
    - `pnpm run typecheck`
    - `pnpm run test`

## Loop CLI Policy

- Loop CLI remains part of product dev/runtime behavior.
- Use direct Loop scripts only when debugging a Loop-specific issue:
    - `pnpm run ci:loop`
    - `pnpm run build:loop`
    - `pnpm run typecheck:loop`
    - `pnpm run test:loop`

## dotenvx Policy

- Use dotenvx for environment-driven local automation.
- Release env template: `.env.release.example` -> `.env.release`
- Nitric env template: `examples/nitric/loop-registry/.env.registry.example` -> `.env.registry`

dotenvx-wired commands:

- `pnpm run release:publish:all:env`
- `pnpm run release:publish:cli:env`
- `pnpm run nitric:registry:spec:env`
- `pnpm run nitric:registry:build:env`
- `pnpm run nitric:registry:deploy:env`

## npm Publishing

- Dry-run publish:
    - `pnpm run release:publish:all:dry`
    - `pnpm run release:publish:cli:dry`
- Real publish:
    - `pnpm run release:publish:all`
    - `pnpm run release:publish:cli`
- For env-driven publishes, set `NODE_AUTH_TOKEN` in `.env.release` and use `*:env` scripts.

## Nitric Policy

- Nitric powers backend/cloud automation examples.
- Reference implementation: `examples/nitric/loop-registry`.
- Keep Dagger as the outer automation layer; Nitric commands run inside Dagger functions.
- Preferred starter cloud provider: GCP (`gcp-main`) for low-cost Cloud Run-style workflows and broad free-tier coverage.

Common Nitric flows through Dagger:

- `pnpm run nitric:registry:spec`
- `pnpm run nitric:registry:build`
- `pnpm run nitric:registry:deploy -- --stack gcp-main --env-file .env.registry`

If stack configuration is not initialized yet, create it once interactively from the example directory:

```bash
proto run nitric -- stack new gcp-main gcp
```

## Operational Guardrails

- Docker Desktop (or another supported Docker engine) must be running before using Dagger/Nitric automation.
- Keep versions pinned in `.prototools`; update pins intentionally and commit them.

## Rules for High Quality Responses

- Test all web UIs with the Playwright MCP server. Consider even writing Playwright tests directly for highly complex situations. Make sure to always to do evaluations with Playwright to ensure that the web UI is working as it should.
- Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
