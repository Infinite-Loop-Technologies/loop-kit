# loop-kit

`loop-kit` is being reset around a smaller core: Graphite, Dock, UI, and a new OCI/WASM experiment track for the next Loop and Forge rewrite.

The legacy `loop-*` packages, Forge shells, Forge app packages, and the old `loop.json` workspace model have been removed on purpose. The current direction is to prove the platform with direct experiments first, especially:

- a local OCI registry
- Rust-first artifact fetch/push tooling
- WASM loading and execution
- container and executable dispatch paths
- WIT-first interface design after the runtime path is real

## Current Repo Shape

- `apps/ui-demo`: retained UI demo surface
- `packages/graphite*`: retained Graphite runtime work
- `packages/dock`: retained Dock work
- `packages/ui`: retained UI primitives and blocks
- `experiments/oci-lab`: new Rust lab for local OCI artifact experiments
- `docs/`: plans, references, and rewrite direction

## Quickstart

```powershell
proto install --yes
proto run pnpm -- install --frozen-lockfile
proto run moon -- ci
```

Run the Rust OCI lab:

```powershell
cargo run --manifest-path experiments/oci-lab/Cargo.toml -- --help
```

Or through the root script:

```powershell
pnpm run exp:oci-lab -- --help
```

## Local OCI Registry

Use Docker Distribution (`registry:2`) as the first local registry baseline. It is the simplest standards-aligned choice for localhost experiments and works cleanly with direct OCI clients.

Start it:

```powershell
docker run -d -p 5000:5000 --restart unless-stopped --name loop-registry registry:2
```

Then target references like:

```text
localhost:5000/loop/hello-wasm:dev
localhost:5000/loop/tool-runner:dev
localhost:5000/loop/shell-container:dev
```

## Core Commands

```bash
pnpm run ci
pnpm run build
pnpm run typecheck
pnpm run test
pnpm run exp:oci-lab -- --help
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
