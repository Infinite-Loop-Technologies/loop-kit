# Wasm Package Client And WIT Track

## Outcome

Decide how the generic OCI lab should intersect with Bytecode Alliance tooling so WIT packages and component-native flows land without creating another bloated package stack.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/standard-surface-and-wit.md](../../ref/loop-kit-fundamentals/standard-surface-and-wit.md)
- Support material: [../../ref/loop-kit-fundamentals/oci-registry-and-client.md](../../ref/loop-kit-fundamentals/oci-registry-and-client.md)
- Support material: [https://github.com/bytecodealliance/wasm-pkg-tools/tree/main/crates/wasm-pkg-client](https://github.com/bytecodealliance/wasm-pkg-tools/tree/main/crates/wasm-pkg-client)

## Next Actions

- Compare the current `oci-client`-based lab path with `wasm-pkg-client` for WIT packages and components.
- Decide which parts stay generic OCI client code and which parts should move to a WASM-specific package flow.
- Seed the first minimal WIT/component milestone only after the runtime experiment path is stable.

## Notes

- The goal is to avoid duplicating what the ecosystem already provides while still keeping the broader multi-artifact host direction.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
