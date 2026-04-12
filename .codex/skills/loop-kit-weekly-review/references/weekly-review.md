# Loop-Kit Weekly Review

The weekly review is the ritual that keeps the markdown control plane trustworthy.

Review these layers:

1. `AGENT_INBOX.md`
2. `HUMAN_INBOX.md`
3. `CHECKLIST.md`
4. `ARCHITECTURE.md`
5. relevant docs in `references/`
6. local Git branch state
7. remote branch and PR state when relevant

Before opening reference docs, scan the `references/` filenames and only load the ones that are obviously relevant to the stale work, blockers, or architectural drift you are reviewing.

Questions to answer:

- What is still open?
- What is blocked?
- What is stale?
- What should be captured but is not yet tracked?
- Which checklist items are obsolete, done, or too vague?
- Which inbox items should become checklist items, human asks, or reference material?
- Which reference docs are outdated, duplicated, or no longer worth keeping?
- Which branches and tasks no longer match?
- Which user blockers are still unresolved?

Inbox processing rules:

1. toss it
2. do it if it is truly tiny
3. move it to `CHECKLIST.md`
4. move it to `HUMAN_INBOX.md`
5. fold it into `ARCHITECTURE.md` or a reference doc

Expected outputs:

- cleaned-up inboxes
- updated checklist state
- clearer human blockers
- pruned or updated reference docs
- explicit follow-up captures where needed
- a concise review summary to the user

Allowed during the review:

- small, obvious cleanup actions that take only a few minutes
- low-risk file cleanup or markdown cleanup that can be validated immediately

Not allowed during the review:

- hiding risky refactors or destructive cleanup inside the ritual
- leaving human-owned blockers out of `HUMAN_INBOX.md`
