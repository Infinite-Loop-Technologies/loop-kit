# AGENTS.md

## Purpose

`loop-kit` is the monorepo for loop-kit and Forge.

Treat it as a capability-driven platform for registry-backed software units, WIT-defined contracts, capability-granted composition, and future agentic development infrastructure.

## Required Control Plane

For work in this repo, Tana is the external control plane and CKB is the primary repo-understanding layer.

- If Tana MCP is unavailable, stop and report unless the user explicitly says to proceed without Tana.
- If CKB is unavailable for non-trivial repo work, stop and report.
- If GitHub MCP is unavailable, stop only for remote GitHub work that depends on it.

## Current Repo Mode

Prototype mode is enabled.

- `dev` is the working integration branch.
- `main` is for deliberate promotion, not routine agent integration.
- Small coherent prototype work may be committed directly on `dev`.
- Use a short-lived feature branch from `dev` when isolation helps.
- Merge validated feature work back into `dev`.
- Do not push to or merge to `main` unless explicitly told to.
- Do not rewrite shared remote history without explicit instruction.
- Do not use worktrees unless there is truly parallel active work.

## Minimal Operating Loop

1. Open with Git reality, not assumptions.
   - run `git status --short --branch`
   - identify the current branch
   - identify whether the tree is dirty
   - identify whether the current branch is ahead or behind its upstream
   - identify whether the current branch is ahead or behind `dev`
   - if the tree is clean and the current branch is unrelated, switch to `dev`
   - if switching branches on a clean tree, fetch first and inspect whether the target branch needs a fast-forward update before working

2. Open with Tana reality before choosing work.
   - use the `loop-kit-control-plane` skill
   - always scope Tana search to the `loop-kit` workspace
   - glance the `Agent Inbox` for urgent captures
   - glance the `Human Inbox` for blockers, answers, or handoffs from the user
   - glance active `#Project` and `#Slice` context before deciding the next action

3. For non-trivial code work, use CKB early.
   - call `getStatus()`
   - then use the smallest fitting CKB workflow

4. Choose the smallest coherent slice.
   - a `#Slice` is the smallest bounded unit of repo work worth tracking across Git, validation, and Tana
   - a slice is usually one branch-sized implementation unit, but it can also be direct work on `dev` when the change is very small and coherent
   - a slice is not the same thing as a GTD project

5. Execute, validate, and capture follow-ups as you go.
   - validate at the smallest responsible scope first
   - widen validation only when blast radius grows
   - capture friction, surprises, follow-ups, and workflow improvements into Tana instead of relying on memory

6. Close with a mini-review.
   - update branch, PR, status, validation, and blocker state in Tana
   - add a `#Handoff` when the user or a future agent needs something explicit
   - mention in chat when you put something in the user-facing inbox or handoff area
   - ask the user directly in chat for clarifications or unblockers when needed instead of hiding everything in Tana

## Git Branch Selection And Salvage

The agent must be comfortable repairing Git state, but not by improvising.

### Start-of-session checks

- always inspect the current branch first
- always inspect whether the tree is dirty
- always inspect ahead/behind relative to the branch upstream when one exists
- always inspect whether the branch is meaningfully behind `dev`
- when remote inspection matters and the tree is clean, prefer `git fetch --all --prune` before deciding

### Default branch choice

- if the current branch is clean and unrelated to the task, switch to `dev`
- if the current branch is already the coherent branch for the task, stay there
- if there is another existing coherent branch for the task, prefer resuming it over creating a duplicate branch

### Wrong-branch recovery

- if related work exists on the wrong branch, preserve it and move it to the right branch instead of ignoring it
- if the tree is dirty but the work is coherent, create or switch to the correct branch and carry the work there safely
- if the tree is dirty and the work slices cannot be classified confidently, stop and report instead of guessing

### Branch maintenance

- delete old local branches after they are merged and clearly no longer needed
- delete old remote branches only when merged and safe
- do not perform destructive cleanup automatically when intent is unclear

## Dirty Main / Mixed Dirty State Salvage

If `main` contains dirty work:

- do not continue normal development on `main`
- do not discard the work
- do not stash by reflex

Use this salvage protocol:

1. classify the dirty state
2. create a local rescue branch from the current state:
   - `rescue/dirty-main-<timestamp>`
3. if needed, create one local preservation commit on the rescue branch
4. use Git + CKB to group the diff into candidate slices
5. if one slice is clearly prerequisite bootstrap or config work:
   - carve it into a clean branch from `dev`
   - validate it
   - merge it into `dev`
6. recreate or rebase later slices on top of updated `dev`
7. keep the rescue branch until all intended slices land
8. if slice classification confidence is low, stop and report the candidate groupings instead of guessing

