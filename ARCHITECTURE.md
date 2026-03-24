# loop-kit Architecture

## Idea

`loop-kit` is being reshaped into a platform for small, composable software units that live in an OCI registry, speak through WIT-defined contracts, and compose through explicit capability and grant boundaries. Forge remains a product surface in the repo, but the core Loop rewrite now centers on OCI distribution, WIT packages, wRPC-compatible boundaries, and a simpler host/kernel/CLI stack built from modular providers.

The repo is split on purpose: Loop is becoming the registry, host, and standard-surface platform; Graphite continues exploring runtime/state ideas; UI packages provide reusable product blocks; and Forge composes those pieces into product-facing experiences.

## Top-Level Map

- `apps/`: thin runtime shells for shipping and validating product surfaces
- `packages/`: reusable libraries and package-level products
- `loop/`: local component/module manifests and install metadata
- `docs/`: visions, project plans, next actions, and workflow references
- `docs/ref/`: workflow docs, references, and tech-stack notes

## Main Surfaces

- Loop rewrite direction:
  [docs/visions/active/000-forge-local-oci-capability-platform.md](./docs/visions/active/000-forge-local-oci-capability-platform.md),
  [docs/project-plans/active/003-loop-refactor.md](./docs/project-plans/active/003-loop-refactor.md),
  [docs/ref/loop-kit-fundamentals/index.md](./docs/ref/loop-kit-fundamentals/index.md)
- Legacy Loop implementation being superseded:
  [packages/loop-contracts/README.md](./packages/loop-contracts/README.md),
  [packages/loop-kernel/README.md](./packages/loop-kernel/README.md),
  [packages/loop-kernel/ARCHITECTURE.md](./packages/loop-kernel/ARCHITECTURE.md),
  [packages/loop-cli/README.md](./packages/loop-cli/README.md),
  [packages/loop-mcp/README.md](./packages/loop-mcp/README.md),
  [packages/loopd/README.md](./packages/loopd/README.md),
  [packages/loop-ai/README.md](./packages/loop-ai/README.md)
- Graphite runtime stack:
  [packages/graphite/README.md](./packages/graphite/README.md),
  [packages/graphite-core/README.md](./packages/graphite-core/README.md),
  [packages/graphite-react/README.md](./packages/graphite-react/README.md),
  [packages/graphite-systems/README.md](./packages/graphite-systems/README.md),
  [packages/dock/README.md](./packages/dock/README.md)
- Forge product stack:
  [packages/contracts/README.md](./packages/contracts/README.md),
  [packages/forge-app/README.md](./packages/forge-app/README.md),
  [packages/forge-api/README.md](./packages/forge-api/README.md),
  [apps/forge-web/package.json](./apps/forge-web/package.json),
  [apps/forge-desktop/package.json](./apps/forge-desktop/package.json)
- UI and demo surface:
  [packages/ui/README.md](./packages/ui/README.md),
  [apps/ui-demo/package.json](./apps/ui-demo/package.json)

## Working Model

- Loop work is moving toward small OCI-addressable units, a WIT-first standard surface, explicit grants, host-managed providers, and workflow-capable runtime composition.
- The existing `loop-*` packages are now best treated as legacy source material and migration context, not as the desired long-term package split.
- Graphite packages explore intent-driven runtime and interaction patterns that can power richer products.
- UI packages turn those runtime ideas into reusable visible primitives and blocks.
- Forge combines the shared contracts, runtime ideas, and UI surfaces into the first agent-facing application.

That split is important: it keeps the platform reusable while still letting the repo ship concrete product slices.

## Backlinks

<!-- markdown-backlinks:start -->
- [agents.md](agents.md)
- [docs/project-plans/active/003-loop-refactor.md](docs/project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
