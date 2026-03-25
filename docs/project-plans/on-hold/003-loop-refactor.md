# Loop Core Rewrite Program

## Desired Outcome

Replace the deleted Loop and Forge surfaces with a smaller, working base for the next platform:

- a real OCI registry story with both persistent local-dev and ephemeral test modes
- a Rust-first experiment harness that can push, pull, and run WASM artifacts now
- a clear dispatch path for containers and executables through the same lab
- a tighter follow-up path for WIT packages and component-native workflows

This plan is intentionally narrower than the prior decomposition. The old package tree is gone; the next job is to make the replacement real before re-expanding the architecture.

## Current State

- Legacy `loop-*` packages are removed.
- Forge shells and Forge app packages are removed.
- `packages/contracts` is removed.
- The old `loop.json` workspace model is removed.
- The first replacement code now starts in `experiments/oci-lab`.

## Rewrite Principles

- Prefer experiments that prove registry and runtime behavior over more package-taxonomy planning.
- Keep a persistent local registry for day-to-day work and an ephemeral registry path for e2e tests.
- Use Rust for host/runtime work first; pull TypeScript back in where it helps developer ergonomics.
- Treat WIT and component-native flows as the contract layer that sharpens a working runtime, not as a substitute for one.
- Keep Graphite, Dock, and UI out of the rewrite blast radius unless there is a concrete runtime reason.

## Support Material

- Vision: [../../visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
- Architecture reference: [../../../ARCHITECTURE.md](../../../ARCHITECTURE.md)
- Fundamentals reference: [../../ref/loop-kit-fundamentals/index.md](../../ref/loop-kit-fundamentals/index.md)
- Registry reference: [../../ref/loop-kit-fundamentals/oci-registry-and-client.md](../../ref/loop-kit-fundamentals/oci-registry-and-client.md)
- Standard surface reference: [../../ref/loop-kit-fundamentals/standard-surface-and-wit.md](../../ref/loop-kit-fundamentals/standard-surface-and-wit.md)
- Audit input: [../../agent-inbox/loop-audit-report.md](../../agent-inbox/loop-audit-report.md)
- Experiment code: [../../../experiments/oci-lab/README.md](../../../experiments/oci-lab/README.md)

## Active Workstreams

### 1. Registry modes and auth baseline

- Persistent local registry for normal development
- Ephemeral local registry for repeatable e2e
- Practical auth stance for localhost and the first hosted registry

### 2. OCI lab runtime path

- Push, pull, and run WASM artifacts
- Pull and dispatch executable artifacts
- Pull and dispatch container artifacts

### 3. WASM package and WIT path

- Compare the generic OCI lab flow with `wasm-pkg-client`
- Decide where WIT packages and components fit first
- Seed the first real standard-surface slice after the runtime path is proven

## Linked Next Actions

- [../../next-actions/completed/007-loop-rewrite-inventory-and-cut-line.md](../../next-actions/completed/007-loop-rewrite-inventory-and-cut-line.md)
- [../../next-actions/active/008-local-oci-registry-modes-and-auth.md](../../next-actions/active/008-local-oci-registry-modes-and-auth.md)
- [../../next-actions/active/009-oci-lab-wasm-fetch-push-and-run.md](../../next-actions/active/009-oci-lab-wasm-fetch-push-and-run.md)
- [../../next-actions/active/010-oci-lab-container-and-executable-dispatch.md](../../next-actions/active/010-oci-lab-container-and-executable-dispatch.md)
- [../../next-actions/active/011-wasm-package-client-and-wit-track.md](../../next-actions/active/011-wasm-package-client-and-wit-track.md)

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/next-actions/active/008-local-oci-registry-modes-and-auth.md](../../next-actions/active/008-local-oci-registry-modes-and-auth.md)
- [docs/next-actions/active/009-oci-lab-wasm-fetch-push-and-run.md](../../next-actions/active/009-oci-lab-wasm-fetch-push-and-run.md)
- [docs/next-actions/active/010-oci-lab-container-and-executable-dispatch.md](../../next-actions/active/010-oci-lab-container-and-executable-dispatch.md)
- [docs/next-actions/active/011-wasm-package-client-and-wit-track.md](../../next-actions/active/011-wasm-package-client-and-wit-track.md)
- [docs/next-actions/completed/007-loop-rewrite-inventory-and-cut-line.md](../../next-actions/completed/007-loop-rewrite-inventory-and-cut-line.md)
- [docs/ref/loop-kit-fundamentals/index.md](../../ref/loop-kit-fundamentals/index.md)
- [docs/visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
<!-- markdown-backlinks:end -->