A local preservation commit on a rescue branch is allowed because it preserves work rather than destroying it.

## Tana Workflow

Use the `loop-kit-control-plane` skill whenever repo work depends on Tana state.

Tana is the external control plane for:

- capture
- work selection
- active slice context
- project status
- blocked-on-human handoffs
- blocked-on-agent handoffs
- review prompts
- branch and PR bookkeeping
- cleanup and reconciliation

Do not recreate GTD planning structures inside this repo by default.

### Workspace Rules

- the canonical workspace is named `loop-kit`
- always scope Tana search to the `loop-kit` workspace
- prefer exact node IDs and field IDs over names when available
- search first, then read only the selected node, then paginate children only when necessary
- use the `tana-structured-search` skill before composing non-trivial `search_nodes` queries
- validate structured searches with `read_node` or `get_children` when the result matters
- assume `search_nodes` excludes trash unless future testing proves otherwise

### GTD Horizons In Tana

Use these horizons and keep them reconciled:

- `#Vision`: higher-level strategic direction
- `#Project`: medium-horizon desired outcome
- `#Slice`: current execution unit
- `#Inbox`: raw captured item, idea, issue, or follow-up
- `#Handoff`: explicit transfer between human and agent or between sessions
- `#Reference`: supporting material

### Required Semantics

- every active `#Slice` should belong to a `#Project`
- every active branch should map to at most one active `#Slice`
- multiple active `#Project` nodes are allowed, but each active project must have an obvious next slice or be moved to an on-hold style status instead of pretending it is active
- multiple active `#Slice` nodes are allowed only when they map cleanly to distinct branches, owners, or blocked states; prefer one primary current slice for the current session
- a `#Project` is a desired outcome, not a branch
- a `#Slice` is an execution unit, not a whole product goal
- inbox items are captures, not long-term plans
- handoffs are explicit and searchable
- completed work is preserved as history, not trashed by default

### Control-Plane Layout

The control-plane root should make navigation obvious instead of relying on clever searches.

Preferred top-level sections:

- `Visions`
- `Projects`
- `Active Slices`
- `Agent Inbox`
- `Human Inbox`
- `References`
- `Prompts`
- `Rituals`

The agent should prefer obvious placement over excessive linking and maintenance.

### Capture Habit

Capture into Tana aggressively when something should not be lost.

Good capture targets:

- workflow friction
- follow-up ideas
- risky cleanup candidates
- unclear branch situations that need human direction
- questions for the user
- future-agent handoffs

When possible, tag captures cleanly with the existing schema instead of writing loose notes.

### Session Open And Close

At session start:

- glance `Agent Inbox`
- glance `Human Inbox`
- glance active `#Project` and `#Slice` state
- identify the next coherent slice before coding

At session end:

- do a quick mini-review
- update slice status, branch, validation, and blockers
- move or clear resolved handoffs where appropriate
- tell the user in chat what was updated in Tana

## Weekly Review

If the user says `do a weekly review`, use the `loop-kit-weekly-review` skill.

The weekly review should reconcile:

- inboxes
- handoffs
- active projects
- active slices
- branch and PR state
- stale or missing mappings between Git and Tana
- blocked items
- horizon alignment between `#Vision`, `#Project`, and `#Slice`
- `Last Reviewed On` on the reviewed projects and slices

The agent may recommend a weekly review when the inboxes, handoffs, or branch state look neglected.

## Validation

Before finalizing non-trivial work:

- run the smallest relevant validation first
- then run broader validation that matches the blast radius
- stop if failures cannot be clearly attributed or localized
- do not merge to `dev` if unresolved errors, unclear dirty state, or broken required tooling were ignored

## Repo-Specific Tooling

### Proto

Moon is gone. Proto stays.

- Respect `.prototools` when present.
- Prefer Proto-managed binaries over ad hoc global installs when testing repo CLIs or toolchains.
- For example, sandbox, or testbed directories, prefer `proto activate` when the goal is to exercise the local toolchain in the directory’s intended environment.

### MCP usage in this repo

- CKB is the first stop for non-trivial repo understanding.
- Tana is the first stop for planning, handoffs, and review state.
- Context7 is only for current external docs, not repo-local truth.
- Use `jazz-docs` for Jazz-specific API lookup.

## Branch / Tana Garbage Collection

After a slice is merged to `dev`:

- delete the merged local feature branch if safe
- delete the remote feature branch if merged and no longer needed
- mark the Tana slice as done
- clear or update branch and PR fields in Tana

Do not auto-trash Tana project or slice nodes just because work is complete.
Completed nodes are useful history.
