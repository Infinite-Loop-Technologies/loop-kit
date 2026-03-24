# Grant Manager And Enforcement

## Outcome

Define the grant vocabulary, approval flow, and enforcement model that will govern powerful runtime capabilities such as filesystem access, network access, process spawning, and registry mutation.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/grants-and-composition.md](../../ref/loop-kit-fundamentals/grants-and-composition.md)
- Support material: [../../ref/loop-kit-fundamentals/host-kernel-boundaries.md](../../ref/loop-kit-fundamentals/host-kernel-boundaries.md)

## Next Actions

- Define the subject/resource/action/lifetime model for grants.
- Separate workspace-scoped grants from machine-scoped grants.
- Define the point in the runtime where enforcement must happen.
- Define what audit and explanation data should exist for denied and permitted calls.

## Notes

- Grant prompts may be user-facing, but grant enforcement cannot be a UI-only concern.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
