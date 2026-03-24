# Loop Rewrite Inventory And Cut Line

## Outcome

Turn the broad "delete the old Loop core" direction into a concrete inventory and cut line so the repo knows exactly which legacy surfaces are being retired, what replacement workstreams cover them, and what migration notes still matter.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Vision: [../../visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
- Support material: [../../agent-inbox/loop-audit-report.md](../../agent-inbox/loop-audit-report.md)
- Support material: [../../ref/loop-kit-fundamentals/index.md](../../ref/loop-kit-fundamentals/index.md)

## Next Actions

- Inventory the current `loop-*` packages and `/loop` assets by responsibility, not just by directory name.
- Mark each surface as retire, mine-for-ideas, temporarily bridge, or explicitly preserve.
- Record the first replacement target for each retired surface so deletion is tied to a successor.
- Capture any migration constraints that must survive the rewrite, such as useful ref formats or install metadata.

## Notes

- This action should reduce deletion risk, not slow the rewrite into analysis paralysis.
- The goal is to establish a clean cut line quickly enough that new work stops accreting on the old core.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
