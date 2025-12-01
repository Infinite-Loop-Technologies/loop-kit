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
-   Tooling as code: workspaces bundle their own CLIs/IDEs/editors; “loop cloud” offers managed/self-hosted registries, realtime sync, and loop-kit native source control with Git as a sidecar.
-   Interop-first: wRPC/wasmCloud as the initial host/transport layer; can be forked/evolved. Supports capability proxies so browser/edge/native hosts can cooperate.

## Near-Term Focus

-   Stand up a host pipeline on wasmCloud (or fork) that runs WASM actors with pluggable providers.
-   Ship a lean capability standard library (FS, net, IO/logging, UI/DOM, GPU, storage) with both native and WASM providers.
-   Dogfood the site and dev tooling on loop-kit (ser ve/build via loop-kit components, not just Next.js defaults).
-   Produce functional examples/kits (e.g., multiplayer optimistic mutators shared client/server) to validate the model.
-   Keep the CLI simple; encourage bespoke tooling built inside workspaces.

## Benchmarks

-   Benchmark plan and harness notes: `benchmarks/README.md`
-   Runtime setup matrix: `benchmarks/runtime-matrix.md`

## Knowledge

-   JS engine benchmarking research: `knowledge/js-engines-benchmarking.md`
-   Capability providers and transports: `knowledge/capability-providers.md`

## Quick Commands

-   Install deps: `pnpm install`
-   Build all packages: `pnpm build`
-   Dev: `pnpm --filter @loop/cli dev`, `pnpm --filter @loop-kit/registry dev`, `pnpm --filter registry dev`
