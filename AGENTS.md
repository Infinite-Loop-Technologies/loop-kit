# AGENTS.md

## Purpose

`loop-kit` is the monorepo for loop-kit and Forge.

Treat it as a capability-driven platform for registry-backed software units, WIT-defined contracts, capability-granted composition, and future agentic development infrastructure.

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

1. Check local repo state first:
   - current branch
   - dirty files
   - whether dirty work appears related
   - whether `dev` exists and is usable

2. For non-trivial code work, use CKB early:
   - `getStatus()`
   - then the smallest fitting workflow

3. If work selection, planning, or handoff context is unclear, consult Tana.

4. If repo state, tool state, or task state is unclear, stop and report instead of improvising.

5. Execute the smallest coherent slice possible.

6. Validate at the smallest responsible scope first.
   - widen validation only when blast radius grows

7. Keep diffs reviewable and slice-shaped.

8. If applicable, update Tana branch/status/handoff state before ending the session.

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
5. if one slice is clearly prerequisite bootstrap/config work:
   - carve it into a clean branch from `dev`
   - validate it
   - merge it into `dev`
6. recreate or rebase later slices on top of updated `dev`
7. keep the rescue branch until all intended slices land
8. if slice classification confidence is low, stop and report the candidate groupings instead of guessing

A local preservation commit on a rescue branch is allowed because it preserves work rather than destroying it.

## Tana Control Plane

Tana is the external control plane for loop-kit planning and handoffs.

Use Tana for:

- work selection
- slices
- project status
- inbox capture
- blocked-on-human handoffs
- review prompts
- branch / PR bookkeeping

Do not recreate GTD planning structures inside the repo by default.

Prefer this Tana behavior:

- search first
- read only the selected node
- paginate children only when necessary
- capture out-of-scope follow-ups into Tana instead of repo markdown
- always use the `tana-structured-search` skill before composing non-trivial `search_nodes` queries; the structured search DSL is subtle, derived from the local Tana OpenAPI, and should be treated as a documented workflow instead of guessed from memory
- when structured search results matter, verify the target with `read_node`; observed behavior can differ from intuitive expectations even when the query shape looks valid

## Validation

Before finalizing non-trivial work:

- run the smallest relevant validation first
- then run broader validation that matches the blast radius
- stop if failures cannot be clearly attributed or localized
- do not merge to `dev` if unresolved errors, unclear dirty state, or broken required tooling were ignored

## Repo-Specific MCP Guidance

- CKB is the first stop for non-trivial repo understanding.
- Moon MCP is useful for workspace inspection and task discovery when relevant.
- Context7 is only for current external docs, not repo-local truth.
- Use `jazz-docs` for Jazz-specific API lookup.

## Branch / Tana Garbage Collection

After a slice is merged to `dev`:

- delete the merged local feature branch if safe
- delete the remote feature branch if merged and no longer needed
- mark the Tana slice as done
- clear or update branch / PR fields in Tana

Do not auto-trash Tana project or slice nodes just because work is complete.
Completed nodes are still useful history.

## Repo Skill Registry

| Skill | Scope | Trigger / Use When | Runtime | Location | Notes |
| ----- | ----- | ------------------ | ------- | -------- | ----- |
| `loop-wit-wasm-authoring` | local | Creating or updating loop-kit WIT packages, WIT interfaces/worlds, WASM Components, or wRPC boundary designs tied to the standard surface and OCI artifact model. | Markdown guidance + local tools | `.codex/skills/loop-wit-wasm-authoring` | Use when shaping WIT surfaces or component/provider boundaries. |
