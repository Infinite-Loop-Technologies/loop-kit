# OCI Lab

This Rust lab is the first concrete replacement path for the deleted Loop core.

It focuses on three practical questions:

1. How do we run a local OCI registry for both repeatable development and disposable tests?
2. How do we push and pull WASM artifacts without reviving the old `loop-*` package shape?
3. How do we dispatch different artifact classes from the same host-facing entrypoint?

## Registry Modes

- Persistent local dev:

  ```powershell
  cargo run --manifest-path experiments/oci-lab/Cargo.toml -- registry up
  ```

- Ephemeral test registry:

  ```powershell
  cargo run --manifest-path experiments/oci-lab/Cargo.toml -- registry up --ephemeral
  ```

Both modes use `distribution/distribution:edge` on `localhost:5000`. The persistent mode uses a named Docker volume; the ephemeral mode is disposable and suitable for e2e tests.

## Demo Flow

Write a tiny demo WASM module:

```powershell
cargo run --manifest-path experiments/oci-lab/Cargo.toml -- demo-wasm --output tmp/demo.wasm
```

Push it to the local registry:

```powershell
cargo run --manifest-path experiments/oci-lab/Cargo.toml -- push-wasm --insecure --module tmp/demo.wasm --image localhost:5000/loop/hello-wasm:dev
```

Pull and execute it:

```powershell
cargo run --manifest-path experiments/oci-lab/Cargo.toml -- pull-run-wasm --insecure --image localhost:5000/loop/hello-wasm:dev
```

Run a container through the same lab:

```powershell
cargo run --manifest-path experiments/oci-lab/Cargo.toml -- run-container --image hello-world
```

## Notes

- The WASM flow currently targets OCI-stored `.wasm` binaries first. WIT packages and component-specific publishing should build on this instead of replacing it with another speculative package tree.
- The next step is to compare this generic artifact path with Bytecode Alliance `wasm-pkg-client` for WIT/component-native workflows.

## Backlinks

<!-- markdown-backlinks:start -->
- [architecture.md](../../architecture.md)
- [docs/next-actions/active/008-local-oci-registry-modes-and-auth.md](../../docs/next-actions/active/008-local-oci-registry-modes-and-auth.md)
- [docs/next-actions/completed/007-loop-rewrite-inventory-and-cut-line.md](../../docs/next-actions/completed/007-loop-rewrite-inventory-and-cut-line.md)
- [docs/project-plans/active/003-loop-refactor.md](../../docs/project-plans/active/003-loop-refactor.md)
- [docs/ref/loop-kit-fundamentals/index.md](../../docs/ref/loop-kit-fundamentals/index.md)
<!-- markdown-backlinks:end -->
