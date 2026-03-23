---
name: weekly-repo-review
description: Run a weekly review for plans, inboxes, references, and knowledge-work artifacts so stale items are easy to spot and refresh.
---

# Weekly Repo Review

Use this when the user asks for a weekly review, stale-item sweep, repo cleanup, or knowledge-work triage.

## Workflow

1. Run `pnpm run review:weekly`.
2. Identify stale plans, inbox items, and references from the output.
3. Refresh `updated` and `last-reviewed` on artifacts that were actually reviewed.
4. Move plans between `wip/`, `active/`, `on-hold/`, and `completed/` when their state has changed.
5. Create or update `human-inbox/` items when the review discovers a real human blocker.

## Guardrails

- Do not bump timestamps mechanically without reading the artifact.
- Prefer converting stale ambiguous notes into explicit plans or deleting them if they no longer matter.
- If a weekly review reveals repeated maintenance pain, propose a new script or skill.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
