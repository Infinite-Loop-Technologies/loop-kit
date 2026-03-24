# Automation Workflows And Surface Providers

## Outcome

Define how automation workflows, task units, and host-provided capabilities fit into the same standard surface so development and deployment automation can be shipped through Loop instead of living in a disconnected sidecar universe.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/workspace-and-automation.md](../../ref/loop-kit-fundamentals/workspace-and-automation.md)
- Support material: [../../project-plans/active/004-agentic-dev-workflow.md](../../project-plans/active/004-agentic-dev-workflow.md)

## Next Actions

- Define the workflow unit shape for command-like and pipeline-like automation.
- Define which host-provided capabilities automation units can assume from the standard surface.
- Define how this model relates to Dagger, Moon, and other operator tooling already being introduced in the repo.
- Identify the first automation units that would prove the platform direction quickly.

## Notes

- The point is not to clone Dagger mechanically. The point is to make Loop-native workflow units powerful enough that real automation belongs on the platform.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
