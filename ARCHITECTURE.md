# loop-kit Architecture

## Idea

`loop-kit` is now intentionally lighter. The old Loop runtime/packages and the current Forge shells have been cut away so the repo can move faster toward an OCI-native, WIT-first capability platform with real experiments instead of another round of package sprawl.

The immediate architectural posture is:

- keep `graphite`, `dock`, and `ui`
- keep `apps/ui-demo`
- remove the legacy Loop core and Forge shells
- prove the new Loop direction through Rust-first OCI registry and runtime experiments

## Top-Level Map

- `apps/`: retained UI demo only
- `packages/`: retained Graphite, Dock, and UI packages
- `experiments/`: new OCI/WASM/runtime labs
- `docs/`: visions, project plans, next actions, and reference material
- `docs/ref/loop-kit-fundamentals/`: target rewrite guidance for the next Loop surface

## Main Surfaces

- Rewrite direction:
  [docs/visions/active/000-forge-local-oci-capability-platform.md](./docs/visions/active/000-forge-local-oci-capability-platform.md),
  [docs/project-plans/active/003-loop-refactor.md](./docs/project-plans/active/003-loop-refactor.md),
  [docs/ref/loop-kit-fundamentals/index.md](./docs/ref/loop-kit-fundamentals/index.md)
- Current OCI experiment track:
  [experiments/oci-lab/README.md](./experiments/oci-lab/README.md),
  [experiments/oci-lab/src/main.rs](./experiments/oci-lab/src/main.rs)
- Graphite runtime stack:
  [packages/graphite/README.md](./packages/graphite/README.md),
  [packages/graphite-core/README.md](./packages/graphite-core/README.md),
  [packages/graphite-react/README.md](./packages/graphite-react/README.md),
  [packages/graphite-systems/README.md](./packages/graphite-systems/README.md),
  [packages/dock/README.md](./packages/dock/README.md)
- UI and demo surface:
  [packages/ui/README.md](./packages/ui/README.md),
  [apps/ui-demo/package.json](./apps/ui-demo/package.json)

## Working Model

- OCI artifacts are the real packaging and distribution backbone.
- Local development should support both persistent registries and ephemeral registries for tests.
- WASM, executables, and containers should be dispatchable from the same host-facing posture, with WIT tightening the contract surface as the experiment matures.
- WIT packages and component-native workflows should follow the runtime path, not precede it with more theory.
- Graphite, Dock, and UI remain independent value streams and should not be tangled back into a monolithic Loop rewrite.

## Deleted Surfaces

These were removed deliberately on the current branch:

- `packages/loop-*`
- `packages/contracts`
- `packages/forge-app`
- `packages/forge-api`
- `apps/forge-web`
- `apps/forge-desktop`
- the old `loop.json` workspace model

## Backlinks

<!-- markdown-backlinks:start -->
- [agents.md](agents.md)
- [docs/project-plans/active/003-loop-refactor.md](docs/project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
