# Loop Kit UI Principles

Use this guide whenever work touches UI in this repo, including examples,
debug inspectors, demos, docs-driven screenshots, and future product surfaces.

## Architecture First

- Keep business logic out of UI components unless it is tiny and truly local to
  that component.
- Context/provider components are bridge components, not hidden application
  services. They should receive runtimes/services from composition roots and
  expose selected state/actions through hooks.
- UI components render state, call callbacks, and register interaction targets.
  Cross-service behavior belongs in services, runtimes, policies, installables,
  or bridges.
- Use Dock and Interaction as real architecture in examples. Demos should prove
  the package model instead of bypassing it with local React state.

## Styling

- Do not hardcode visual colors in components. Use semantic tokens from CSS
  variables and Tailwind theme colors such as `background`, `foreground`,
  `muted`, `secondary`, `border`, `accent`, `destructive`, and component-level
  semantic tokens.
- Avoid utility strings that duplicate large Tailwind class lists across many
  components. Prefer small composed primitives, shared helpers, or focused
  variant props when repeated structure is real.
- Keep visual hierarchy quiet and useful. Do not add badges, labels, or
  explanatory chips that state obvious implementation facts.
- Avoid layout-affecting logs, inspectors, and debug text. Long event streams
  should scroll, virtualize, truncate, or otherwise stay bounded.

## Interaction

- Drag, resize, and move interactions should feel immediate. Render live
  previews close to the pointer and commit the final state at the end.
- Prevent accidental text selection during active drags, resizes, and window
  moves while preserving ordinary text selection in editable controls.
- Prefer whole useful drag regions over decorative drag affordances. For
  example, a floating window title bar can be draggable without adding a
  redundant handle icon.
- Demos should show physical feedback where it helps comprehension: source
  placeholders, cursor-following ghosts, and drop previews that match the
  pending committed result.

## Future Design System

The repo is expected to grow a first-class design system package. Until then,
avoid one-off visual decisions that would fight semantic tokens, primitive
composition, or future component variants.
