# Codex Automation Prompts

Reusable prompts for recurring repo-maintenance work in `loop-kit`.

General defaults to include mentally every time:

- scan `AGENT_INBOX.md`, `HUMAN_INBOX.md`, the relevant parts of `CHECKLIST.md`, and `references/` filenames first
- open only the obviously relevant files in `references/`
- use CKB early for non-trivial repo understanding
- put human-owned setup/decisions in `HUMAN_INBOX.md` with markdown checkboxes and `(followup: message me "...")`
- if a capture is too long for `AGENT_INBOX.md`, put the long-form note in `references/inbox/` with an obvious filename and link to it from the inbox

## Mind Sweep / Problem Sweep

### Wide-open mind sweep

```text
Do a creative repo mind sweep for `loop-kit`.

Start by scanning `AGENT_INBOX.md`, `HUMAN_INBOX.md`, the relevant sections of `CHECKLIST.md`, and the filenames in `references/`. Open only the obviously relevant reference docs.

Your goal is not to finish tasks. Your goal is to notice open loops, missing docs, hidden decisions, cleanup candidates, architectural tensions, weird repo smells, and interesting future ideas, then capture them.

Rules:
- be highly generative and curious
- prefer filling `AGENT_INBOX.md` with sharp captures over doing implementation work
- if you discover a clear human-owned blocker or setup step, put it in `HUMAN_INBOX.md`
- if a note is too big for the inbox, create a clearly named file under `references/inbox/` and link it from `AGENT_INBOX.md`
- update `CHECKLIST.md` only when you find something that is clearly actionable and deserves durable task tracking
- do not leave processed inbox items sitting around ambiguously

At the end, summarize the best new captures and any checklist or human-inbox changes you made.
```

### Problem sweep with repo pressure

```text
Do a repo problem sweep for `loop-kit`.

Scan the control plane first: `AGENT_INBOX.md`, `HUMAN_INBOX.md`, `CHECKLIST.md`, and `references/` filenames. Then inspect the codebase for architectural drift, stale docs, weird runtime splits, temp-file buildup, half-finished subsystems, or places where the current repo story does not match the code.

This is a capture pass, not a feature pass.

Output expectations:
- add strong findings and ideas to `AGENT_INBOX.md`
- promote only the clearest actionable items into `CHECKLIST.md`
- add human-owned asks to `HUMAN_INBOX.md`
- use `references/inbox/` for any long-form audit notes

Bias toward creative but grounded observations. If something feels off, capture it even if you are not yet sure of the fix.
```

## Weekly Review

### Full weekly review with small cleanup allowed

```text
Do a full weekly review for `loop-kit` and use the `loop-kit-weekly-review` skill.

Before you start, scan `references/` filenames and open only the docs that are obviously relevant to current blockers, stale tasks, or architectural drift.

During the review you are allowed to do small, low-risk cleanup actions when they are under about five minutes and can be validated immediately. Examples: deleting stale checklist residue, pruning resolved inbox items, tightening a misleading note, or removing obviously disposable temp files. Do not hide risky cleanup or broad refactors inside the ritual.

Review:
- `AGENT_INBOX.md`
- `HUMAN_INBOX.md`
- `CHECKLIST.md`
- `ARCHITECTURE.md`
- relevant docs in `references/`
- local git state
- remote branches/PRs when relevant

When processing inbox items, commit to each item you start and finish its triage fully before moving on. Do not move an item out of the inbox and then put the same unresolved note back there.

Make sure human-owned setup or decisions land in `HUMAN_INBOX.md` as markdown checkboxes with a `(followup: message me "...")` note.

At the end, give me a concise review summary with what you cleaned up, what you captured, what is blocked, and what you think the next coherent slice should be.
```

### Weekly review plus repo garbage collection

```text
Run the `loop-kit` weekly review using the `loop-kit-weekly-review` skill, but put extra emphasis on garbage collection.

Specifically look for:
- stale or duplicate checklist items
- stale or resolved inbox items
- stale local branches and remote branches
- stale PRs/issues if GitHub reality is relevant
- temp files and disposable artifacts
- outdated or duplicated reference docs
- docs that no longer match the code

You may do quick, low-risk cleanup work during the review if it is obvious and immediately verifiable. Capture anything ambiguous instead of improvising.

Start with the control plane and `references/` filename scan, then work outward into git and the codebase.
```

## Inbox Processing

### Clear the agent inbox

