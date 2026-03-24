# Loop Rewrite Inventory And Cut Line

## Outcome

The cut line is now explicit and executed in the repo.

Retired on the current branch:

- `packages/loop-ai`
- `packages/loop-cli`
- `packages/loop-contracts`
- `packages/loop-kernel`
- `packages/loop-mcp`
- `packages/loopd`
- `packages/contracts`
- `packages/forge-app`
- `packages/forge-api`
- `apps/forge-web`
- `apps/forge-desktop`
- the old `loop.json` workspace model

Preserved:

- `packages/graphite`
- `packages/graphite-core`
- `packages/graphite-react`
- `packages/graphite-systems`
- `packages/dock`
- `packages/ui`
- `apps/ui-demo`

Replacement target:

- `experiments/oci-lab` becomes the first real replacement surface for OCI registry, WASM runtime, executable dispatch, and container dispatch experiments.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Vision: [../../visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
- Support material: [../../agent-inbox/loop-audit-report.md](../../agent-inbox/loop-audit-report.md)
- Support material: [../../ref/loop-kit-fundamentals/index.md](../../ref/loop-kit-fundamentals/index.md)
- Replacement code: [../../../experiments/oci-lab/README.md](../../../experiments/oci-lab/README.md)

## Notes

- The audit still matters as migration context, but it no longer justifies preserving the old package split.
- The new path favors runtime proof over more fine-grained decomposition docs.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
