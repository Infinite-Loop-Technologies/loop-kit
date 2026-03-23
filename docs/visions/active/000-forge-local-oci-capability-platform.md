# Forge Local OCI Capability Platform

## Strategic Outcome

Reset Forge as a slimmer, sleeker, local-first AI agent coding assistant that runs on the user's computer for the foreseeable future, while re-centering loop-kit around OCI-backed composable units, explicit capability shapes, secure grants, and daemon/kernel/CLI workflows that are practical to ship and evolve.

This vision is a strategic direction above individual project plans. It supersedes the old Forge prototype direction at the vision level without deleting existing project-plan seed material yet.

## Architectural Bets

- OCI becomes the real registry layer for important composable units instead of keeping registry concepts mostly theoretical or duplicated on the filesystem.
- The most important units should be addressable, publishable, fetchable, and composable as OCI artifacts, including wasm components, WIT interfaces, executables, DLLs, npm packages, Rust crates, legacy non-component wasm modules, and containers.
- Loop should focus on provider and capability composition, grants, authentication, communication protocols, workspace installation of content, git-aware workflows, daemon plugins, and practical CLI/daemon/kernel boundaries.
- WIT contracts become the main interop surface across ecosystems. wRPC is the preferred contract boundary, and adapters are the normal escape hatch for transports such as stdio, native libraries, DLLs, or other protocol bridges.
- Patch plans move out of the center of the architecture. They remain useful, but as a workflow or plugin type the platform can execute rather than as the platform's defining model.
- The default Loop install should be a practical product surface: a CLI frontend talking to a daemon that runs the kernel, ships with default providers and CLI plugins, and can publish, fetch, and run OCI-backed units.

## Decommissioning / Replacement Scope

### Retire or supersede

- `apps/forge-web`
- `apps/forge-desktop`
- `packages/forge-app`
- `packages/forge-api`
- `packages/contracts` (`@loop-kit/forge-contracts`)

### Build toward

- A new local-first Forge product shell that uses the Sleek stack where it fits the user-facing product.
- A rewritten Loop workspace, daemon, and CLI model with a stronger kernel-centered capability architecture.
- OCI-native artifact publishing and fetching flows, including a dedicated registry client package.
- Capability-driven providers, grants, adapters, and WIT-first unit definitions that are easier to test, simulate, snapshot, and reproduce.

## Core Platform Direction

- Treat OCI artifact storage as the foundation for real reusable units, including source code when source is being stored as an artifact rather than as a lane-style mutable workspace abstraction.
- Focus near-term Loop work on the provider/capability model: grants, authentication, provider registration, communication boundaries, workspace and computer-level configuration, and installation/execution flows.
- Keep lanes and refs as useful concepts where they still help, but shift primary investment away from lane-heavy git integration and toward OCI-backed artifacts plus explicit references.
- Make patch-plan-like behavior a workflow surface: a plugin can emit declarative steps, and those steps run through pluggable capability-aware operations rather than a bespoke central DSL dominating the platform.
- Build the kernel and daemon around creating OCI units, loading OCI units, deploying OCI units, fetching OCI units, and running those units safely through capability grants and adapters.

## Developer Experience Direction

- Start with TypeScript-first authoring and Rust-second authoring for reusable units and providers.
- Support packaging with Javy or JCO for wasm component output where that fits the unit.
- Keep the platform broader than wasm components alone: normal JS packages, native extensions, executables, and other artifacts can still participate when they expose or can be adapted to WIT shapes.
- Invest in daemon plugins and filesystem-watcher workflows that detect imports of registry refs and generate smart `.d.ts` and related type surfaces so OCI-backed units feel local inside TypeScript projects.
- Make the tooling smart about composition boundaries: direct wasm-to-wasm composition where possible, capability requirements where direct composition is not possible, and adapters when a native or protocol boundary must be crossed.

## Related Existing Project Plans

- [000-themeable-ui-library-improvements.md](../../project-plans/active/000-themeable-ui-library-improvements.md): related but distinct UI-system direction; keep active separately.
- [001-forge-prototype.md](../../project-plans/active/001-forge-prototype.md): seed material that this vision supersedes directionally; rewrite or realign later rather than deleting now.
- [002-graphite-improvements.md](../../project-plans/active/002-graphite-improvements.md): related but distinct Graphite improvement track; keep active separately.
- [003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md): seed material that this vision supersedes directionally; rewrite or realign later rather than deleting now.

## Open Research Themes

- Workspace-level versus computer-level grant and configuration boundaries.
- The exact package split for registry client, provider SDKs, WIT definitions, adapters, and default built-in providers.
- How far native extensions and plain JS packages should participate directly in the daemon versus through explicit adapter boundaries.
- The best watcher/codegen rules for mapping ref imports to local developer ergonomics without creating fragile magic.
- Benchmarking and interface-shape work that should continue in Graphite and Dock without mixing those efforts into Forge decommissioning scope.

## Notes

- Graphite and Dock remain valuable and should continue as separate improvement efforts. This vision does not decommission them.
- The intent-versus-state philosophy and local-first architecture goals remain important, but they belong in Graphite/UI/platform-alignment work rather than being collapsed into the Forge replacement scope.
- The immediate value of this vision is to make future project plans clearer: practical OCI units first, capability shapes first, adapters where needed, and less architecture gravity around theoretical patch-plan systems.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/visions/active/001-agentic-development-workflow.md](001-agentic-development-workflow.md)
<!-- markdown-backlinks:end -->
