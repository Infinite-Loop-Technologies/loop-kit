---
status: ready
last_reviewed: 2026-05-10
blocked_by: []
---

# Design System Package Planning

## Goal

Plan the future Loop Kit design-system package so UI work can move away from
one-off component styling while preserving IRA boundaries and semantic tokens.

## Planning Mode Recommendation

Use planning mode for this prompt first. During planning mode, tell Codex:

> Read `AGENTS.md`, `HANDOFF.md`, `docs/references/ui-principles.md`,
> `examples/workbench/src/client/components`, `examples/workbench/src/client/index.css`,
> `examples/workbench/components.json`, and package/workspace config. Do not
> implement yet. Produce a concrete package plan for a future `design-system`
> package: ownership, public API shape, token strategy, component primitive
> strategy, migration slices, and what should remain app-local in workbench.

After the plan is reviewed, run a separate implementation prompt for the first
small slice.

## Context

- The user expects a future design system in this repo, likely as a package
  named `design-system`.
- `docs/references/ui-principles.md` is the current repo-level UI standard.
- Existing workbench UI uses shadcn-style primitives and Tailwind/CSS variable
  semantics, but it may still contain duplicated utility strings and app-local
  primitives that should eventually become shared.

## Required Planning Output

- Recommend package location and name, likely `packages/design-system`, unless
  repo inspection shows a better fit.
- Define what belongs in the package: semantic tokens, primitive components,
  variant helpers, layout/log/inspector primitives, and any Dock/workbench
  specific exclusions.
- Define what must not belong in the package: service/runtimes, Dock policy,
  workbench-specific demo behavior, or business logic.
- Propose a migration sequence that starts with low-risk primitives already used
  by the workbench, such as bounded logs, buttons, cards, tabs, inspectors, and
  layout shells.
- Call out how to avoid hardcoded colors and duplicated Tailwind strings.
- Identify validation commands and browser checks for the first implementation
  slice.

## Constraints

- Do not create the package during planning mode.
- Keep UI primitives dumb. They can handle presentation variants and tiny local
  interaction state, but not app/domain behavior.
- Design-system APIs should compose with future design-system work instead of
  freezing the current workbench styling as permanent.
- Prefer small package boundaries and migration slices over a broad rewrite.

## Validation

- Planning output should be specific enough that a later Codex session can
  implement the first package slice without rediscovering the whole workbench.
- Any implementation prompt derived from this plan should include typecheck,
  build, and browser verification for affected UI.
