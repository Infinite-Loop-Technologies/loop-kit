---
name: audit-to-exec-plan
description: Convert audit findings into actionable execution plans under docs/exec-plans. Use when AUDIT.md or another security review has concrete findings that should become tracked work with blockers and exit criteria.
---

# Audit To Exec Plan

Move audit findings out of passive notes and into executable plan files.

## Workflow

1. Read the relevant finding in `AUDIT.md`.
2. Decide the correct state folder:
   - `active/` when work is ready now
   - `wip/` when the finding needs design or scope shaping before execution
   - `on-hold/` when blocked
   - `completed/` only when the remediation is already done and needs archival
3. Create or update one plan file per finding using a sortable unique name.
4. Preserve the audit context:
   - severity
   - affected surface
   - blocker or dependency
   - exit criteria
   - verification
5. Link the plan back to `AUDIT.md`, `ARCHITECTURE.md`, and any design docs.

## Suggested Plan Shape

- Goal
- Scope
- Constraints
- Dependencies
- Blockers
- Exit Criteria
- Verification
- Links
- Backlinks

## Guardrails

- Do not leave high-severity findings only in `AUDIT.md`.
- Split unrelated findings into separate plans instead of making one giant remediation file.
- Keep plan language implementation-oriented, not audit-narrative-heavy.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
