# Moon Operator Surface

## Outcome

Make Moon the standard trigger surface for Bun-based agent workflows so humans and agents can run the same named operations with pinned tooling.

## Links

- Project plan: [../../project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
- Support material: [../../ref/repo-workflow/moon-proto.md](../../ref/repo-workflow/moon-proto.md)
- Support material: [../../../.moon/workspace.yml](../../../.moon/workspace.yml)

## Next Actions

- Decide how Moon should discover and describe the Bun-powered automation project under `tools/`.
- Add or document target names for the first operator flows, such as prompt run, weekly review, inbox sweep, and verification review.
- Keep task naming stable and boring so they become dependable operator commands instead of prompt fragments.
- Document how Moon queries and task discovery should support the Bun operator surface.

## Notes

- This is the layer where repo-local ergonomics matter most.
- Prefer explicit Moon task names over shell aliases that hide behavior.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
<!-- markdown-backlinks:end -->
