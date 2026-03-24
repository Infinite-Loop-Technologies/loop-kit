# Loopx And Operator Surface

## Outcome

Define the user-facing execution surface for running registry-backed units, including the `loopx` fast path, the default CLI flow, and the relationship to the host daemon.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/host-kernel-boundaries.md](../../ref/loop-kit-fundamentals/host-kernel-boundaries.md)
- Support material: [../../ref/loop-kit-fundamentals/workspace-and-automation.md](../../ref/loop-kit-fundamentals/workspace-and-automation.md)

## Next Actions

- Define the first operator verbs for install, inspect, run, publish, and workflow execution.
- Define what `loopx` should do differently from the main CLI surface and what it should intentionally not hide.
- Define how command-capable worlds should appear in discovery, help, and execution output.
- Define how the CLI should expose local versus remote versus container-backed execution paths.

## Notes

- This is a product-surface action, not just a naming exercise.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
