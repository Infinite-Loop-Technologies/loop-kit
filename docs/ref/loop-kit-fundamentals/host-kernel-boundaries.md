# Host And Kernel Boundaries

## Purpose

The new Loop host should be a simple runtime shell that assembles providers, manages grants, routes capability calls, and runs units. The kernel should be a narrow coordination layer inside that host, not a sprawling product monolith.

## Boundary Discipline

- The CLI is an operator surface. It should submit requests, stream results, and inspect state; it should not own core business logic.
- The host daemon owns lifecycle, cache access, provider registration, scheduling, watcher integration, and execution coordination.
- The kernel owns routing, composition decisions, and policy enforcement hooks, not every concrete feature implementation.
- Providers implement concrete capability surfaces. They may be components, executables, libraries, or containers.
- Adapters are first-class surfaces for bridging transports and representation gaps.

## Design Rules

- Prefer WIT-defined boundaries even for internal provider seams when the cost is reasonable.
- Make direct filesystem, network, process, and credential access flow through explicit grant-aware providers.
- Keep host internals composable enough that custom hosts or alternate provider bundles remain realistic.
- Separate install-time concerns from run-time concerns; both may share the same registry and cache, but they should not be conflated in one opaque lifecycle.

## CLI And `loopx`

- The default CLI should primarily talk to the host daemon.
- `loopx` should feel like a fast path for discovering, fetching, and running command-capable units from the registry.
- The operator surface should make execution mode obvious: local component, cached artifact, containerized provider, or forwarded remote host.

## Failure To Avoid

- Rebuilding a giant `loop-kernel` package under a different name.
- Smearing policy, provider implementation, and operator UX into the same module boundary.
- Treating MCP as the architecture instead of one interface into the host and registry.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/ref/loop-kit-fundamentals/index.md](index.md)
<!-- markdown-backlinks:end -->
