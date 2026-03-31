# loop-kit

`loop-kit` is the prototype monorepo for Forge, Graphite, Dock, Loom, and the next OCI/WASM runtime experiments.

The repo now treats Bun as the default scripting, test, and workspace runtime. Proto stays in place to pin tool versions, but Moon, the old template generator flow, and the Rust `experiments/oci-lab` lab are gone.

## Current Repo Shape

- `apps/forge`: Forge prototype app
- `apps/loom-demo`: Loom architecture demo surface
- `apps/dock-demo`: dock-focused demo surface built on `loom-pack-dock`
- `packages/graphite*`: retained Graphite runtime work
- `packages/dock`: retained Dock work
- `packages/loom-*`: Loom contracts, renderer, themes, interactions, and higher-level packs
- `experiments/`: Bun-first prototype labs and notes
- `tests/`: repo-level smoke and orchestration tests
- `fixtures/`: shared test and experiment fixtures when they are worth centralizing
- `tools/`: small Bun scripts for repo automation
- `docs/`: plans, references, and rewrite direction

## Quickstart

```powershell
proto install --yes
bun install
bun run ci
```

## Core Commands

```bash
bun run forge:dev
bun run loom:dev
bun run dock:dev
bun run build
bun run typecheck
bun run test
bun run ci
```

## Experiments

The OCI/WASM experiment track is being rebuilt as Bun-first TypeScript labs instead of the removed Rust `oci-lab`. Use [`experiments/README.md`](./experiments/README.md) as the entry point for new labs.

## Local OCI Registry

Use Docker Distribution (`registry:2`) as the first local registry baseline. It is still the simplest standards-aligned choice for localhost experiments and works cleanly with direct OCI clients.

```powershell
docker run -d -p 5000:5000 --restart unless-stopped --name loop-registry registry:2
```

References can then target paths like:

```text
localhost:5000/loop/hello-wasm:dev
localhost:5000/loop/tool-runner:dev
localhost:5000/loop/shell-container:dev
```

## Planning

The rewrite direction lives in:

- `docs/visions/active/000-forge-local-oci-capability-platform.md`
- `docs/project-plans/on-hold/003-loop-refactor.md`
- `docs/ref/loop-kit-fundamentals/index.md`

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
