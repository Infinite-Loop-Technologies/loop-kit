# Loop-kit capabilities, runtimes, and providers

Audience: expert. Keep components-first and assume loop-kit runtimes/SDKs expose the same capability surface across hosts.

## Objectives and scope

-   Components everywhere: target a world where almost all code (including mods such as Wizard Tower) is WASM components. Native is a provider escape hatch.
-   Capability baseline: bundled caps for UI/DOM/webview, GPU/WebGPU, FS/net/IO/logging, storage, process, and platform/OS affordances when present. Trusted components can opt into "unsafe" caps (process/host commands) under explicit policy.
-   Runtime/SDK symmetry: hosts and SDKs should agree on WIT packages and capability negotiation. Composition tools bridge platform-specific backends to a stable API.
-   Trust tiers: default untrusted sandbox; trusted tier unlocks native commands/processes and raw DOM. Gate via signing/config per workspace.
-   Effect system: `loop:fx` powers incremental effects/fibers, quoting/unquoting components, and reconciliation for UI/dataflow.
-   See `knowledge/wit-notes.md` for WIT hygiene and `knowledge/effect-system.md` for the incremental effects track.

## Immediate focus

-   Build a Rust Wasmtime host CLI crate that runs a component path from disk with logging/FS/HTTP providers and stubs for future `loop:ui`/`loop:window` work.
-   Add first Rust example components in `examples/` (logging/FS/HTTP now; window/input/drawing once providers exist) to exercise the host.
-   Add CLI scaffolding commands for components/hosts and a local packaging flow; defer OCI registry or wRPC integration until the local loop is proven.

## WIT usage and WASI reuse

-   Keep types/records inside worlds or interfaces (no package-level loose types). Use `use other:pkg@x.y.z` to import existing packages.
-   Reuse WASI packages where possible (e.g., `wasi:clocks/monotonic`, `wasi:filesystem`/`filesystem-preopens`, `wasi:http`/`sockets`, `wasi:cli` for devserver/CLI components). Compose them into `loop:*` worlds to stay compatible with existing SDKs.
-   Reference WIT design: https://component-model.bytecodealliance.org/design/wit.html (good refresher on worlds, imports/exports, and dependency wiring).

## Capability namespaces (initial WIT scaffold in `wit/`)

| Namespace        | Scope                                                                     | Notes                                                          |
| :--------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------- |
| `loop:core`      | logging, clock/timers, randomness, cancellation hooks                     | `wit/loop-core/world.wit`                                      |
| `loop:fx`        | effect/fiber runtime and declarative graph scheduling                     | `wit/loop-fx/world.wit`                                        |
| `loop:pkg`       | artifact/package resolution, fetch, caching hints                         | drive component bundling + resolver plugins                    |
| `loop:devserver` | workspace graph, component/provider loader, command registry, watch graph | default CLI impl should be swappable                           |
| `loop:window`    | windowing/input/surfaces (Tao/winit native; DOM in browser)               | `wit/loop-window/world.wit`                                    |
| `loop:ui`        | high-level layout/UI IR (block/inline/flex/text) mapped to renderers      | raw DOM only via `loop:dom` for trusted components             |
| `loop:gfx`       | GPU/WebGPU surface/queues/buffers; abstracts wgpu/WebGPU                  | pair with shared-memory plan later; reuse WASI gfx when viable |
| `loop:process`   | caps-aware spawn/exec; stdio/env mapping                                  | trusted-only by default                                        |

WIT stubs exist for `loop:core`, `loop:fx`, `loop:pkg`, `loop:devserver`, `loop:window`, and `loop:ui` to anchor syntax and imports.

## UI IR notes

-   `loop:ui` exposes a high-level IR (block/inline/flex/text/absolute/transform) similar to usegpu-layout; renderers map to DOM/webview/native.
-   `loop:window` handles windowing/input/surface present (native Tao/winit/webview; browser DOM). UI providers bridge `loop:ui` trees to a target window/surface.
-   Allow trusted `loop:dom` escape hatch for raw DOM when needed. Default is safe IR with host-controlled rendering.

## Runtime and host experimentation

-   Ship a Rust host crate + CLI using Wasmtime as the reference runtime; run component paths from config/CLI, wire providers locally, and keep room to componentize the CLI later.
-   SDKs: start with Rust/JS, using existing WASI/WIT bindings; aim to make toolchain components first-class (build/link as components). OCI/wRPC integrations are backlog/legacy.
-   Explore windowing and web APIs via providers (CEF/webview/wgpu on native; DOM/WebGPU in browser); gate via capabilities and trust class.

## WIT dependency and re-export notes

-   Use `use other:pkg@x.y.z` in a package to import types/interfaces; worlds can `import` those interfaces to make dependencies explicit.
-   Re-exporting: WIT cannot re-export whole packages, but you can `use` interfaces/types and surface them from your world under the same name for a stable facade (e.g., `loop:core` can `use wasi:clocks/monotonic` and re-surface it).
-   Dependency direction: keep `loop:core` low-level; higher namespaces (`loop:reactor`, `loop:ui`, `loop:devserver`) depend on it, not vice versa.

## Runtime and provider strategy

