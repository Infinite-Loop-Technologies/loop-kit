# Host Kernel Boundary Discipline

## Outcome

Define the boundary rules between CLI, host daemon, kernel, providers, adapters, and runtime units so the rewrite does not reproduce the current monolithic core under new names.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/host-kernel-boundaries.md](../../ref/loop-kit-fundamentals/host-kernel-boundaries.md)
- Support material: [../../visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)

## Next Actions

- Define the responsibilities that belong in the CLI, the host daemon, and the kernel.
- Define where lifecycle, routing, scheduling, and policy hooks should live.
- Define the boundary rules for provider registration and adapter usage.
- Record the failure modes that indicate the rewrite is drifting back toward a giant kernel package.

## Notes

- The best outcome is a boundary model sharp enough that package split decisions become obvious instead of emotional.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
