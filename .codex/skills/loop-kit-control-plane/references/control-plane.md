# Loop-Kit Control Plane

The canonical control plane for `loop-kit` is repo-local markdown.

Use these files:

- `CHECKLIST.md` for durable task tracking
- `AGENT_INBOX.md` for temporary future-relevant captures
- `HUMAN_INBOX.md` for explicit user-facing asks and blockers
- `ARCHITECTURE.md` for repo map, architectural direction, and invariants
- `references/` for durable support material when it does not belong in a package

Defaults:

- scan `references/` filenames first, then open only the obviously relevant docs
- keep reference filenames descriptive enough that a quick scan is useful
- use markdown checkboxes in `HUMAN_INBOX.md` for actionable human tasks
- add a short `(followup: message me "...")` note on human tasks when it helps the next handoff
- if an inbox capture becomes long, move it into `references/inbox/` and keep only a pointer in the inbox

## Slice Semantics

A slice is the smallest bounded unit of repo work worth tracking across:

- Git branches
- validation
- blockers
- follow-ups
- review

A slice is usually one branch-sized implementation unit, but very small coherent work may happen directly on `dev`.

Keep slice tracking lightweight. In most cases, the relevant checklist section is enough.

## Session Open

At session start:

1. glance `AGENT_INBOX.md`
2. glance `HUMAN_INBOX.md`
3. glance the relevant part of `CHECKLIST.md`
4. scan `references/` filenames and open only the obvious relevant docs
5. read `ARCHITECTURE.md` if the work is architectural or unfamiliar
6. identify the next coherent slice before coding

## Inbox Processing

Process relevant inbox items before coding:

1. toss it
2. do it if it is truly tiny
3. move it to `CHECKLIST.md`
4. move it to `HUMAN_INBOX.md`
5. fold it into `ARCHITECTURE.md` or a reference doc if it is durable knowledge

Never move an item out of `AGENT_INBOX.md` and then put the same unresolved note back there.

## Capture Habit

Capture aggressively when something should not be lost:

- workflow friction
- follow-up ideas
- blocked items
- questions for the user
- cleanup candidates
- future-agent reminders

But keep captures lightweight. Do not create new files unless the existing ones are not enough.

## Reference Defaults

- Prefer package-local docs for package-local truths.
- Use `references/` when a topic spans multiple packages or represents repo-level support material.
- Prefer obvious filenames over links.
- Delete stale reference docs instead of creating archives by default.

## Session Close

At session end:

1. update the relevant checklist items with current reality if needed
2. clear processed inbox items
3. add a note to `HUMAN_INBOX.md` when the user or a future session needs something explicit
4. mention in chat what was placed into the human inbox
