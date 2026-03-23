---
name: repo-verify
description: Run the smallest defensible verification set for a change, then escalate to broader checks only when the risk justifies it.
---

# Repo Verify

Use this after code or docs changes when the correct verification scope is not obvious.

## Workflow

1. Start with the narrowest relevant checks:
   - package `typecheck`
   - package `test`
   - task-specific scripts such as `docs:links` or `plans:next`
2. Escalate to repo-level checks when the change crosses package or trust boundaries:
   - `pnpm run verify`
   - `pnpm run verify:full`
3. Report what was run and what was intentionally not run.

## Guardrails

- Do not claim coverage you did not execute.
- Prefer targeted checks first when the repo is large or the working tree is noisy.
- Use broader verification when changing CI, release automation, auth, trust, grants, registry, or adapter code.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
