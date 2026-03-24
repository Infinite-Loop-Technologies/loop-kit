---
name: exec-plan-manager
description: Create, update, move, or execute execution plans under docs/exec-plans while preserving sortable names, blockers, and links.
---

# Exec Plan Manager

Use this when the user talks about plans directly.

## Workflow

1. Start with:
   - `docs/exec-plans/index.md`
   - `docs/design-docs/index.ts`
2. Decide the correct state:
   - `active/` when work is ready now
   - `wip/` when the work is still being shaped or researched
   - `experiments/` for speculative labs, weird probes, or intentionally disposable validation work
   - `on-hold/` when a blocker exists
   - `completed/` when the plan has been executed and verified
3. Keep one plan per markdown file with a sortable unique name such as `001-short-name.md`.
4. Preserve or add these sections:
   - Goal
   - Scope
   - Constraints
   - Dependencies
   - Blockers
   - Exit Criteria
   - Verification
   - Links
   - Backlinks
5. When asked to execute a plan, do the work and then move the plan only after verification is real.

## Guardrails

- Do not bury blockers in prose; keep them explicit in `## Blockers`.
- Prefer moving a file between state folders over replacing it with a fresh document.
- Use frontmatter metadata for review cadence and status whenever possible.
- Link plans back to `AGENTS.md`, `ARCHITECTURE.md`, `AUDIT.md`, and the most relevant design docs.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
