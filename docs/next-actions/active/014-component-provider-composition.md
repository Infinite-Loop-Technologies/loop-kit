# Component Provider Composition

## Outcome

Define how components, providers, adapters, and alternative runtime forms compose inside the host so the platform stays modular even when some capabilities require native or container-backed implementations.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/grants-and-composition.md](../../ref/loop-kit-fundamentals/grants-and-composition.md)
- Support material: [../../ref/loop-kit-fundamentals/standard-surface-and-wit.md](../../ref/loop-kit-fundamentals/standard-surface-and-wit.md)

## Next Actions

- Define how providers advertise the worlds or interfaces they satisfy.
- Define how the host chooses between component-native composition, adapter-mediated composition, and external process or container boundaries.
- Define the metadata needed to describe platform constraints, transport constraints, and operational prerequisites.
- Define where composition decisions are static, cached, or resolved dynamically at run time.

## Notes

- The composer should make heterogeneity manageable, not invisible.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
