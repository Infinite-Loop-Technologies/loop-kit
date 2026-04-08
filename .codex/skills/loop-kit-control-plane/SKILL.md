---
name: loop-kit-control-plane
description: Use for markdown-backed planning, work selection, inbox triage, handoffs, and session open/close in loop-kit. This skill explains the lightweight repo-local control plane built from CHECKLIST.md, inbox files, ARCHITECTURE.md, and references/.
---

# Loop-Kit Control Plane

Use this skill whenever repo work depends on the `loop-kit` markdown control plane.

Read [references/control-plane.md](C:\Users\ijhar\Desktop\loop-kit\.codex\skills\loop-kit-control-plane\references\control-plane.md) first.

## Workflow

1. At session start, glance `AGENT_INBOX.md`, `HUMAN_INBOX.md`, and the relevant sections of `CHECKLIST.md`.
2. If the work is architectural, cross-package, or concept-heavy, read `ARCHITECTURE.md`.
3. If an obvious relevant file exists in `references/`, read that too.
4. Process relevant inbox items before coding.
5. Choose the smallest coherent slice before coding.
6. Capture follow-ups, friction, and open questions into the markdown control plane instead of relying on memory.
7. At session end, do a mini-review and reconcile checklist state, blockers, validation notes, and human handoffs.

## Defaults

- Prefer obvious filenames over links, indexes, or folder taxonomies.
- Prefer one coherent slice per active branch.
- Use `AGENT_INBOX.md` for temporary captures, `HUMAN_INBOX.md` for explicit asks to the user, and `references/` only for durable support material.
- Mention in chat when you place something in the human-facing inbox.

## Do Not

- Do not turn `AGENT_INBOX.md` into a second checklist.
- Do not put the same processed note back into `AGENT_INBOX.md`.
- Do not create reference files for trivial or short-lived thoughts.
- Do not hide user questions only in markdown; ask in chat too.
