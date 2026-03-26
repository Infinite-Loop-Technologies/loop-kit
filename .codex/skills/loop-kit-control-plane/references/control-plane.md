# Loop-Kit Control Plane

The canonical Tana workspace is `loop-kit`.

Use Tana as the external control plane for:

- capture
- work selection
- active slice context
- project status
- human and agent handoffs
- branch and PR bookkeeping
- review prompts
- cleanup and reconciliation

## GTD Horizons

- `#Vision`: higher-level strategic direction
- `#Project`: medium-horizon desired outcome
- `#Slice`: current execution unit
- `#Inbox`: raw captured item, issue, idea, or follow-up
- `#Handoff`: explicit transfer between human and agent or across sessions
- `#Reference`: support material

## Slice Semantics

A `#Slice` is the smallest bounded unit of repo work worth tracking across:

- Git branches
- validation
- blockers
- handoffs
- review

A slice is usually one branch-sized implementation unit, but very small coherent work may happen directly on `dev`.

## Preferred Layout

- `Visions`
- `Projects`
- `Active Slices`
- `Agent Inbox`
- `Human Inbox`
- `References`
- `Prompts`
- `Rituals`

## Session Open

At session start:

1. glance `Agent Inbox`
2. glance `Human Inbox`
3. glance active `#Project` state
4. glance active `#Slice` state
5. identify the next coherent slice before coding

## Capture Habit

Capture aggressively when something should not be lost:

- workflow friction
- follow-up ideas
- blocked items
- questions for the user
- cleanup candidates
- future-agent reminders

## Session Close

At session end:

1. update slice branch, PR, validation, and blocker state
2. create a `#Handoff` when the user or a future agent needs something explicit
3. mention in chat what was placed into Tana
4. ask the user directly in chat for unanswered unblockers
