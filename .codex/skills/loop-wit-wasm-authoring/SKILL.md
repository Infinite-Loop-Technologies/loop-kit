---
name: loop-wit-wasm-authoring
description: Author and update loop-kit WIT packages, WIT interfaces/worlds, WASM Component plans, and wRPC-oriented capability boundaries. Use when Codex needs to define or refine the loop-kit standard surface, create new WIT package slices, plan component/provider seams, or scaffold repo work around Rust- or TypeScript-authored WASM Components in this repository.
---

# Loop WIT/WASM Authoring

## Overview

Use this skill when work touches the new loop-kit standard surface or the units that implement it. Keep the output aligned with the active rewrite plan and the fundamentals references instead of inventing ad hoc contract shapes.

Read [references/wit-authoring-guide.md](./references/wit-authoring-guide.md) before drafting new WIT or component structure. It contains the package-splitting rules, world-design checklist, component checklist, and validation guidance for this repo.

## Workflow

1. Open the current planning context first:
   - `docs/project-plans/active/003-loop-refactor.md`
   - `docs/ref/loop-kit-fundamentals/standard-surface-and-wit.md`
   - `docs/ref/loop-kit-fundamentals/host-kernel-boundaries.md`
   - `docs/ref/loop-kit-fundamentals/grants-and-composition.md`
2. Decide what kind of artifact is being designed:
   - WIT package or interface update
   - WIT world for command, provider, or automation execution
   - WASM Component implementation scaffold
   - adapter or host-provider boundary plan
3. Keep the slice small:
   - prefer adding or refining one coherent capability package
   - avoid omnibus worlds that mix registry, workspace, grants, and runtime concerns
   - move optional or product-specific concerns into extension packages
4. Record the runtime form explicitly:
   - component-native
   - host-provided provider
   - adapter to executable, library, or container
5. When code is added, pair the contract with the expected validation path and generated artifacts instead of leaving the build or codegen story implicit.

## Output Rules

- Prefer WIT packages that reflect durable capability seams, not temporary SDK ergonomics.
- Keep imports, exports, and authority boundaries explicit.
- Name the intended implementing side for each world or interface when it is not obvious.
- When a capability needs high privilege, call out the expected grant boundary in the doc or code comments near the contract.
- If a proposal changes the shape of the standard surface, update the linked planning docs or next actions in the same turn when practical.

## Validation

- Run the smallest local validation that proves the WIT or component shape is internally coherent.
- Prefer `wasm-tools`, `cargo component`, `cargo check`, or equivalent repo-local tooling when available.
- If the required toolchain is not installed yet, document the missing validation plainly and leave a concrete follow-up.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
