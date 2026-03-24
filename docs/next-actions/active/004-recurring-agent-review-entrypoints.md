# Recurring Agent Review Entrypoints

## Outcome

Define the first no-prompt Dagger entrypoints for recurring repo review work so the operator can trigger useful maintenance loops without authoring a new prompt each time.

## Links

- Project plan: [../../project-plans/active/004-agentic-dev-workflow.md](../../project-plans/active/004-agentic-dev-workflow.md)
- Support material: [../../ref/repo-workflow/agentic-dev-workflow.md](../../ref/repo-workflow/agentic-dev-workflow.md)
- Support material: [../../ref/repo-workflow/index.md](../../ref/repo-workflow/index.md)
- Support material: [../../ref/repo-workflow/weekly-review.md](../../ref/repo-workflow/weekly-review.md)

## Next Actions

- Define one weekly-review style entrypoint that performs inbox scan, plan review, and repo-health checks without a custom prompt.
- Define one inbox or triage entrypoint that turns captures into reviewable next actions, project plans, or human-blocked files.
- Specify what artifacts each recurring run should emit so humans can inspect what happened after the fact.
- Keep the first recurring flows single-agent and easy to debug before layering in fan-out or multi-agent behavior.

## Notes

- A no-prompt run still needs explicit policy and deterministic inputs.
- These runs should encode operator intent once and then stay reusable.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/004-agentic-dev-workflow.md](../../project-plans/active/004-agentic-dev-workflow.md)
<!-- markdown-backlinks:end -->
