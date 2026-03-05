# loop-kit

`loop-kit` is the dogfooding monorepo for Loop: contracts, kernel, CLI, UI workbench, and platform scaffolds.

## Stable-First CLI

The repository defaults to a pinned, published `@loop-kit/loop-cli` via `pnpm dlx`.

```bash
pnpm install
pnpm run loop --help
pnpm run loop:version
```

### Command Modes

- Stable (default): `pnpm run loop <args>`
- Stable (explicit): `pnpm run loop:stable <args>`
- Dev (workspace CLI): `pnpm run loop:dev <args>`
- Version (stable): `pnpm run loop:version`
- Smoke (stable required, dev best-effort): `pnpm run loop:smoke --cwd .`

Stable CLI pin:

- Defined once in `package.json` as:
  - `scripts.loop:stable = pnpm dlx @loop-kit/loop-cli@0.1.0`

Why this avoids being stranded:

- Day-to-day commands run on a known-good published CLI.
- If stable lags a new command or you need to test local changes, use the explicit dev path: `pnpm run loop:dev <args>`.
- Core task scripts (`build`, `typecheck`, `test`, `ci`) run through explicit dev CLI so `run/ci` workflows stay available.

## Workspace Terms

- `workspace`: the root Loop config (`loop.json`) that defines lanes, toolchains, tasks, and pipelines.
- `component`: reusable file bundle with a `loop.component.json` manifest.
- `module`: provider/plugin package loaded by the kernel.
- `lane`: source of components/modules (local/file/git/http providers via lane instances).
- `toolchain`: adapter that contributes diagnostics, fixes, and task defaults.

## Repo Workflows

All core workflows run via Loop CLI orchestration:

```bash
pnpm run build
pnpm run typecheck
pnpm run test
pnpm run ci
```

These scripts resolve to `loop:dev run <task>` and `loop:dev ci` from `loop.json`.

## Publishing CLI

- Local publish helper: `pnpm run release:publish:cli` (or `:dry`)
- GitHub Actions: `Publish Loop CLI` (`workflow_dispatch`)
  - Inputs: `tag`, `dry_run`, `skip_checks`
  - Secret: `NPM_TOKEN`

## Current Roadmap

- Expand task runner and CI graph orchestration in kernel/CLI.
- Finalize lane overrides, auth paths, lockfile safety, and persisted undo.
- Grow workbench into the component development center (search, preview, adopt flows).
- Ship reusable host-shell/bridge scaffolds (named-pipe IPC, CEF-ready).
- Add `loopd`, MCP server, and safe AI doctor skeleton.
