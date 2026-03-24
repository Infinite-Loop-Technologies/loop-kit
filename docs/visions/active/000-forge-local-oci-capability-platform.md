# Forge Local OCI Capability Platform

## Strategic Outcome

Reset Forge as a slimmer, sleeker, local-first AI agent coding assistant that runs on the user's computer for the foreseeable future, while rewriting loop-kit around OCI-backed modular units, WIT-first interoperability, secure grants, and a practical host/kernel/CLI stack that is actually worth shipping and evolving.

This vision is a strategic direction above individual project plans. It supersedes the old Forge prototype direction at the vision level without deleting existing project-plan seed material yet.

## Architectural Bets

- OCI becomes the real registry layer for reusable units instead of keeping registry concepts mostly theoretical or duplicated on the filesystem.
- The most important units should be addressable, publishable, fetchable, cached locally, and composable as OCI artifacts, including WASM Components, WIT packages, executables, DLLs, npm packages, Rust crates, legacy non-component wasm modules, and containers.
- Loop should focus on provider and capability composition, grants, authentication, communication protocols, workspace installation of content, watcher-driven ergonomics, and practical CLI/daemon/kernel boundaries.
- WIT contracts become the main interop surface across ecosystems. wRPC is the preferred boundary, and adapters are the normal escape hatch for transports such as stdio, native libraries, DLLs, browser bridges, or other protocol boundaries.
- Patch plans move out of the center of the architecture. They remain useful, but as a workflow or plugin type the platform can execute rather than as the platform's defining model.
- The default Loop install should be a practical product surface: a CLI frontend talking to a host daemon that runs a simple kernel, ships with default providers and plugins, and can publish, fetch, install, and run OCI-backed units.
- The long-term product is not one giant loop runtime package. It is a coherent system assembled from smaller registry-backed parts.

## Decommissioning / Replacement Scope

### Retire or supersede

- `apps/forge-web`
- `apps/forge-desktop`
- `packages/forge-app`
- `packages/forge-api`
- `packages/contracts` (`@loop-kit/forge-contracts`)
- `packages/loop-cli`
- `packages/loop-mcp`
- `packages/loop-kernel`
- `packages/loop-contracts`
- `packages/loopd`
- `packages/loop-ai`
- The current `/loop` local-manifest model as the primary registry abstraction

### Build toward

- A new local-first Forge product shell that uses the Sleek stack where it fits the user-facing product.
- A rewritten Loop workspace, daemon, and CLI model with a stronger host/kernel-centered capability architecture.
- OCI-native artifact publishing, caching, and fetching flows, including a dedicated registry client package and an MCP-facing registry surface.
- Capability-driven providers, grants, adapters, and WIT-first unit definitions that are easier to test, simulate, snapshot, and reproduce.
- A loop-kit standard surface defined as WIT packages and worlds, with small optional extensions instead of one monolithic contract.

## Core Platform Direction

- Treat OCI artifact storage as the foundation for real reusable units, including source code when source is intentionally stored as an artifact rather than as a lane-style mutable workspace abstraction.
- Focus near-term Loop work on the provider/capability model: grants, authentication, provider registration, composition boundaries, workspace and computer-level configuration, and installation/execution flows.
- Keep lanes and refs as useful concepts where they still help, but shift primary investment away from lane-heavy git integration and toward OCI-backed artifacts plus explicit references and cached content.
- Make patch-plan-like behavior a workflow surface: a plugin can emit declarative steps, and those steps run through pluggable capability-aware operations rather than a bespoke central DSL dominating the platform.
- Build the kernel and daemon around creating OCI units, loading OCI units, publishing OCI units, fetching OCI units, and running those units safely through capability grants and adapters.
- Treat the host itself as composable: providers can be implemented by components, executables, DLLs, or containers as long as they satisfy the right WIT surface and grant model.

## Developer Experience Direction

- Start with TypeScript-first authoring where practical and Rust-first authoring where WASM tooling, host integration, or low-level runtime work demand it.
- Support packaging with Javy or JCO for wasm component output where that fits the unit.
- Keep the platform broader than wasm components alone: normal JS packages, native extensions, executables, and other artifacts can still participate when they expose or can be adapted to WIT shapes.
- Invest in daemon plugins and filesystem-watcher workflows that detect imports of registry refs and generate smart `.d.ts` and related type surfaces so OCI-backed units feel local inside TypeScript projects.
- Make the tooling smart about composition boundaries: direct wasm-to-wasm composition where possible, capability requirements where direct composition is not possible, and adapters when a native or protocol boundary must be crossed.
- Treat automation components and workflow units as first-class artifacts so development, deployment, and agentic workflows can be shipped through the same registry and host model.
- Use containers as a portability escape hatch for toolchains and languages that are not practical to run natively on every host, such as Linux-only compilers.

## Related Existing Project Plans

- [003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md): primary execution plan for the Loop rewrite.
- [004-agentic-dev-workflow.md](../../project-plans/active/004-agentic-dev-workflow.md): related operator workflow that should help bootstrap the new platform and its automation units.
- [001-forge-prototype.md](../../project-plans/on-hold/001-forge-prototype.md): older Forge seed material that this vision supersedes directionally.
- [002-graphite-improvements.md](../../project-plans/on-hold/002-graphite-improvements.md): still useful, but not part of the Loop core rewrite.

## Open Research Themes

- Workspace-level versus computer-level grant and configuration boundaries.
- The exact package split for registry client, provider SDKs, WIT definitions, adapters, and default built-in providers.
- How far native extensions and plain JS packages should participate directly in the host versus through explicit adapter boundaries.
- The first version of the loop-kit standard surface: which WIT packages belong in core, which belong in extensions, and what compatibility rules should govern them.
- The best watcher/codegen rules for mapping ref imports to local developer ergonomics without creating fragile magic.
- Benchmarking and interface-shape work that should continue in Graphite and Dock without mixing those efforts into Forge decommissioning scope.

## Notes

- Graphite and Dock remain valuable and should continue as separate improvement efforts. This vision does not decommission them.
- The intent-versus-state philosophy and local-first architecture goals remain important, but they belong in Graphite/UI/platform-alignment work rather than being collapsed into the Forge replacement scope.
- The immediate value of this vision is to make future project plans clearer: practical OCI units first, WIT surfaces first, capability shapes first, adapters where needed, and less architecture gravity around theoretical patch-plan systems or oversized legacy packages.

## Backlinks

<!-- markdown-backlinks:start -->
- [architecture.md](../../../architecture.md)
- [docs/next-actions/active/007-loop-rewrite-inventory-and-cut-line.md](../../next-actions/active/007-loop-rewrite-inventory-and-cut-line.md)
- [docs/next-actions/active/008-oci-registry-foundation.md](../../next-actions/active/008-oci-registry-foundation.md)
- [docs/next-actions/active/012-host-kernel-boundary-discipline.md](../../next-actions/active/012-host-kernel-boundary-discipline.md)
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- [docs/ref/loop-kit-fundamentals/index.md](../../ref/loop-kit-fundamentals/index.md)
- [docs/visions/active/001-agentic-development-workflow.md](001-agentic-development-workflow.md)
<!-- markdown-backlinks:end -->
