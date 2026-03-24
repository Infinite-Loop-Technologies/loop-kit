# Artifact Builders And Toolchains

## Outcome

Define how the platform builds and packages WASM Components, executables, containers, bindings, and supporting toolchains so the registry can host useful real-world units instead of only idealized examples.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/workspace-and-automation.md](../../ref/loop-kit-fundamentals/workspace-and-automation.md)
- Support material: [../../ref/loop-kit-fundamentals/standard-surface-and-wit.md](../../ref/loop-kit-fundamentals/standard-surface-and-wit.md)

## Next Actions

- Define the preferred build path for WASM Components in Rust and any acceptable alternative paths for TypeScript-authored units.
- Define how executables and containers fit into the same publish/install metadata model.
- Define how toolchain providers, Proto-managed binaries, and containerized compilers are exposed to workflows.
- Identify the first language and toolchain units worth shipping through the registry.

## Notes

- Containers are a portability tool here, not a retreat from the standard-surface model.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
