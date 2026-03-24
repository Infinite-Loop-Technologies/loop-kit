# Loop Core Rewrite Program

## Desired Outcome

Replace the current large `loop-*` package cluster with a clearer, smaller, OCI-native platform made of modular units, a WIT-defined standard surface, a practical hosted-plus-local-cache registry story, and a host/kernel/CLI model that can actually deliver the loop-kit vision.

When this project plan is complete, the repo should have:

- an explicit decommissioning map for the legacy Loop packages and `/loop`-era assumptions
- a concrete registry architecture with hosted distribution, local caching, and MCP-facing access
- a first version of the loop-kit standard surface expressed as WIT packages, interfaces, and worlds
- a defined host/kernel/grants/composition model for running units implemented as components, executables, libraries, or containers
- a workspace and automation model that makes registry-backed units feel seamless in real developer workflows

## Rewrite Principles

- Prefer many small OCI-addressable units over a few giant framework packages.
- Make WIT the standard contract surface and treat wRPC-compatible boundaries as the normal interop path.
- Keep the host simple: composition, routing, grants, lifecycle, and execution boundaries belong there; business-specific capability logic should live in providers and units.
- Preserve escape hatches for executables, containers, native libraries, and JS packages, but make adapters explicit.
- Treat the current `loop-*` packages as migration source material, not as the target package split.
- Design for browser, local daemon, and remote/container-hosted execution from the start, even if the first implementation lands on the desktop.

## Legacy Surfaces To Retire

- `packages/loop-cli`
- `packages/loop-mcp`
- `packages/loop-kernel`
- `packages/loop-contracts`
- `packages/loopd`
- `packages/loop-ai`
- the current `/loop` local artifact and manifest model as the primary distribution abstraction

## Replacement Workstreams

### 1. Registry and client foundation

- Define the first hosted OCI registry posture and the local cache model.
- Define the custom registry client responsibilities, package split, and MCP-facing surface.
- Define how OCI references map to installs, execution, and developer ergonomics.

### 2. Standard surface and WIT tooling

- Define the first core WIT packages, interfaces, and worlds for registry, runtime, workspace, automation, and CLI-command-like units.
- Define WIT linting, compatibility checks, package layout, and TS/Rust binding-generation expectations.
- Create the repo-local skill and reference material needed to keep authoring disciplined.

### 3. Host, kernel, grants, and composition

- Define boundary discipline between CLI, host daemon, kernel, providers, adapters, and units.
- Define the grant manager/enforcer model and capability routing story.
- Define the component/provider composer so the host can be assembled from registry-backed parts.

### 4. Workspace and developer workflows

- Define workspace/project/artifact concepts and install semantics.
- Define `loopx` and the broader operator surface for running registry-backed commands and workflows.
- Define watcher/codegen workflows for TypeScript imports, generated wrappers, and smart local ergonomics.

### 5. Artifact builders and automation units

- Define how WASM Components, executables, containers, and supporting crates get built, packaged, and published.
- Define workflow/automation units that feel Dagger-like while still using the same standard surface and host model.
- Define how toolchain providers, Proto-wrapped binaries, and language-specific helpers fit into the registry.

## Support Material

