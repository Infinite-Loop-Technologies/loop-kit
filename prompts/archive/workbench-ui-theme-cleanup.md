---
status: unready
last_reviewed: 2026-05-06
blocked_by: []
---

# Workbench UI Theme Cleanup

Archived after implementation on 2026-05-06.

## Goal

Fix the visual system in `examples/workbench` so the demo uses shadcn semantic
tokens consistently and remains legible in dark mode by default. Remove
palette-specific hardcoded Tailwind and CSS colors from the workbench UI and route
surface, text, border, focus, state, and accent styling through semantic tokens.

## Context

- Start with `HANDOFF.md`, `AGENTS.md`, `examples/workbench/src/client/index.css`,
  and all files under `examples/workbench/src/client`.
- The app is intended to use shadcn-style CSS variables and semantic utilities
  such as `bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`,
  `bg-muted`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`,
  `bg-secondary`, `text-secondary-foreground`, `bg-accent`,
  `text-accent-foreground`, `border-border`, `ring-ring`, and `bg-input`.
- Dark theme should be the default, following the shadcn Vite dark-mode model:
  a `.dark` class is normally applied by a provider, but for this example either
  `:root` must default to dark tokens or the app must install a provider with
  `defaultTheme="dark"`.
- Current scan findings show hardcoded or palette-specific colors across:
  - `components/ui/badge.tsx`, `button.tsx`, `card.tsx`, `separator.tsx`
  - `components/workbench/AppShell.tsx`, `ChecklistItem.tsx`,
    `InspectorRow.tsx`, `LogTimeline.tsx`
  - `labs/DockLab.tsx`, `dockPanels.tsx`, `DragDropLab.tsx`,
    `FloatingWindowsLab.tsx`, `InteractionLabs.tsx`, `OverviewLab.tsx`
  - `index.css`, where token definitions are acceptable but custom component
    rules must not hardcode raw colors.

## Constraints

- Keep this as an example/workbench UI cleanup. Do not change package behavior
  in `packages/dock`, `packages/dock-react`, or `packages/interaction`.
- Do not replace semantic shadcn tokens with neutral/cyan/emerald/amber/etc.
  utility classes in app components.
- Avoid raw CSS color values outside shadcn token definitions in `index.css`.
  Token values such as `--background: oklch(...)` are allowed; component rules
  should use semantic variables or `@apply` semantic utilities.
- Keep dark mode default and make any light mode opt-in.
- Preserve the current labs and behavior; this is a visual/theme cleanup, not a
  feature refactor.

## Next Work

- Audit `examples/workbench` for palette-specific classes and raw color CSS.
  Use a repo search similar to:
  `rg -n "(bg|text|border|ring|outline|shadow|from|to|via)-(neutral|slate|zinc|stone|gray|cyan|emerald|amber|red|blue|purple|white|black)|#[0-9a-fA-F]{3,8}|rgba?\\(|linear-gradient|color:\\s|background(?:-color)?:\\s|border-color:\\s|box-shadow:\\s" examples/workbench`.
- Update local UI primitives first so components inherit semantic behavior:
  buttons, badges, cards, separators, inspector rows, timelines, checklist
  items, shell navigation, modal frames, drop indicators, sortable items, code
  samples, and floating window sketches.
- Review `index.css` for shadcn compatibility:
  - keep Tailwind imports, shadcn import, and explicit `@source` directives;
  - keep semantic `@theme inline` mappings;
  - keep dark-default tokens or add a shadcn-compatible theme provider;
  - remove any component-level raw colors or palette-specific fallback CSS.
- Introduce semantic workbench helper classes only when they reduce repetition.
  They should be named by role, not color, and implemented with semantic tokens.
- Browser-check every lab after the cleanup, especially modal/backdrop states,
  dock drop/resize previews, dnd-kit drag state, keyboard focus, signal target,
  floating windows, and overview cards.

## Validation

- `bun --filter @loop-kit/example-workbench typecheck`
- `bun --filter @loop-kit/example-workbench build`
- `bunx biome check examples/workbench/src/client`
- Run the hardcoded-color audit command and confirm remaining hits are limited
  to allowed shadcn token definitions in `index.css` or clearly documented
  non-color false positives.
- Browser-check `https://workbench.localhost` with Playwright:
  - default `color-scheme` is dark;
  - body, shell, cards, panels, muted surfaces, buttons, badges, inputs, modal,
    backdrop, dropzones, and active navigation all compute from semantic tokens;
  - text remains readable on every visible surface;
  - modal open/close still works and no duplicate modal content appears.
