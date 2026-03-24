# OCI Lab WASM Fetch Push And Run

## Outcome

Make the Rust lab prove the minimum WASM path end to end: generate a demo module, push it to a registry, pull it back, and execute it locally.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/oci-registry-and-client.md](../../ref/loop-kit-fundamentals/oci-registry-and-client.md)
- Support material: [../../ref/loop-kit-fundamentals/standard-surface-and-wit.md](../../ref/loop-kit-fundamentals/standard-surface-and-wit.md)
- Experiment code: [../../../experiments/oci-lab/src/main.rs](../../../experiments/oci-lab/src/main.rs)

## Next Actions

- Keep the current `push-wasm`, `pull-wasm`, and `pull-run-wasm` flow building cleanly.
- Decide whether the next WASM milestone is a component artifact, a WIT package, or both.
- Record the artifact metadata we need before this becomes a real Loop registry client.

## Notes

- This is deliberately allowed to start with raw `.wasm` binaries before the component-native track hardens.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