- Vision: [../../visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
- Architecture reference: [../../../ARCHITECTURE.md](../../../ARCHITECTURE.md)
- Fundamentals reference: [../../ref/loop-kit-fundamentals/index.md](../../ref/loop-kit-fundamentals/index.md)
- Registry reference: [../../ref/loop-kit-fundamentals/oci-registry-and-client.md](../../ref/loop-kit-fundamentals/oci-registry-and-client.md)
- Standard surface reference: [../../ref/loop-kit-fundamentals/standard-surface-and-wit.md](../../ref/loop-kit-fundamentals/standard-surface-and-wit.md)
- Host boundary reference: [../../ref/loop-kit-fundamentals/host-kernel-boundaries.md](../../ref/loop-kit-fundamentals/host-kernel-boundaries.md)
- Grants and composition reference: [../../ref/loop-kit-fundamentals/grants-and-composition.md](../../ref/loop-kit-fundamentals/grants-and-composition.md)
- Workspace and automation reference: [../../ref/loop-kit-fundamentals/workspace-and-automation.md](../../ref/loop-kit-fundamentals/workspace-and-automation.md)
- Audit input: [../../agent-inbox/loop-audit-report.md](../../agent-inbox/loop-audit-report.md)

## Linked Next Actions

- [../../next-actions/active/007-loop-rewrite-inventory-and-cut-line.md](../../next-actions/active/007-loop-rewrite-inventory-and-cut-line.md)
- [../../next-actions/active/008-oci-registry-foundation.md](../../next-actions/active/008-oci-registry-foundation.md)
- [../../next-actions/active/009-registry-client-and-cache-package.md](../../next-actions/active/009-registry-client-and-cache-package.md)
- [../../next-actions/active/010-standard-surface-wit-package-map.md](../../next-actions/active/010-standard-surface-wit-package-map.md)
- [../../next-actions/active/011-wit-tooling-and-linting.md](../../next-actions/active/011-wit-tooling-and-linting.md)
- [../../next-actions/active/012-host-kernel-boundary-discipline.md](../../next-actions/active/012-host-kernel-boundary-discipline.md)
- [../../next-actions/active/013-grant-manager-and-enforcement.md](../../next-actions/active/013-grant-manager-and-enforcement.md)
- [../../next-actions/active/014-component-provider-composition.md](../../next-actions/active/014-component-provider-composition.md)
- [../../next-actions/active/015-workspace-and-install-model.md](../../next-actions/active/015-workspace-and-install-model.md)
- [../../next-actions/active/016-loopx-and-operator-surface.md](../../next-actions/active/016-loopx-and-operator-surface.md)
- [../../next-actions/active/017-typescript-importer-and-bindings.md](../../next-actions/active/017-typescript-importer-and-bindings.md)
- [../../next-actions/active/018-artifact-builders-and-toolchains.md](../../next-actions/active/018-artifact-builders-and-toolchains.md)
- [../../next-actions/active/019-automation-workflows-and-surface-providers.md](../../next-actions/active/019-automation-workflows-and-surface-providers.md)

## Backlinks

<!-- markdown-backlinks:start -->
- [architecture.md](../../../architecture.md)
- [docs/next-actions/active/007-loop-rewrite-inventory-and-cut-line.md](../../next-actions/active/007-loop-rewrite-inventory-and-cut-line.md)
- [docs/next-actions/active/008-oci-registry-foundation.md](../../next-actions/active/008-oci-registry-foundation.md)
- [docs/next-actions/active/009-registry-client-and-cache-package.md](../../next-actions/active/009-registry-client-and-cache-package.md)
- [docs/next-actions/active/010-standard-surface-wit-package-map.md](../../next-actions/active/010-standard-surface-wit-package-map.md)
- [docs/next-actions/active/011-wit-tooling-and-linting.md](../../next-actions/active/011-wit-tooling-and-linting.md)
- [docs/next-actions/active/012-host-kernel-boundary-discipline.md](../../next-actions/active/012-host-kernel-boundary-discipline.md)
- [docs/next-actions/active/013-grant-manager-and-enforcement.md](../../next-actions/active/013-grant-manager-and-enforcement.md)
- [docs/next-actions/active/014-component-provider-composition.md](../../next-actions/active/014-component-provider-composition.md)
- [docs/next-actions/active/015-workspace-and-install-model.md](../../next-actions/active/015-workspace-and-install-model.md)
- [docs/next-actions/active/016-loopx-and-operator-surface.md](../../next-actions/active/016-loopx-and-operator-surface.md)
- [docs/next-actions/active/017-typescript-importer-and-bindings.md](../../next-actions/active/017-typescript-importer-and-bindings.md)
- [docs/next-actions/active/018-artifact-builders-and-toolchains.md](../../next-actions/active/018-artifact-builders-and-toolchains.md)
- [docs/next-actions/active/019-automation-workflows-and-surface-providers.md](../../next-actions/active/019-automation-workflows-and-surface-providers.md)
- [docs/ref/loop-kit-fundamentals/index.md](../../ref/loop-kit-fundamentals/index.md)
- [docs/visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
<!-- markdown-backlinks:end -->
