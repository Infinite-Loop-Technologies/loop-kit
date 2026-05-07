---
status: ready
last_reviewed: 2026-05-07
blocked_by: []
---

# Dock and Interaction Knowledge Base Hardening

## Goal

Make the repo's Dock and Interaction architecture understandable and durable by
maintaining a focused reference doc plus prompts that match the current package
capabilities.

## Context

- Start with `AGENTS.md`, `HANDOFF.md`,
  `docs/references/architecture/dock-and-interaction.md`,
  `docs/references/architecture`, `.codex/skills`, `prompts`,
  `packages/dock`, `packages/dock-react`, `packages/interaction`, and
  `examples/workbench`.
- IRA means Installed Runtime Architecture. Services own committed truth,
  runtimes own lifecycle/session state/signals/tasks, installables own policies
  and adapters, bridges expose runtime/service state to UI, and UI stays dumb.

## Required Work

- Keep `docs/references/architecture/dock-and-interaction.md` current with:
  terminology for panel, surface, group, split, layer, layout, window, modal,
  overlay; package responsibilities; service/runtime/policy flow; and current
  capabilities/gaps.
- Explain `DockService`, `DockRuntime`, `DockPolicy`,
  `composeDockPolicies`, `createDockService({ policy })`, `dock-react`, and
  `InteractionRuntime` with examples grounded in the current codebase.
- Document customization points and limits, especially policy composition,
  placement checks, renderer ownership, persistence, and panel-to-window
  conversion tradeoffs.
- Audit active prompts for overlap and stale paths. Keep the active prompt garden
  small and mark obsolete prompts `unready` or archive them.
- Keep architecture docs concrete. Prefer repo examples over generic manifesto
  language.

## Constraints

- Do not invent APIs that are not exported by the packages.
- Do not duplicate large sections of package source in docs.
- Do not hide open gaps. Call out what Dock and Interaction cannot do yet.
- Keep package-local facts near packages when they become too detailed for a
  repo-level reference.

## Validation

- Active prompts have valid frontmatter and do not overlap materially.
- Reference docs do not point at deleted paths.
- `docs/references/architecture/dock-and-interaction.md` answers how policies
  customize behavior, how `canApplyPlacement` works, and how an app should think
  about converting a tabbed panel into a floating window and back.
