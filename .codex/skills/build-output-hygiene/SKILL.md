---
name: build-output-hygiene
description: Repair accidental TypeScript emit output that lands next to source files in this repository instead of staying under dist. Use when `.js`, `.d.ts`, or source maps appear beside `.ts` or `.tsx` files, when root or app tsconfig changes risk re-enabling emit, or when repo hygiene checks need to clean and verify generated artifact placement safely.
---

# Build Output Hygiene

Keep TypeScript build output out of source directories. In this repo, runtime artifacts belong under `dist`, while the root workspace config and the Next app config should stay non-emitting so an accidental plain `tsc` does not generate files across the tree.

## Workflow

1. Confirm the symptom.
Run `pnpm run verify:artifacts` to list source-adjacent generated artifacts.

2. Check the config boundary first.
Verify [tsconfig.json](c:\Users\ijhar\Desktop\isaacs-devkit\tsconfig.json) and [apps/platform/tsconfig.json](c:\Users\ijhar\Desktop\isaacs-devkit\apps\platform\tsconfig.json) keep `"noEmit": true`.
Verify package-level tsconfigs that need declarations still keep an explicit `outDir`, usually `dist`.

3. Clean only generated duplicates.
Run `pnpm run fix:source-artifacts` to delete emitted `.js`, `.d.ts`, and matching source maps only when a same-basename TypeScript source file exists in the same directory.
Do not broaden deletion to arbitrary `.js` files.
Do not touch `dist`, `.next`, `node_modules`, or other dedicated output directories unless the task explicitly requires it.

4. Re-verify.
Run `pnpm run verify:artifacts`.
For broader confidence, run targeted tests or `pnpm run verify` when the change scope warrants it.

## Guardrails

Prefer fixing the configuration path that allowed the emit before deleting artifacts.
Treat source-adjacent `.js` files without a TypeScript peer as potentially intentional.
If package build scripts change, keep their `main`, `types`, and `exports` entries aligned with `dist`.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
