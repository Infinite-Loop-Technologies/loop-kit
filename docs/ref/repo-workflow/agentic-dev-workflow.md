# Agentic Dev Workflow

This repo needs a practical agentic development workflow now, before the long-term Loop OCI capability platform exists.

## Purpose

Use Bun-based repo automation, Moon, MCP servers, repo knowledge docs, and inbox-driven GTD habits to create a controllable agent workflow that stays reviewable and does not turn the repo into spaghetti.

## Core Principles

- Prefer simple, inspectable workflow machinery now over waiting for the full future Loop runtime.
- Treat `docs/agent-inbox/` as the durable intake queue for humans, webhooks, scripts, bug reports, and other agents.
- Keep execution grounded in `vision -> project plan -> next action`.
- Favor one active execution agent at a time until the control loop is reliable.
- Use Moon, MCP tools, validation scripts, and Bun-powered repo scripts to reduce ad hoc shell behavior and hidden state.
- Automate metadata and hygiene only when automation owns the upkeep. Do not rely on the agent to maintain decorative metadata by hand.

## Target Short-Term Substrate

- Moon as the structured task and query layer.
- Moon MCP as a first-class workspace inspection tool for agents.
- The Bun-powered `tools/` package as the short-term orchestration substrate for local agent runs, review loops, event-driven triggers, and operator tooling.
- Codex as the primary execution agent inside that loop, ideally controlled through the Codex SDK when structured thread control matters.
- Custom MCP servers and utility scripts as controllable building blocks that run alongside agent sessions.
- A lightweight operator surface, initially CLI-first and optionally later a lightweight web UI, for prompting agents, inspecting MCP output, and supervising runs.

The first automation home should live outside `packages/`, because this is operational workflow code rather than product runtime code. The Bun-powered `tools/` package is the current home, with Moon tracking it as a first-class project.

## Operating Loop

1. Emergency scan `docs/agent-inbox/`.
2. If a captured item is urgent or trivial, handle it immediately.
3. Otherwise choose from `docs/next-actions/active`.
4. Review the linked project plan, vision, and supporting reference material.
5. Execute with verification, leaving behind a reviewable diff and clear notes.
6. Open or update a PR when the task warrants it.
7. Run a follow-up review/verification loop, ideally automated, to inspect logs, validation results, and architectural risks.
8. Return to the inbox and repeat.

After several execution loops, run a cleanup and weekly review loop to reconcile inboxes, visions, project plans, next actions, references, and stale assumptions.

## Inbox-Driven Autonomy

- `docs/agent-inbox/` is allowed to receive automated injections at any time.
- Inputs can come from humans, GitHub events, bug reports, generated prompts, local automation, or future webhooks/app integrations.
- `docs/human-inbox/` is the place for blocked handoffs back to a person.
- When a human finishes a blocked item, the result should go back into `docs/agent-inbox/` so the queue remains the single async intake point.

This queue-based model is a major part of how the repo can support a durable autonomous worker without forcing the agent to keep too much transient context alive.

## What The Repo Should Gradually Gain

- Better Moon task coverage and documentation, including useful query-driven workflows.
- A working Moon MCP setup that points at the actual workspace.
- Bun-powered repo automation for prompt-driven agent launch, verification, review, and recurring maintenance loops.
- Knowledge-management tools for inbox processing, next-action hygiene, stale-doc detection, and review-date automation.
- Repo hygiene checks that catch floating junk, stale structure, and architectural drift.
- Skills and tools that agents can improve over time instead of repeatedly improvising the same workflows.

## Initial Automation Entrypoints

- `prompt-run`: operator supplies the prompt and optional scope, and the workflow manages setup, Codex execution, verification, and reviewable output.
- `weekly-review`: no-prompt recurring workflow for inbox scan, active-plan review, repo-health checks, and follow-up capture.
- `inbox-sweep`: no-prompt or lightly-configured workflow that turns captured work into next actions, project plans, or human-blocked items.
- `verification-review`: run targeted checks and produce a summarized operator-facing review artifact.

Not every useful helper needs to become a first-class automation entrypoint immediately. For example, markdown backlink generation is a good utility for the `tools/` package to call as part of a broader workflow, but not an especially good first candidate to rewrite from scratch.

## Guardrails

- Never keep developing on `main`.
- Do not let active projects exist without at least one real next action.
- Do not let next actions degrade into tiny checklist spam.
- Do not add metadata that no automation owns.
- Prefer explicit review, verification, and PR artifacts over silent autonomous mutation.
- Build the operator workflow so humans can inspect what the agent saw, what tools it called, and what the system injected.

## Related Docs

- [repo workflow](./index.md)
- [weekly review](./weekly-review.md)
- [validation and verification](./validation-and-verification.md)
- [moon and proto](./moon-proto.md)
- [PLANS.md](../../../PLANS.md)

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/next-actions/active/003-dagger-codex-runner-foundation.md](../../next-actions/active/003-dagger-codex-runner-foundation.md)
- [docs/next-actions/active/004-recurring-agent-review-entrypoints.md](../../next-actions/active/004-recurring-agent-review-entrypoints.md)
- [docs/next-actions/active/006-agentic-knowledge-automation-boundaries.md](../../next-actions/active/006-agentic-knowledge-automation-boundaries.md)
- [docs/next-actions/completed/001-dagger-agent-control-loop-spike.md](../../next-actions/completed/001-dagger-agent-control-loop-spike.md)
- [docs/project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
- [docs/ref/repo-workflow/index.md](index.md)
- [docs/ref/repo-workflow/validation-and-verification.md](validation-and-verification.md)
<!-- markdown-backlinks:end -->
