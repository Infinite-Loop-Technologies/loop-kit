# Grants And Composition

## Purpose

Capability composition is only useful if the runtime can decide who may call what, with which inputs, under which authority. The new Loop host needs both a grant manager/enforcer model and a component/provider composer that use the same vocabulary.

## Grant Model

- Grants should be explicit, inspectable, and scoped to a subject, resource, action, and lifetime.
- Separate workspace-scoped grants from computer-scoped grants.
- Keep grant prompts and approvals product-facing, but keep enforcement host-facing.
- Treat credentials, filesystem access, network access, process spawning, and registry mutation as high-sensitivity capabilities.

## Enforcement Model

- The host should enforce grants at the boundary where capability calls are routed, not only in UI code.
- Provider implementations should declare required capabilities in a way the host can reason about before execution.
- Prefer deny-by-default for powerful providers and mutable operations.
- Capture enough audit information that humans can understand why a call was permitted or blocked.

## Component And Provider Composer

- Components should describe the imports they need and the exports they provide through WIT.
- Providers should advertise the worlds or interfaces they satisfy plus operational constraints such as locality, platform, or transport.
- The composer should be able to wire component-to-component, component-to-provider, and adapter-mediated edges.
- Containers and native binaries should participate through adapters rather than through hidden special cases.

## Open Design Themes

- How much capability negotiation should happen statically at install time versus dynamically at run time?
- How should grants interact with cached artifacts, background watchers, and recurring automation workflows?
- Which provider types belong in the default host versus optional install bundles?

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/next-actions/active/013-grant-manager-and-enforcement.md](../../next-actions/active/013-grant-manager-and-enforcement.md)
- [docs/next-actions/active/014-component-provider-composition.md](../../next-actions/active/014-component-provider-composition.md)
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- [docs/ref/loop-kit-fundamentals/index.md](index.md)
<!-- markdown-backlinks:end -->
