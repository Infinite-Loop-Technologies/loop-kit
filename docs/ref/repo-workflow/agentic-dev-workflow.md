# Agentic Dev Workflow

This repo needs a practical agentic development workflow now, before the long-term Loop OCI capability platform exists.

## Purpose

Use Dagger, Moon, MCP servers, repo knowledge docs, and inbox-driven GTD habits to create a controllable agent workflow that stays reviewable and does not turn the repo into spaghetti.

## Core Principles

- Prefer simple, inspectable workflow machinery now over waiting for the full future Loop runtime.
- Treat `docs/agent-inbox/` as the durable intake queue for humans, webhooks, scripts, bug reports, and other agents.
- Keep execution grounded in `vision -> project plan -> next action`.
- Favor one active execution agent at a time until the control loop is reliable.
- Use Moon, MCP tools, validation scripts, and Dagger functions to reduce ad hoc shell behavior and hidden state.
- Automate metadata and hygiene only when automation owns the upkeep. Do not rely on the agent to maintain decorative metadata by hand.

## Target Short-Term Substrate

- Moon as the structured task and query layer.
- Moon MCP as a first-class workspace inspection tool for agents.
- Dagger as the short-term orchestration substrate for local agent runs, review loops, event-driven triggers, and operator tooling.
- Custom MCP servers and utility scripts as controllable building blocks that run alongside agent sessions.
- A lightweight operator surface, initially CLI-first and optionally later a lightweight web UI, for prompting agents, inspecting MCP output, and supervising runs.

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
- Dagger functions/modules for agent launch, verification, review, and recurring maintenance loops.
- Knowledge-management tools for inbox processing, next-action hygiene, stale-doc detection, and review-date automation.
- Repo hygiene checks that catch floating junk, stale structure, and architectural drift.
- Skills and tools that agents can improve over time instead of repeatedly improvising the same workflows.

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
- [agents.md](../../../agents.md)
- [docs/next-actions/active/001-dagger-agent-control-loop-spike.md](../../next-actions/active/001-dagger-agent-control-loop-spike.md)
- [docs/project-plans/active/004-agentic-dev-workflow.md](../../project-plans/active/004-agentic-dev-workflow.md)
- [docs/ref/repo-workflow/index.md](index.md)
- [docs/ref/repo-workflow/validation-and-verification.md](validation-and-verification.md)
<!-- markdown-backlinks:end -->
