# Agentic Knowledge Automation Boundaries

## Outcome

Decide which knowledge-work helpers belong inside the Dagger-driven agent workflow now versus which should remain standalone scripts or skills for the time being.

## Links

- Project plan: [../../project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
- Support material: [../../ref/repo-workflow/index.md](../../ref/repo-workflow/index.md)
- Support material: [../../ref/repo-workflow/agentic-dev-workflow.md](../../ref/repo-workflow/agentic-dev-workflow.md)
- Support material: [../../../AGENTS.md](../../../AGENTS.md)

## Next Actions

- Identify the first repo helpers that Dagger should orchestrate instead of reimplementing, such as markdown backlinks, targeted validation, and inbox hygiene scripts.
- Define a rule for when a helper deserves to become a Dagger function, a Moon task, a Codex skill, or just stay a plain script.
- Specify where recurring run reports, summaries, and generated follow-up docs should live in the repo.
- Keep the first pass focused on operator-visible value, not maximal workflow abstraction.

## Notes

- Markdown backlink generation is a good candidate to be called by Dagger, but not a strong candidate to be rewritten into Dagger first.
- The core product of this effort is the agent workflow, not automation cosplay.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
<!-- markdown-backlinks:end -->
