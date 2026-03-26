---
name: loop-kit-control-plane
description: Use for Tana-backed planning, work selection, inbox triage, handoffs, session open/close, or any task that needs the loop-kit control-plane workflow. This skill explains the loop-kit Tana workspace, the GTD-style horizons, and the habits for capture, slice selection, and reconciliation.
---

# Loop-Kit Control Plane

Use this skill whenever repo work depends on the `loop-kit` Tana workspace.

Read [references/control-plane.md](C:\Users\ijhar\Desktop\loop-kit\.codex\skills\loop-kit-control-plane\references\control-plane.md) first.

## Workflow

1. Scope all Tana work to the `loop-kit` workspace.
2. At session start, glance `Agent Inbox`, `Human Inbox`, active `#Project`, and active `#Slice` state.
3. Choose the smallest coherent `#Slice` before coding.
4. Capture follow-ups, friction, and open questions into Tana instead of relying on memory.
5. At session end, do a mini-review and reconcile branch, PR, validation, and blocker state.

## Defaults

- Prefer obvious placement in the control-plane tree over clever linking.
- Prefer one coherent slice per active branch.
- Use `#Inbox` for captures, `#Handoff` for explicit transfers, and `#Reference` for durable support material.
- Mention in chat when you place something in the human-facing inbox or create a handoff for the user.

## Do Not

- Do not treat `#Project` and `#Slice` as the same thing.
- Do not leave workflow friction uncaptured if it should change future behavior.
- Do not hide user questions only in Tana; ask in chat too.
