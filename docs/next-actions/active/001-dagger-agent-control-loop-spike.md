# Dagger Agent Control Loop Spike

## Outcome

Design and prototype the first Dagger-driven control loop for local agent work in this repo so prompting, verification, and operator visibility stop depending on a loose manual UI workflow.

## Links

- Project plan: [../../project-plans/active/004-agentic-dev-workflow.md](../../project-plans/active/004-agentic-dev-workflow.md)
- Support material: [../../ref/repo-workflow/agentic-dev-workflow.md](../../ref/repo-workflow/agentic-dev-workflow.md)
- Support material: [../../agent-inbox/README.md](../../agent-inbox/README.md)

## Next Actions

- Define the smallest useful Dagger-driven run loop: prompt input, repo context loading, verification, and reviewable output.
- Decide what the first operator surface should expose, even if it is only CLI-based initially.
- Identify the first follow-up automation hooks, such as review runs, inbox generation, or local event triggers.

## Notes

- One reliable agent loop is more valuable than premature multi-agent orchestration.
- Keep the first spike inspectable and easy to debug.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/004-agentic-dev-workflow.md](../../project-plans/active/004-agentic-dev-workflow.md)
<!-- markdown-backlinks:end -->
