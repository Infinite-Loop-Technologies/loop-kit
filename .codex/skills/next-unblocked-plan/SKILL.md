---
name: next-unblocked-plan
description: Find the next active execution plan that is ready to execute now, skipping plans with explicit blockers.
---

# Next Unblocked Plan

Use this when the user asks what to do next or asks for work that is not blocked.

## Workflow

1. Run `pnpm run plans:next`.
2. If a plan is returned, inspect the referenced file before acting on it.
3. If no plan is returned, explain whether the active queue is empty or blocked and point at `docs/exec-plans/index.md`, `docs/exec-plans/wip/`, and `docs/exec-plans/on-hold/`.

## Guardrails

- This only inspects `docs/exec-plans/active/`.
- A plan with any bullet under `## Blockers` is treated as blocked.
- If a plan is malformed, repair the plan file instead of guessing around it.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
