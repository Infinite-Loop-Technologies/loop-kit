# loop-kit benchmarking plan

Benchmarks cover JS/WASM runtimes and host capability paths to keep loop-kit components portable and fast.

## Goals
- Compare runtime performance across Node, Bun, Deno, StarlingMonkey (component-native), Nova, Boa, rquickjs, static Hermes, porffor.
- Stress component pipelines, not just micro-benchmarks: load + run registry examples, measure capability calls, and capture dev ergonomics flags.
- Produce machine-readable results (JSON/CSV) and a small CLI/UI viewer.

## Scope and workloads
- Compute: numeric kernels, JSON encode/decode, structured cloning, small graph traversals.
- Capability-heavy: FS read/write, net/HTTP fetch, logging, IPC/stdio round-trips.
- Component-hosted: run WASM components that exercise capability providers via the local Wasmtime host (stdio/in-process); wRPC/wasmCloud is backlog.
- UI/GPU proxy (later): DOM/layout IR replay, WebGPU shader warmups via host provider.

## Harness shape
- Bench runner: TypeScript CLI that discovers benchmarkable examples (planned `examples/bench` registry entries) and runs them through runtime adapters.
- Runtime adapters: spawn native runtimes (Node/Bun/Deno), embed component-native engines (StarlingMonkey, porffor, etc), capture flags (JIT/AOT, warmup, GC settings).
- Outputs: per-run JSON + CSV, optional pretty table; seedable runs, configurable samples/iterations.
- UI: future site page to visualize runs; optional Ink view for quick compares.

## Capability strategy
- Default: local Wasmtime host providers for FS/net/IO and future UI/GPU; remote/wRPC/wasmCloud is a later experiment.
- Fast-path prototype: stdio/IPC sidecars so adapters can call local runtimes without rebuilding the host.
- Cross-host: allow remote provider endpoints for multi-machine tests; keep transport pluggable.

## Next steps
- Define `examples/bench` format and add first workloads (compute, FS, net).
- Implement runtime adapter interface and Node/Bun/Deno adapters first.
- Add result persistence + CSV/JSON schema, then wire a simple viewer.
