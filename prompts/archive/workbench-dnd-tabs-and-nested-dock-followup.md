---
status: unready
last_reviewed: 2026-05-12
blocked_by: []
---

# Workbench DnD Tabs and Nested Dock Followup

Implemented on 2026-05-12. Keep this prompt archived unless new DnD or nested
Dock followup work is identified and the brief is refreshed.

## Goal

Use Dock to make the workbench demos easier to explore, expand the DnD Lab with
real preview ghosts, and prove nested Dock surfaces work across multiple levels.

## Context

- Run this after `prompts/dock-drag-drop-correctness-followup.md` or after the
  same bugs are demonstrably fixed.
- Start with `AGENTS.md`, `HANDOFF.md`,
  `docs/references/architecture/dock-and-interaction.md`,
  `docs/references/ui-principles.md`, `.codex/skills/dock-integration/SKILL.md`,
  `.codex/skills/interaction-runtime/SKILL.md`, `packages/dock/src`,
  `packages/dock-react/src`, and `examples/workbench`.
- The workbench should demonstrate Dock as ordinary product infrastructure, not
  only as a Dock-specific lab.

## Required Work

- Expand the DnD Lab into multiple demos viewable through Dock tabs. By default
  the demos should be in a simple tab stack, non-closeable, but users should be
  able to split them side by side when they want.
- Add at least these DnD demo variants:
  - physical-feeling reorder with a source placeholder, cursor-following ghost,
    animated movement, and visible drop preview;
  - guide-line reorder where the pending insertion point is shown as a line;
  - a distinct additional behavior useful for future comparison, such as
    constrained drop zones, grouped lists, or nested drop targets.
- Add DnD preview ghosts. While dragging, leave a replacement/placeholder where
  the original item came from, render the dragged item near the cursor, and show
  where it would drop.
- Add a small Dock preset API for common demo use cases, such as simple
  non-closeable tab stacks. Put it where ownership fits best after inspection:
  `examples/workbench` if it is demo-only, or `packages/dock`/`packages/dock-react`
  if it is genuinely reusable package API.
- Prove Dock-within-Dock works, including at least two nested levels. Add tests
  or a deterministic workbench demo that catches id collisions, focus leakage,
  target ancestry mistakes, and drag/drop ambiguity between nested runtimes.
- Add reset controls to other workbench screens where they are useful, following
  the DnD Lab reset pattern. Reset should restore runtime/service state through
  the appropriate environment boundary, not by reloading the page.

## Constraints

- Preserve IRA layering. Demo tabs and nested docks should be built from Dock
  service/runtime environments and React bridges, not local component-only Dock
  state.
- Keep DnD lab app behavior out of `@loop-kit/interaction` core. Generic
  interaction improvements may go there only when they are truly domain-neutral.
- Avoid hardcoded visual colors and duplicated large Tailwind strings. Use the
  UI principles guide.
- Do not let nested Dock demos become brittle screenshot-only proof. They should
  exercise real runtime/service behavior.

## Validation

- `bun --filter @loop-kit/interaction test:unit`
- `bun --filter @loop-kit/dock test:unit`
- `bun --filter @loop-kit/example-workbench typecheck`
- `bun --filter @loop-kit/example-workbench build`
- Browser-check `https://workbench.localhost`: DnD demos are Dock tabs by
  default, demos can be split side by side, preview ghosts/placeholders/drop
  previews render correctly, reset controls restore each screen, and nested Dock
  interactions target the intended Dock instance.
