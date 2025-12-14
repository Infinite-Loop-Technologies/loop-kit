# loop-kit

loop-kit is an experimental full-stack toolkit for composing apps and games from WASM-centric components, incremental effect systems, and capability-driven hosts. It treats the workspace itself as the product: you write the tools that build and operate your software.

## Current State

-   pnpm workspace with three packages: CLI (`packages/cli`), registry library (`packages/registry`), and Next.js site (`packages/site`).
-   Prototype/scaffolding phase; TypeScript-first, multi-language via WASM components planned.
-   CLI is intentionally minimal: bootstrap, run, and get out of the way.

## Core Ideas

-   Components-first: reusable WASM components (plus native when needed) packaged with declared capabilities and composable across client/server.
-   Capabilities over runtime lock-in: WASI is a baseline; richer caps (UI, GPU/WebGPU, data, IO, FS, net, fibers) come from providers that can be WASM, native libs, or host executables.
-   Incremental systems: reactive fiber/effect runtime inspired by UseGPU + incremental dataflow (timely/differential) for state sync, rollback, and optimistic flows.
-   Tooling as code: workspaces bundle their own CLIs/IDEs/editors; loop cloud offers managed/self-hosted registries, realtime sync, and loop-kit native source control with Git as a sidecar.
-   Interop-first: keep hosts portable; wRPC/wasmCloud/OCI is now a legacy track to revisit later, with the immediate focus on a local Wasmtime host.

## Near-Term Focus

-   Bootstrap a Rust Wasmtime host CLI crate that runs local WASM components from disk; keep it simple but ready to evolve into a componentized host.
-   Add runnable example components in `examples/` (start with Rust) that exercise logging/FS/HTTP and eventually window/input/drawing via `loop:ui`/`loop:window` providers.
-   Grow CLI scaffolding for components/hosts (`loop component new`, `loop host new`) and basic packaging/build flows; defer OCI registry/wRPC integration until the local loop is solid.
-   Treat the site as out-of-scope for now; focus on local tooling and component experimentation.

## Benchmarks

-   Benchmark plan and harness notes: `benchmarks/README.md`
-   Runtime setup matrix: `benchmarks/runtime-matrix.md`

## Knowledge

-   JS engine benchmarking research: `knowledge/js-engines-benchmarking.md`
-   Capability providers and transports: `knowledge/capabilities-runtime.md`
-   WIT usage and composition notes: `knowledge/wit-notes.md`
-   Incremental effect system research: `knowledge/effect-system.md`
-   WASM/WIT tooling cheatsheet: `knowledge/wasm-tooling.md`

## Quick Commands

-   Install deps: `pnpm install`
-   Build all packages: `pnpm build`
-   Dev: `pnpm --filter @loop/cli dev`, `pnpm --filter @loop-kit/registry dev`, `pnpm --filter registry dev`
