# OCI Registry And Client

## Purpose

The registry is not optional in the new Loop model. It is the distribution backbone for the units the platform is built from.

## Desired Properties

- Use a hosted OCI registry as the canonical remote source of truth.
- Keep a strong local cache so install, execution, and inspection stay fast and resilient.
- Expose an MCP-facing registry surface for discovery, fetch, inspection, and operator workflows.
- Support digest-pinned resolution, reproducible fetches, and explicit provenance checks.

## Practical Baseline

For the current rewrite branch, use two local modes and one later hosted mode:

- Persistent local dev registry: `distribution/distribution:edge` with a named Docker volume
- Ephemeral test registry: the same server with `--rm` for e2e and integration tests
- Hosted later: GHCR is the first reasonable shared target unless a stronger self-hosted need appears

This keeps local development fast while avoiding the mistake of making hosted auth a blocker for the first runtime experiments.

## Artifact Classes

The registry should be able to carry:

- WASM Components
- WIT packages
- executables and helper binaries
- dynamic libraries where that is unavoidable
- containers for toolchains or providers that need OS isolation
- support metadata such as manifests, compatibility info, and capability descriptors

## Client Responsibilities

The first custom registry client should handle:

- reference parsing and normalization
- auth and credential flow
- pull, push, inspect, list, and delete lifecycle operations
- local cache population and eviction
- digest verification and resumable transfer behavior
- install-time and run-time fetch integration for the host and CLI
- translation between OCI artifact shape and loop-kit-specific metadata

## Boundary Rules

- Do not make the CLI, daemon, or providers speak raw registry details everywhere.
- Keep registry semantics behind a dedicated client layer and explicit WIT or API surfaces.
- Treat the local cache as a formal product surface, not as an incidental temp directory.
- Prefer content-addressed storage and digest-based routing over name-only lookup.

## Near-Term Open Questions

- Which hosted registry baseline should be the first target after localhost: GHCR or self-hosted distribution?
- Which artifact metadata belongs in OCI manifests versus sidecar Loop metadata?
- How much of the MCP surface should proxy the registry directly versus operating through the host daemon?

## Auth Direction

- Localhost registries can stay anonymous at first.
- The client should support Docker credential helpers as the first practical credential source for authenticated registries.
- Hosted registry auth should follow standard OCI bearer-token challenge flows instead of bespoke Loop-specific login behavior.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/next-actions/active/008-local-oci-registry-modes-and-auth.md](../../next-actions/active/008-local-oci-registry-modes-and-auth.md)
- [docs/next-actions/active/009-oci-lab-wasm-fetch-push-and-run.md](../../next-actions/active/009-oci-lab-wasm-fetch-push-and-run.md)
- [docs/next-actions/active/011-wasm-package-client-and-wit-track.md](../../next-actions/active/011-wasm-package-client-and-wit-track.md)
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- [docs/ref/loop-kit-fundamentals/index.md](index.md)
<!-- markdown-backlinks:end -->
