# WIT Tooling And Linting

## Outcome

Define the authoring, validation, compatibility, and codegen workflow for WIT so the standard surface can evolve without becoming inconsistent or manually fragile.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/standard-surface-and-wit.md](../../ref/loop-kit-fundamentals/standard-surface-and-wit.md)
- Support material: [../../../.codex/skills/loop-wit-wasm-authoring/SKILL.md](../../../.codex/skills/loop-wit-wasm-authoring/SKILL.md)

## Next Actions

- Choose the first formatter, validator, and compatibility-checking toolchain for WIT packages.
- Define repo conventions for package naming, folder layout, generated outputs, and ownership.
- Define how TypeScript and Rust binding generation should be invoked and where generated code should live.
- Decide whether the repo needs a custom WIT linter and, if so, what rules should exist before implementation starts.

## Notes

- This action should make WIT authoring boring and reviewable.
- Prefer explicit checks in automation over tribal knowledge.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
