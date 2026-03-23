# loop-kit Architecture

## Idea

`loop-kit` is being shaped into a platform for composable, capability-driven software units with registry integration, explicit contracts, and product surfaces that can host both human and agent workflows. Forge is the first major product surface being built on top of that platform.

The repo is split on purpose: Loop handles the composable unit and registry side, Graphite handles intent-driven runtime/state ideas, UI packages provide reusable product blocks, and Forge composes those pieces into an agentic application surface.

## Top-Level Map

- `apps/`: thin runtime shells for shipping and validating product surfaces
- `packages/`: reusable libraries and package-level products
- `loop/`: local component/module manifests and install metadata
- `docs/`: visions, project plans, next actions, and workflow references
- `docs/ref/`: workflow docs, references, and tech-stack notes

## Main Surfaces

- Loop platform:
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

- Loop packages define contracts, kernel behavior, CLI flows, and future registry-aware composition.
- Graphite packages explore intent-driven runtime and interaction patterns that can power richer products.
- UI packages turn those runtime ideas into reusable visible primitives and blocks.
- Forge combines the shared contracts, runtime ideas, and UI surfaces into the first agent-facing application.

That split is important: it keeps the platform reusable while still letting the repo ship concrete product slices.

## Backlinks

<!-- markdown-backlinks:start -->
- [agents.md](agents.md)
<!-- markdown-backlinks:end -->
