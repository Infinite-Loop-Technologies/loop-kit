# Registry Hosting Baseline

## Decision Needed

Choose the first hosted OCI registry posture the rewrite should optimize for.

## Why It Matters

This affects auth assumptions, packaging effort, cache expectations, and how much custom server work belongs in the first implementation.

## Proposed Starting Position

Start with the simplest hosted registry that satisfies real artifact push/pull needs, then layer custom Loop metadata and MCP surfaces around it instead of building a bespoke registry service on day one.

## Human Input Wanted

- Is there a registry you already want as the v0 baseline?
- Are there hard requirements around self-hosting, public/private access, or multi-tenant behavior?

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