-   Reference runtime: lightweight host that ships baseline providers (UI/webview/DOM, GPU, FS/net/logging, storage). On native: Tao/winit + wgpu + webview/CEF/tauri backend; in browser: WebGPU + DOM bridge. Platforms can be detected at runtime and capabilities exposed conditionally.
-   Providers: start with in-process/native shims and stdio/IPC sidecars. wRPC/wasmCloud/OCI is legacy/backlog for remote providers; keep wiring pluggable so it can slot in later. Allow hot-swap with a handshake + reload signal to keep actors alive.
-   Trusted vs untrusted: untrusted caps exclude process/raw DOM. Trusted components can opt into those providers; registry metadata should encode trust class.
-   Composition: permit platform-specific provider chains (e.g., macOS Touch Bar, Windows notifications) composed behind a stable interface; choose providers via config/feature flags.
-   Default overrides: dev server should pick local stdio/in-process providers by default; remote/OCI/wRPC packaging is a later experiment. Make overrides configurable per workspace and per capability.

## Dev server and workspace tooling

-   `loop:devserver` provides workspace scan, watch graph, component/provider loader, and command registry. Ship a default CLI implementation but allow swapping via config (e.g., workspace YAML) or runtime flags.
-   Support both SDK-only workflows and a packaged runtime that can be forked via the loop-kit SDK (goal: you can build your own host flavor).

## Tooling to lean on now

-   wasm-tools (wit, compose, demangle), wit-deps, wit-bindgen, and wac/wkg for inspection; prefer native `cargo build --target wasm32-wasip1/wasip2` over cargo-component unless bindings demand it.
-   Start by validating WIT packages with `wasm-tools component wit validate` and running components through the local Wasmtime host CLI; wRPC/wash/OCI integration is a backlog path.

## Open loops

| Type                    | Description                                                                                                                      | Next action/owner                         |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- |
| immediate next action   | Scaffold a Rust Wasmtime host CLI crate to run component paths from disk; wire logging/FS/HTTP providers and config-driven stubs | create crate + `loop run <component>`     |
| immediate next action   | Add first Rust example components in `examples/` (logging/FS/HTTP), then window/input/drawing demo via `loop:ui`/`loop:window`. | scaffold example + build script           |
| immediate next action   | Add CLI scaffolding commands (`loop component new`, `loop host new`) and local packaging (no OCI/wRPC yet).                     | design command UX + templates             |
| naming decision         | Decide whether to rename `loop:reactor` to avoid conflict with WIT "reactor" kind (candidates: `loop:fx`, `loop:effects`).       | pick name + update stubs                  |
| important next action   | Document WIT usage patterns + WASI reuse (types inside worlds/interfaces, imports, compose) and align stubs accordingly.         | add examples + update stubs               |
| important next action   | Specify trust classes and capability gating (untrusted vs trusted) and how registry metadata encodes requirements.               | draft policy + config shape               |
| important next action   | Flesh out `loop:core`/`loop:fx` WIT (effects, fibers, reconciliation hooks, cancellation) with examples.                         | design doc + iterate on WIT               |
| important next action   | Define `loop:ui` IR (box/inline/stack/text) and renderer mapping; pair with `loop:dom` escape policy.                            | draft WIT + renderer notes                |
| important next action   | Map `loop:gfx` to WebGPU/wgpu and align with WASI gfx proposal for reuse.                                                        | design doc + prototype provider           |
| important next action   | Decide WIT dependency strategy (wit-deps vs vendored copies) for pulling WASI and third-party packages.                          | add wit-deps config + fetch wasi packages |
| important next action   | Define default provider bundle for dev/prod (UI/DOM/webview, GPU, FS/net/logging, storage) and switching mechanism.              | config proposal + reference host mapping  |
| research question       | Can we hot-swap providers without restarting hosts?                                                                              | prototype handshake + reload signal       |
| backlog                 | wRPC/OCI transport + registry path (legacy) once the local host loop is stable.                                                  | mark backlog; revisit after host CLI      |
| research question       | How Ambient handles external WIT (reuse vs vendoring) and whether we can mirror that pattern.                                    | review Ambient repo + capture pattern     |
| backlog project         | Stdio/IPC sidecar templates for rapid provider prototyping (Node/Rust) with wRPC bindings.                                       | park until host CLI done                  |
| possible project        | Wizard Tower example: fully moddable component graph using `loop:fx` effects, `loop:ui` rendering, `loop:pkg` mod loading.       | outline example + choose providers        |
| possible project        | Default `loop:devserver` CLI implementation + contract for swapping implementations.                                             | design CLI contract + config wiring       |
| possible project        | Remote provider endpoints for multi-machine benchmarking and latency attribution.                                                | design auth + config + metrics            |

## Notes for Wizard Tower (mod-heavy path)

-   Mods ship as components that declare needed caps; the runtime maps them to providers based on trust class.
-   UI flows render through `loop:ui` (safe IR) with optional `loop:dom` escape for trusted mods. GPU work routes via `loop:gfx`.
-   Package resolution uses `loop:pkg` to fetch mods/artifacts; dev server tracks the graph and reloads via `loop:reactor` reconciliation.
