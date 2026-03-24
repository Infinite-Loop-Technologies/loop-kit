# OCI Lab Container And Executable Dispatch

## Outcome

Prove that the new host posture can dispatch more than WASM by handling executable and container artifacts through the same experiment harness.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Vision: [../../visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
- Experiment code: [../../../experiments/oci-lab/src/main.rs](../../../experiments/oci-lab/src/main.rs)

## Next Actions

- Keep generic blob push/pull in the lab so executable artifacts have a real registry path.
- Define the first artifact-type metadata that distinguishes executable, container, and WASM dispatch.
- Decide when container execution should stay delegated to Docker and when a fuller host path is worth building.

## Notes

- The point here is not elegance. It is proving the multi-artifact runtime direction quickly.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
