---
name: loop-kit-weekly-review
description: Use when running the loop-kit weekly review or when the inboxes, checklist, branches, or reference docs look neglected. This skill defines the GTD-inspired weekly review for the markdown control plane.
---

# Loop-Kit Weekly Review

Use this skill when the user asks for a weekly review or when the control plane clearly needs one.

Read [references/weekly-review.md](C:\Users\ijhar\Desktop\loop-kit\.codex\skills\loop-kit-weekly-review\references\weekly-review.md) first.

## Workflow

1. Review `AGENT_INBOX.md` item by item.
2. Review `HUMAN_INBOX.md`.
3. Review `CHECKLIST.md`.
4. Review `ARCHITECTURE.md`.
5. Review relevant docs in `references/`.
6. Review local Git and remote branch or PR state.
7. Reconcile Git reality against markdown control-plane reality.
8. Capture follow-ups, cleanup candidates, and blockers back into the right markdown file.
9. Summarize proposed cleanup instead of silently doing risky cleanup.

## Defaults

- Look for stale branches, stale tasks, blocked work, outdated references, and orphan human asks.
- Process inbox items with GTD-style triage instead of letting them accumulate.
- Treat "important project with no clear next checklist item or reference doc" as a review smell.
- Prefer concise updates to the existing markdown files over writing a large review report.
