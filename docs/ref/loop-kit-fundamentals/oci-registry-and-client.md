# OCI Registry And Client

## Purpose

The registry is not optional in the new Loop model. It is the distribution backbone for the units the platform is built from.

## Desired Properties

- Use a hosted OCI registry as the canonical remote source of truth.
- Keep a strong local cache so install, execution, and inspection stay fast and resilient.
- Expose an MCP-facing registry surface for discovery, fetch, inspection, and operator workflows.
- Support digest-pinned resolution, reproducible fetches, and explicit provenance checks.

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

- Which hosted registry baseline should be the first target: GHCR, self-hosted distribution, or a custom service from day one?
- Which artifact metadata belongs in OCI manifests versus sidecar Loop metadata?
- How much of the MCP surface should proxy the registry directly versus operating through the host daemon?

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/next-actions/active/008-oci-registry-foundation.md](../../next-actions/active/008-oci-registry-foundation.md)
- [docs/next-actions/active/009-registry-client-and-cache-package.md](../../next-actions/active/009-registry-client-and-cache-package.md)
- [docs/next-actions/active/015-workspace-and-install-model.md](../../next-actions/active/015-workspace-and-install-model.md)
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- [docs/ref/loop-kit-fundamentals/index.md](index.md)
<!-- markdown-backlinks:end -->
