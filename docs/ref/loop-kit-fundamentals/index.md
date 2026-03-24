# loop-kit Fundamentals Rewrite

## Purpose

This reference set captures the target model for rewriting the loop-kit core away from large `loop-*` packages and toward OCI-addressable units with WIT-first interoperability.

Use these docs when planning or implementing the new Loop core. Treat the existing kernel/contracts/daemon/CLI stack as source material to mine or replace, not as the architectural baseline.

## Core Principles

- Small, modular units should be publishable and fetchable as OCI artifacts.
- WIT packages define the standard surface; interfaces and worlds are the primary public contract.
- wRPC-compatible boundaries are the normal transport story; adapters are the explicit escape hatch.
- The host exists to compose providers, route calls, enforce grants, manage lifecycle, and expose a stable operator surface.
- Workspaces are artifact factories and automation surfaces, not just piles of source directories.
- Developer ergonomics matter: local caching, generated bindings, install surfaces, and watcher-based flows should make registry-backed units feel native.

## Legacy Cut Line

The rewrite is expected to supersede:

- `packages/loop-cli`
- `packages/loop-mcp`
- `packages/loop-kernel`
- `packages/loop-contracts`
- `packages/loopd`
- `packages/loop-ai`
- the current `/loop` local registry/install layout as the dominant distribution model

## Reference Map

- [oci-registry-and-client.md](./oci-registry-and-client.md)
- [standard-surface-and-wit.md](./standard-surface-and-wit.md)
- [host-kernel-boundaries.md](./host-kernel-boundaries.md)
- [grants-and-composition.md](./grants-and-composition.md)
- [workspace-and-automation.md](./workspace-and-automation.md)

## Planning Links

- Vision: [../../visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Audit input: [../../agent-inbox/loop-audit-report.md](../../agent-inbox/loop-audit-report.md)

## Backlinks

<!-- markdown-backlinks:start -->
- [architecture.md](../../../architecture.md)
- [docs/next-actions/active/007-loop-rewrite-inventory-and-cut-line.md](../../next-actions/active/007-loop-rewrite-inventory-and-cut-line.md)
- [docs/next-actions/active/010-standard-surface-wit-package-map.md](../../next-actions/active/010-standard-surface-wit-package-map.md)
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
