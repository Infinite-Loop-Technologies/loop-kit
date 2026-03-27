# Experiments

`experiments/` holds standalone prototype labs for short-term loop-kit and Forge work.

Current direction:

- Bun-first TypeScript over bespoke Rust labs for fast iteration
- one experiment folder per coherent lab
- minimal scaffolding and obvious entry points
- notes in Markdown when code does not exist yet

The old `oci-lab` Rust prototype was removed on purpose. The next OCI/WASM lab should start from the lighter Bun-first shape described in [`oci/README.md`](./oci/README.md).
