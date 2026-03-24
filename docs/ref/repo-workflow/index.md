# Repo Workflow

## Purpose

This repo uses a lightweight GTD-inspired knowledge system so work stays fast, queryable, and easy to resume. The core loop is: capture, clarify, organize, review, engage.

Use this doc as the operating manual for repo knowledge work. If the task is knowledge-management-based, review this file before making edits and again before you finish. Follow the important links it points to.

## System Map

- [PLANS.md](../../../PLANS.md): quick index to the planning system
- `docs/visions/`: strategic directions that can contain multiple project plans
- `docs/project-plans/`: large outcomes and support material
- `docs/next-actions/`: immediate executable actions, similar to a GTD next-actions list but still sized for a substantial session
- `docs/agent-inbox/`: raw captures, agent handoffs, and prompts
- `docs/human-inbox/`: blocked-on-human items
- `docs/ref/`: references worth keeping around
- [agentic-dev-workflow.md](./agentic-dev-workflow.md): autonomous and semi-autonomous repo workflow guidance
- [weekly-review.md](./weekly-review.md): recurring review checklist
- [validation-and-verification.md](./validation-and-verification.md): required finish-line checks
- [moon-proto.md](./moon-proto.md): toolchain scaffold

## Default Flow

### 1. Capture

Put ideas, prompts, bug reports, webhook events, and loose ends somewhere explicit. Use `docs/agent-inbox/` for agent-owned capture and `docs/human-inbox/` for human-blocked items. Do a quick mind sweep when context feels fragmented.

### 2. Clarify

Decide whether the item is actionable.

- If it can be done in 2 minutes or less and is clearly in scope, do it.
- If it can be done in roughly 5 minutes or less and it is obviously the right next move, do it instead of recording it.
- If it is actionable but larger, turn it into a next action.
- If it is a larger outcome with multiple possible actions, turn it into a project plan and create or link the next action immediately.
- If it is a repo-spanning direction likely to contain multiple project plans, turn it into a vision.
- If it is not actionable now, park it in `someday-maybe`, `on-hold`, or reference material.

### 3. Organize

Use the status folders consistently for visions, plans, and next actions:

- `active`: ready to pull soon
- `wip`: currently being worked
- `on-hold`: blocked or intentionally paused
- `someday-maybe`: worth keeping, not worth doing now
- `completed`: done, but still useful to search later

Use the planning hierarchy intentionally: `vision -> project plan -> next action`.

- Visions hold strategic direction, architectural bets, replacement scope, and linked project plans.
- Project plans hold large outcomes inside a vision or standalone effort.
- Next actions hold the immediate execution surface. They should be substantial enough to spark real work, not tiny checklist fragments.

Exact next actions should move into `docs/next-actions/` instead of hiding inside project plans.

## Autonomous Agent Loop

The repo is being shaped so an agent can work asynchronously and safely with a human in the loop.

1. Run an emergency scan on `docs/agent-inbox/`.
2. Do any urgent or truly small work immediately.
3. Otherwise pull from `docs/next-actions/active`, then review the linked project plan, vision, and reference docs.
4. Execute the action, verify it, and leave behind reviewable output.
5. Periodically run a cleanup and weekly review loop so inboxes, visions, project plans, next actions, and references stay aligned.

Use [agentic-dev-workflow.md](./agentic-dev-workflow.md) for the richer policy and operating model.

## Required Review Behavior

Before you consider a non-trivial task done:

1. Review [validation-and-verification.md](./validation-and-verification.md) and complete the relevant checks.
2. Do an inbox emergency scan:
   look through `docs/agent-inbox/`, do anything small and relevant now, and convert the rest into next-action files, project plans, or visions.
3. Move any human blockers into `docs/human-inbox/` as separate files.
4. If you touched planning or repo-knowledge structure, scan linked docs for stale paths or stale assumptions.

For ongoing repo health, use the [weekly review](./weekly-review.md) often.

## Minimal Templates

### Vision

```md
# <Vision name>

## Strategic Outcome

<What long-term direction should become true?>

## Architectural Bets

- <major bet>

## Decommissioning / Replacement Scope

- Retire: <current surfaces to remove or supersede>
- Build toward: <replacement surfaces or platform model>

## Linked Project Plans

- <path to active project plan>

## Open Research Themes

- <important unresolved area>
```

### Project Plan

```md
# <Project name>

## Desired Outcome

<What should be true when this is done?>

## Support Material

- <docs, links, code paths, references>

## Potential Steps

- <big possible moves only>

## Linked Next Actions

- <path to active or wip next action>
```

### Next Action

```md
# <Action name>

## Outcome

<What this action should complete>

## Links

- Project plan: <path>
- Support material: <paths or URLs>

## Next Actions

- <actionable step>
- <actionable step>

## Notes

- <constraints, decisions, follow-ups>
```

Keep next actions actionable and substantial. If a task is so small it clearly fits the 2-minute or 5-minute rule, do it instead of creating a next action.

## Backlinks

<!-- markdown-backlinks:start -->
- [agents.md](../../../agents.md)
- [docs/next-actions/active/004-recurring-agent-review-entrypoints.md](../../next-actions/active/004-recurring-agent-review-entrypoints.md)
- [docs/next-actions/active/006-agentic-knowledge-automation-boundaries.md](../../next-actions/active/006-agentic-knowledge-automation-boundaries.md)
- [docs/next-actions/completed/002-knowledge-workflow-hygiene.md](../../next-actions/completed/002-knowledge-workflow-hygiene.md)
- [docs/ref/repo-workflow/agentic-dev-workflow.md](agentic-dev-workflow.md)
- [docs/ref/repo-workflow/validation-and-verification.md](validation-and-verification.md)
- [plans.md](../../../plans.md)
<!-- markdown-backlinks:end -->
