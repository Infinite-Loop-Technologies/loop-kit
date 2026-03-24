# loop-kit Fundamentals Rewrite

## Purpose

This reference set captures the target model for rewriting the loop-kit core away from large `loop-*` packages and toward OCI-addressable units with WIT-first interoperability.

Use these docs with the current experiment-first posture in mind. The legacy kernel/contracts/daemon/CLI stack has now been removed from the repo. The replacement starts in `experiments/oci-lab`, and these docs should help tighten that path instead of recreating another oversized package tree.

## Core Principles

- Small, modular units should be publishable and fetchable as OCI artifacts.
- WIT packages define the standard surface; interfaces and worlds are the primary public contract.
- wRPC-compatible boundaries are the normal transport story; adapters are the explicit escape hatch.
- The host exists to compose providers, route calls, enforce grants, manage lifecycle, and expose a stable operator surface.
- Workspaces are artifact factories and automation surfaces, not just piles of source directories.
- Developer ergonomics matter: local caching, generated bindings, install surfaces, and watcher-based flows should make registry-backed units feel native.

## Legacy Cut Line

The rewrite has now cut away:

- `packages/loop-cli`
- `packages/loop-mcp`
- `packages/loop-kernel`
- `packages/loop-contracts`
- `packages/loopd`
- `packages/loop-ai`
- Forge app/shell packages that depended on the old stack
- the old `loop.json` workspace model

## Reference Map

- [oci-registry-and-client.md](./oci-registry-and-client.md)
- [standard-surface-and-wit.md](./standard-surface-and-wit.md)
- [host-kernel-boundaries.md](./host-kernel-boundaries.md)
- [grants-and-composition.md](./grants-and-composition.md)
- [workspace-and-automation.md](./workspace-and-automation.md)

## Planning Links

- Vision: [../../visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
- Project plan: [../../project-plans/on-hold/003-loop-refactor.md](../../project-plans/on-hold/003-loop-refactor.md)
- Audit input: [../../agent-inbox/loop-audit-report.md](../../agent-inbox/loop-audit-report.md)
- Experiment code: [../../../experiments/oci-lab/README.md](../../../experiments/oci-lab/README.md)

## Backlinks

<!-- markdown-backlinks:start -->
- [architecture.md](../../../architecture.md)
- [docs/next-actions/completed/007-loop-rewrite-inventory-and-cut-line.md](../../next-actions/completed/007-loop-rewrite-inventory-and-cut-line.md)
- [docs/project-plans/on-hold/003-loop-refactor.md](../../project-plans/on-hold/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
