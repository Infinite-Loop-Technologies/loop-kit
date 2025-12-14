# WASM/WIT tooling to use

-   wasm-tools (CLI + crates): `wasm-tools component wit validate`, `compose`, `demangle`. Crates expose parser/printer for WIT/component work.
-   wit-deps: resolves `use` dependencies for WIT packages; good for vendoring external WIT.
-   wit-bindgen + native `cargo build --target wasm32-wasip1/wasip2` for Rust component builds; use cargo-component only when bindings demand it.
-   wac/wkg: component and WIT inspection/graph helpers.
-   wasmtime / wasmtime-component: host/embedder for components; Rust API for runtime experiments and the reference host CLI.
-   Optional/backlog: wash + OCI signing, wRPC transports, NATS/QUIC remoting; defer until the local host loop is solid.
