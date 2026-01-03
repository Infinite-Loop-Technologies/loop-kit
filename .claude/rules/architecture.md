# Architecture Rules

## Core Principles

### Components-First Design
- WASM components are the default unit of composition
- Native components are allowed only when practical (performance, platform-specific APIs)
- Shared components should run on both client and server when possible
- All user code (including mods like Wizard Tower) should be WASM components

### Capability-Driven Architecture
- WASI is only a baseline; loop-kit requires richer capabilities
- Required capabilities: UI/DOM, GPU/WebGPU, FS/net/IO, logging, storage, process
- Providers may be WASM components, native libs, or host executables
- Capability proxies across hosts are expected (for distributed scenarios)
- Trust tiers gate access to sensitive caps (process, raw DOM)

### Incremental Effect System
- `loop:fx` powers reconciliation for UI and dataflow
- React-like model: components as tree, props down/yields up
- Deterministic scheduling with fibers
- Host-defined diffing and scheduling (not embedded in components)

### Interop Over Lock-In
- Keep hosts portable; avoid runtime lock-in
- Immediate path: local Wasmtime host CLI
- wRPC/wasmCloud/OCI is legacy/backlog; keep modular for future reuse
- Composition tools bridge platform backends to stable APIs

## Runtime Strategy

### Host Implementation
- Reference runtime: lightweight Rust host with baseline providers
- Native: Tao/winit + wgpu + webview backend
- Browser: WebGPU + DOM bridge
- Platform capabilities detected at runtime, exposed conditionally

### Provider Strategy
- Start with in-process native shims and stdio/IPC sidecars
- wRPC/wasmCloud for remote providers is backlogged
- Allow hot-swap with handshake + reload signal
- Trust classes: untrusted (default sandbox) vs trusted (process/raw DOM access)

### Dev Server Design
- `loop:devserver` provides workspace scan, watch graph, component loader
- Ship default CLI implementation but allow swapping via config
- Support SDK-only workflows + packaged runtime that can be forked

## Near-Term Focus

1. Bootstrap Rust Wasmtime host CLI for local WASM components
2. Add runnable examples (logging, FS, HTTP, then UI/window/input)
3. Grow CLI scaffolding (`loop component new`, `loop host new`)
4. Local packaging flow (defer OCI/wRPC until host loop is solid)

## What to Avoid

- Runtime lock-in (keep hosts portable and capability providers pluggable)
- Premature OCI/wRPC/wasmCloud integration (focus on local loop first)
- Monolithic runtime (loop-kit is SDKs, protocols, and bootstrap tools)
- Embedding diffing/scheduling in components (host responsibility)
- Over-engineering simple features
- Creating abstractions for one-time operations