```text
Process `AGENT_INBOX.md`.

Start by scanning `references/` filenames, then open only the obvious relevant docs. Work item by item. For each item, decide:
- toss it
- do it if it is truly tiny
- move it to `CHECKLIST.md`
- move it to `HUMAN_INBOX.md`
- fold it into `ARCHITECTURE.md` or a reference doc

When you process an item, commit to finishing that item's triage before moving on. Do not leave processed notes sitting in the inbox, and do not move an item out and then put the same unresolved item back in.

Use these questions:
- what is the next action?
- will this require more than one next action?
- is this really a checklist item, a human ask, durable reference material, or junk?

If something needs a longer writeup, create a descriptive file under `references/inbox/` and leave only a pointer in `AGENT_INBOX.md`.

At the end, tell me what was deleted, what moved to `CHECKLIST.md`, what moved to `HUMAN_INBOX.md`, and what became reference material.
```

### Clear the human inbox

```text
Process `HUMAN_INBOX.md`.

Keep only real human-owned asks, setup tasks, or decisions. Convert vague items into markdown checkboxes, add categories if helpful, and add a `(followup: message me "...")` note when it will improve the handoff.

Remove anything that no longer belongs in the human inbox by either deleting it, moving it to `CHECKLIST.md`, or folding it into a reference doc.

Also make sure any still-blocked checklist item points back to the relevant human blocker.
```

## Engage / Work Prompts

### Pick a coherent slice and work

```text
Engage with `loop-kit` and pick one coherent slice to work on.

Start with git reality, then scan `AGENT_INBOX.md`, `HUMAN_INBOX.md`, the relevant sections of `CHECKLIST.md`, and `references/` filenames. Use CKB early for non-trivial repo understanding.

Selection criteria:
- prefer high-leverage cleanup, repo hygiene, docs drift fixes, or small architectural clarifications
- pick something coherent enough to validate in one session
- if you notice a human blocker, record it in `HUMAN_INBOX.md`

Git workflow:
- if the working tree is dirty and the dirty state is coherent, preserve it safely instead of ignoring it
- if you are on local `dev` with coherent dirty work, a local preservation commit is acceptable before branching
- work from a fresh feature branch when isolation helps
- prefer PRs back into `dev` for non-trivial work
- for very small, low-risk, well-validated cleanup, direct integration into `dev` is acceptable
- if GitHub reality still conflicts with the documented `dev` flow, stop and record the blocker instead of guessing

At the end, summarize the slice you chose, what changed, how you validated it, and any follow-up captures you added.
```

### Autonomous hourly work pass

```text
Do an autonomous hourly work pass on `loop-kit`.

Open with git status, then scan inboxes, checklist sections, and `references/` filenames. Pick the best next slice based on priority, leverage, and coherence. Prefer one of:
- docs drift cleanup
- repo garbage collection
- small product or package cleanup
- task clarification
- validation or audit follow-up

Keep the slice small enough to finish well. If you discover broader problems, capture them instead of ballooning the slice.

Use GitHub MCP or CLI when remote branch/PR cleanup is part of the slice. Open PRs back into `dev` when the work is non-trivial.
```

### Autonomous cleanup pass

```text
Do a cleanup-first work pass on `loop-kit`.

Bias toward:
- removing stale temp artifacts
- tightening misleading docs
- pruning stale checklist residue
- cleaning resolved inbox items
- deleting safe stale branches
- fixing small repo hygiene issues

Start with the control plane and `references/` filename scan. Keep the work low-risk and immediately verifiable. Capture anything ambiguous into `AGENT_INBOX.md` or `HUMAN_INBOX.md` instead of improvising.
```

## Garbage Collection / Audit Prompts

### Git and GitHub garbage collection

```text
Do a branch and GitHub garbage-collection pass for `loop-kit`.

Start with local git reality, then inspect remote branches, PRs, and issues if relevant. Look for merged stale branches, dead feature branches, stale PRs, and control-plane tasks that no longer match git reality.

Safely delete only what is clearly merged or obsolete. If intent is unclear, capture the ambiguity instead of deleting anything.

Update `CHECKLIST.md`, `AGENT_INBOX.md`, and `HUMAN_INBOX.md` as needed so the markdown control plane matches reality afterward.
```

### Repo audit that writes to the inbox

```text
Audit `loop-kit` for fragile code, bad assumptions, docs drift, weak validation coverage, security/config smells, and architectural confusion.

This is primarily a capture pass.

Start with `CHECKLIST.md`, inboxes, and `references/` filenames, then inspect the relevant code. Put findings into `AGENT_INBOX.md` unless they are clearly durable checklist items or human-owned blockers. Use `references/inbox/` for long-form audit notes.

Do not fix everything you find. Prefer a clean, useful backlog of findings over a rushed implementation spree.
```

### Temp artifact sweep

```text
Do a temp-artifact sweep for `loop-kit`.

Look for disposable logs, generated scratch files, forgotten debug output, and other repo sludge. Clean up only what is obviously safe. If you find recurring artifact patterns, capture a follow-up task or automation idea in `CHECKLIST.md` or `AGENT_INBOX.md`.
```
