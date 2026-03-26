---
name: loop-kit-weekly-review
description: Use when running the loop-kit weekly review or when the inboxes, handoffs, branches, or project horizons look neglected. This skill defines the GTD-style weekly review for human-agent collaboration in the loop-kit control plane.
---

# Loop-Kit Weekly Review

Use this skill when the user asks for a weekly review or when the control plane clearly needs one.

Read [references/weekly-review.md](C:\Users\ijhar\Desktop\loop-kit\.codex\skills\loop-kit-weekly-review\references\weekly-review.md) first.

## Workflow

1. Review `Agent Inbox` and `Human Inbox`.
2. Review active `#Project` and `#Slice` state.
3. Review local Git and remote branch or PR state.
4. Reconcile Git reality against Tana reality.
5. Capture follow-ups, cleanup candidates, and blockers back into Tana.
6. Update `Last Reviewed On` on the reviewed projects and slices.
7. Summarize proposed cleanup instead of silently doing risky cleanup.

## Defaults

- Look for stale branches, stale slices, missing slices, blocked work, and orphan handoffs.
- Reconcile horizons from `#Vision` to `#Project` to `#Slice`.
- Treat \"active project with no next slice\" as a review smell; either define the next slice or stop pretending the project is active.
- Prefer adding concise review findings to Tana over long repo-local markdown reports.
