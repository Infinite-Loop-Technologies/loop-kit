# Validation And Verification

Validation is required before a task is done. Use the smallest defensible check set for the risk, but do not skip review just because the change is "only docs."

## Default Order

1. Run the relevant targeted checks.
2. Review the diff for scope creep and stale paths.
3. Re-read [repo workflow](./index.md) if the task touched repo guidance, plans, or other shared markdown workflows.
4. Do the inbox emergency scan from [repo workflow](./index.md) before closing a non-trivial task.
5. Report what you verified and what you did not.

## What To Run

- Prefer Moon + Proto:
  `proto run moon -- run :lint`,
  `proto run moon -- run :typecheck`,
  `proto run moon -- run :test`,
  or narrower project targets when available.
- For workflow or automation changes, also verify the relevant Moon query or MCP commands if you documented them.
- If Moon coverage is not ready yet, use the nearest package or root script that proves the changed behavior.
- For doc and repo-workflow changes, at minimum verify paths, links, renamed folders, workflow consistency, and run the `markdown-backlinks` skill.

## UI Validation

For non-trivial UI work, use Playwright MCP for real interaction validation instead of visual guessing. Add or improve automated tests when behavior changes, and add stable selectors such as `data-testid` or other durable `data-*` attributes when needed for automation.

## Related Docs

- [repo workflow](./index.md)
- [weekly review](./weekly-review.md)
- [agentic dev workflow](./agentic-dev-workflow.md)
- [moon-proto](./moon-proto.md)

## Backlinks

<!-- markdown-backlinks:start -->
- [agents.md](../../../agents.md)
- [docs/project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
- [docs/ref/repo-workflow/agentic-dev-workflow.md](agentic-dev-workflow.md)
- [docs/ref/repo-workflow/index.md](index.md)
<!-- markdown-backlinks:end -->
