# Component host packaging and bundling

Anchor: think of the Wasmtime `wasip2-plugins` example: thin host plus swappable component plugins, generalized to loop-kit capabilities and multi-platform outputs.

## Goals

-   Ship components as the primary deliverable; hosts are shims that wire providers and scheduling.
-   Make components swappable (plugins) while letting some be pinned as non-replaceable core.
-   Generate runnable artifacts for native targets (per-OS EXEs) and the browser without forcing users to hand-roll hosts.
-   Keep capability wiring declarative so provider backends can change without rebuilding components.

## Near-term focus

-   Keep bundling simple: a Rust Wasmtime host CLI that runs components from disk with local providers; skip OCI/wRPC until the loop is proven.
-   Ship one Rust example component plus a host crate template to exercise logging/FS/HTTP; add window/input/drawing once providers exist.
-   Add CLI scaffolding (`loop component new`, `loop host new`) and a local packaging flow before exploring remote registries.

## Artifact shapes

-   Components: compiled WASM components for app/core/plugins, built from any language with WIT bindings.
-   Host runtime: minimal native binary (Rust Wasmtime-based reference) or JS/worker host in browser; maps `loop:*` WIT to providers.
-   Bundle formats: (a) host binary + sidecar component directory + manifest, (b) single-file host embedding components (`include_bytes!`/pack), (c) browser bundle that preloads components into a worker/shared worker.

## Native host patterns

-   Reference runner (dev): `loop run <component>` -> invokes Wasmtime host with local providers (logging/FS/HTTP first; UI/GPU stubs until providers land). No bundling; good for rapid iteration.
-   Host + plugin dir: host binary reads a manifest (components, provider selection, trust class). Plugins live in a folder; swapping means replacing files and reloading the host graph.
-   Embedded bundle: scaffold a Rust host crate template and embed components as bytes; build per target (`x86_64-*-*`, `aarch64-*-*`). Useful for shipping a single EXE/AppImage/MSIX/pkg.
-   Provider wiring: start with in-process/stdio providers. wRPC/wasmCloud/OCI is backlog/legacy for remote providers; keep wiring pluggable so it can be swapped later. Map trust classes to allowed providers (untrusted excludes process/raw DOM; trusted unlocks them).

## Browser host patterns

-   Worker host (baseline): JS host (Vite/Next entry) spins a dedicated worker that loads the component binary (possibly componentized WASI JS shim) and bridges `loop:*` caps to DOM/WebGPU/WebStorage. Keep same WIT surfaces as native.
-   Packaging: bundle components as static assets with a manifest; optional embed via base64/module import for offline. Service Worker can cache and hot-swap plugin components.
-   DOM/UI: render through `loop:ui` IR; trusted builds can expose `loop:dom` escape.

## CLI/scaffolding flows (proposed)

-   `loop host scaffold --template native-wasmtime`: emits a Rust host crate pre-wired to `loop:*` providers, manifest loader, and plugin hot-reload hook.
-   `loop host scaffold --template browser-worker`: emits JS/TS worker host + main-thread bridge for DOM/WebGPU; includes manifest-driven component preload.
-   `loop pack native --target windows,macos,linux --manifest app.loop.toml`: builds components, selects providers, embeds or stages them next to the host, and outputs per-OS artifacts; keep it local (no OCI/wRPC) for now.
-   `loop pack web --manifest app.loop.toml`: bundles worker host + components + manifest for CDN/static hosting; OCI/wRPC registry wiring is a later experiment.
-   `loop run` keeps a dev-story: run components directly with the reference host without packaging.

## Composition and swap rules

-   Manifest should classify components: `core` (pinned, cannot be overridden), `default` (can be replaced with config/feature flags), `plugin` (discovered at runtime).
-   Providers selected per capability namespace with platform fallbacks (e.g., `loop:gfx` -> `wgpu` native, `WebGPU` in browser, or stub).
-   Trust classes (untrusted/trusted) gate access to providers; manifest + signing determine which components get elevated caps.

## Open loops

-   Finalize manifest shape (paths, trust class, provider selection, core/default/plugin semantics) for local bundles; registry/OCI is later.
-   Implement the Rust reference host crate + CLI for local runs and ship the first example component alongside it.
-   Add CLI scaffolding (`loop component new`, `loop host new`) and packing for local artifacts; decide browser host template once native path is stable.
-   Decide bundling transport for providers after the local path is solid (stdio/in-process now; wRPC/QUIC/NATS is backlog/legacy).
-   Define how hot-reload/hot-swap works across native/browser hosts (reload signal vs full restart).
-   Investigate signing/attestation strategy for trusted components in packaged artifacts.
