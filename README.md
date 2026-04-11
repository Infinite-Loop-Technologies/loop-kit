# loop-kit

`loop-kit` is the prototype monorepo for Forge, Dock, Loom, Volt, and related capability-oriented runtime experiments.

The repo now treats Bun as the default scripting, test, and workspace runtime. Proto stays in place to pin tool versions, but Moon, the old template generator flow, and the Rust `experiments/oci-lab` lab are gone.

## Current Repo Shape

- `apps/forge`: Forge prototype app
- `apps/loom-demo`: Loom architecture demo surface
- `apps/dock-demo`: dock-focused demo surface built on `loom-pack-dock`
- `apps/volt-*`: Volt demo and site surfaces
- `packages/dock`: retained Dock work
- `packages/interaction*`: headless interaction runtime and React bridge
- `packages/loom-*`: Loom contracts, renderer, themes, and higher-level packs
- `packages/volt`: Bun-native host/metaframework work
- `experiments/`: Bun-first prototype labs and notes
- `tools/`: small Bun scripts for repo automation
- `references/`: durable repo support material that does not fit cleanly in `ARCHITECTURE.md`

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

The lightweight control plane lives in:

- `CHECKLIST.md`
- `ARCHITECTURE.md`
- `AGENT_INBOX.md`
- `HUMAN_INBOX.md`
- `references/`

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
