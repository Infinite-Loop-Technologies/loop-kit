# WIT Authoring Guide

## Package Slicing Rules

- Start with the smallest package that can own a coherent capability vocabulary.
- Split core packages from extensions early.
- Keep shared value types in narrow data-focused interfaces or packages instead of burying them inside command worlds.
- Avoid one package that defines registry, grants, runtime, workspace, and automation together.

## World Design Checklist

- Who implements this world: component, host provider, adapter, or multiple forms?
- Who imports it and under what authority?
- Is this world command-like, provider-like, or data-only?
- Does the world mix unrelated concerns that should become separate interfaces or packages?
- Does the world need an explicit grant or capability declaration nearby in planning docs?

## Component Planning Checklist

- Name the expected source language and build path.
- State whether the artifact is a WASM Component, executable, library, or container-backed adapter.
- State what imports the unit requires from the standard surface.
- State what exports it provides and to whom.
- State whether the unit is intended for local host, browser host, remote host, or multiple environments.

## Binding And Codegen Guidance

- Keep generated bindings out of handwritten source areas when possible.
- Treat binding generation as a build or validation step, not as invisible editor magic.
- Prefer one documented path for TypeScript bindings and one for Rust bindings before introducing more variants.

## Validation Commands

Use whichever of these exist in the repo or developer environment:

```powershell
wasm-tools component wit <path>
wasm-tools validate <path-to-component>
cargo component build
cargo check
```

If those commands are unavailable, leave behind the expected commands and the missing prerequisite rather than silently skipping validation.

## Rewrite Alignment

Before finalizing WIT or WASM planning work, re-check:

- `docs/project-plans/active/003-loop-refactor.md`
- `docs/ref/loop-kit-fundamentals/standard-surface-and-wit.md`
- `docs/ref/loop-kit-fundamentals/host-kernel-boundaries.md`
- `docs/ref/loop-kit-fundamentals/grants-and-composition.md`

The goal is to keep contracts, providers, and host boundaries converging toward the same platform model.

## Backlinks

<!-- markdown-backlinks:start -->
- [.codex/skills/loop-wit-wasm-authoring/skill.md](../skill.md)
<!-- markdown-backlinks:end -->
