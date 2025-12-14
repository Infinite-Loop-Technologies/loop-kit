# Ambient research (AmbientRun engine/platform)

Audience: expert. Focus on what maps to loop-kit (WASM component runtime, multiplayer defaults, tooling/platform).

## Key links

-   Intro overview: https://ambientrun.github.io/Ambient/introduction.html
-   Package/WebAssembly model: https://ambientrun.github.io/Ambient/reference/package.html#webassembly
-   ECS as real-time DB: https://ambientrun.github.io/Ambient/reference/ecs.html
-   Networking (QUIC/WebTransport, world diffs): https://ambientrun.github.io/Ambient/reference/networking.html
-   Renderer/WebGPU internals: https://ambientrun.github.io/Ambient/runtime_internals/renderer.html
-   Asset cache/memoization: https://ambientrun.github.io/Ambient/runtime_internals/asset_cache.html
-   Modding UX/tutorial: https://ambientrun.github.io/Ambient/tutorials/game/8_modding.html
-   Platform blog hub: https://ambient.run/blog/platform
-   wasm-bridge (Ambient fork): https://github.com/AmbientRun/wasm-bridge
-   wasm-bridge (original): https://github.com/kajacx/wasm-bridge

## Findings by area

-   WASM runtime/capabilities

    -   All packages build to WASI preview2 components; Ambient auto-runs `cargo build --target wasm32-wasi` and wraps with `wasm-tools component new` (see reference/package#webassembly). Runtime will load any .wasm in `build/{client,server}` that implements their WIT.
    -   Hosted mode strips guest FS/HTTP; local mode allows WASI FS under package `data/` and Ambient HTTP client (same page). This is an explicit trust tier split we can mirror.
    -   Runtime + user code both run in WASM on web; native hosts run WASM components with isolation, matching loop-kit’s desire for components-first.

-   ECS / “database”

    -   Intro frames ECS as a real-time DB with automatic sync of Networked components (introduction + reference/ecs.html). Manifest-defined components get attributes (`Networked`, `Store`, `Resource`, etc.) and generate typed projections for guest code.
    -   Concepts (schema bundles) are manifest-level; generate typed structs and suggested defaults, enabling cross-package schema reuse without code coupling.
    -   Queries (per-frame, spawn/despawn, change) are the main execution model; systems not yet formalized. This is similar to an effect/fiber loop with structural queries we could expose in loop:reactor.

-   Networking and sync (WebTransport/QUIC)

    -   Desktop uses QUIC via `quinn`; web uses WebTransport via `h3-webtransport` (reference/networking.html). HTTP 8999 / QUIC 9000 by default.
    -   Sync model: server-authoritative, world diff (`WorldDiff` with spawn/despawn/component add/update/remove). No built-in prediction/rollback; messaging supports reliable (uni-stream) and unreliable (datagram) channels defined in manifest.
    -   NAT traversal proxy shipped by default (`AmbientProxy`, toggle with `--no-proxy`); server connects outward via QUIC to allocate a join endpoint. Mirrors need for capability providers for transport selection in loop-kit.
    -   Security note: Networked components expose state to clients unless `no_sync` tag applied; they call out cheating risk—relevant for loop-kit trust tiers.

-   Rendering / WebGPU

    -   Renderer is WebGPU-based with PBR defaults (intro) and a GPU-driven architecture (runtime_internals/renderer.html). Design intent: GPU ECS syncing, GPU culling, GPU LOD selection, `multi_draw_indirect_count` when available; web/macOS fall back to per-draw calls.
    -   Stress-tested with hundreds of thousands of objects; shows viability of GPU-driven instancing approach we can mirror in loop:gfx with capability negotiation for MDIC availability.

-   Asset streaming and cache

    -   Assets (including code) stream on connect (introduction assets section) so clients join without installs; matches loop-kit goal of streamed components/providers.
    -   Asset cache (runtime_internals/asset_cache.html) is a memoization layer keyed by debug-formatted structs; supports async loaders and configurable keepalive (none/timeout/forever). Useful pattern for provider-side resource caching.

-   Tooling, packages, and modding

    -   Package manifests are Rust-Cargo-inspired: schemas/components/concepts/messages declared in `ambient.toml`; packages are ECS entities at runtime (reference/package.html).
    -   Modding is first-class: any game is moddable; mod manager UI is just another package dependency; mods declare `content = { type = "Mod", for_playables = [...] }` and can depend on the base game deployment (tutorials/game/8_modding.html).
    -   Platform tooling includes NAT proxy, auto-generated docs (`--open-docs`), and a package registry site; blog at https://ambient.run/blog/platform documents platform direction (needs deeper read for deploy/runtime hosting model).

-   wasm-bridge notes (why Ambient uses it)

    -   `wasm-bridge` goal: “run wasmtime on the web” with a unified API so the same Rust host code works on native and web; focuses on component model support and ships preview2 shims (Ambient fork README).
    -   Original repo (kajacx) documents alternatives and version matrix; indicates partial WASI support and component-model emphasis. Ambient’s fork likely chosen to align host API across native/web without waiting for upstream wasmtime web support.
    -   Relevance to loop-kit: could be a stopgap for running the reference host in browsers; also a data point on implementing resource shims for preview2. Need to compare against direct use of Wasmtime+WASI+custom providers.

## Ambient schema manifest (`ambient.toml`) vs WIT

-   What it is: custom TOML schema (see https://github.com/AmbientRun/Ambient/blob/main/schema/schema/ambient.toml) that mixes package metadata, ECS schema (components with attributes, concepts), messages, enums, includes, and build/content type hints.
-   Pros

    -   Single manifest for content + schema + distribution; modders stay in TOML without touching WIT or host APIs.
    -   Domain-tuned attributes (`Networked`, `Resource`, `Store`) map directly to ECS/networking behavior; concepts/messages capture gameplay semantics.
    -   Composability via `includes`/`dependencies` without WIT package plumbing; codegen generates language bindings (Rust) from one file.
    -   Sufficient type system for ECS data (Vec/Option, enums) and manifest-driven asset/tooling metadata.

-   Cons

    -   Not a standard IDL: no WIT interface/world/resource semantics; cannot use wit-bindgen/compose; interop with non-Ambient hosts requires custom adapters.
    -   Narrow types (no nested containers, no structs/variants beyond enums, no resource/handle lifecycle), so less expressive than WIT for capabilities.
    -   ABI and capability contracts live outside the manifest; duplication if also defining host APIs in WIT.
    -   Ties tightly to Ambient’s runtime and codegen; harder for third-party hosts/providers to adopt without reimplementing the schema toolchain.

## Open questions / next actions for loop-kit

-   Next action: Prototype a loop-kit host build using `wasm-bridge` to assess browser viability vs straight wasmtime+JS shim; document compatibility gaps (WIT resource handling, preview2 adapters).
-   Open question: How to encode capability gating similar to Ambient’s hosted/local split (FS/HTTP disabled when hosted) within loop-kit’s trust classes?
-   Next action: Design world-diff sync path in loop:reactor aligned with Ambient’s entity diffing; evaluate if we can expose prediction hooks as packages (they deferred this).
-   Open question: For GPU pipeline, do we mandate MDIC or expose capability flags for per-draw fallback similar to Ambient’s renderer?
-   Next action: Study Ambient platform blog for deployment/registry UX patterns we should mirror (package metadata, mod distribution, proxy endpoints).
-   Open question: Should loop-kit adopt Ambient-style manifest-declared schemas/concepts to drive codegen across languages (aligns with WIT packages)?
