---
name: tana-structured-search
description: Use when composing, debugging, or reviewing non-trivial Tana `search_nodes` queries. This skill captures the local Tana structured-search DSL from the localhost OpenAPI spec and the repo's observed MCP behavior, so searches are built from documented shapes instead of guesswork.
---

# Tana Structured Search

Use this skill before writing anything beyond a trivial `textContains` query for Tana.

Read [docs/tana-structured-search.md](C:\Users\ijhar\Desktop\loop-kit\docs\tana-structured-search.md) first.

## Workflow

1. Build the query from the documented JSON shapes in the repo doc, not from memory.
2. Keep each condition object to one operator unless you are explicitly using `and`, `or`, or `not`.
3. Scope with `workspaceIds` outside the `query` object.
4. Start with the smallest predicate that should match.
5. Verify important results with `read_node` because structured search behavior has shown false negatives.

## Defaults

- Prefer `textContains` to anchor on a known node before trying structural filters.
- Prefer exact IDs for tags, fields, and nodes.
- Treat `hasType`, `field`, `childOf`, and `ownedBy` as higher-risk queries that need verification.
- If a query fails, reduce it to one predicate before changing operators.

## Do Not

- Do not invent unsupported operators.
- Do not mix multiple unrelated operators in one object unless the DSL explicitly calls for boolean composition.
- Do not assume the raw HTTP `deepObject` encoding is the same thing you should pass to the MCP tool.
