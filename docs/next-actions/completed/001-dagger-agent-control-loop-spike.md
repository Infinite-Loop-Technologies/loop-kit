# Dagger Agent Control Loop Spike

## Outcome

Design and prototype the first Dagger-driven control loop for local agent work in this repo so prompting, verification, and operator visibility stop depending on a loose manual UI workflow.

## Links

- Project plan: [../../project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
- Support material: [../../ref/repo-workflow/agentic-dev-workflow.md](../../ref/repo-workflow/agentic-dev-workflow.md)
- Support material: [../../agent-inbox/README.md](../../agent-inbox/README.md)

## Next Actions

- Defined the smallest useful control-loop shape at the planning level: prompt-driven run, repo context loading, verification, and reviewable outputs.
- Chose a CLI-first operator surface and split the work into distinct next actions instead of one oversized spike.
- Identified the first follow-up hooks: recurring review runs, inbox-oriented flows, Moon-triggered operator commands, and knowledge-automation boundaries.

## Notes

- One reliable agent loop is more valuable than premature multi-agent orchestration.
- Keep the first spike inspectable and easy to debug.
- The next step is execution: build the Codex-backed Dagger module and its first operator entrypoints.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
