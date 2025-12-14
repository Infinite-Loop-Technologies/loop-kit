# JS engine benchmarking (loop-kit)

## Open loops

| Type                  | Description                                                          | Next action/owner                           |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------- |
| possible project      | Build the runtime adapter interface and first Node/Bun/Deno adapters | spec: draft interface in benchmarks harness |
| research question     | How to embed StarlingMonkey/Nova/porffor as component-native engines | find: doc links + minimal embed notes       |
| important next action | Define `examples/bench` format and first workloads                   | write: workload schema + 2-3 samples        |
| research question     | Capture fair warmup strategy across JIT/interp/ASM engines           | decide: warmup iterations vs time budget    |
| important next action | Decide on metrics schema (timings, rss, gc counts)                   | design: JSON/CSV schema + pretty table      |

## Candidate engines and notes

-   Node.js (V8): baseline; test LTS + latest; include `--wasm-gc` path.
-   Bun (JavaScriptCore): fast start; check `--smol` and GC options.
-   Deno (V8): good for permissions story; compare turbo vs default flags.
-   StarlingMonkey: Bytecode Alliance component-native; prioritize embedded path.
-   Nova: data-oriented design; research build + flag matrix.
-   Boa: Rust interpreter; good for cold-start comparisons.
-   rquickjs: lightweight embeddable; map FS/net caps via sidecar.
-   Hermes (static): static build for deterministic perf; focus on startup/memory.
-   porffor: WASM-first; treat as experimental but include if stable.

## Benchmark methodology (draft)

-   Runs: fixed iteration count plus optional time-boxed mode; seedable RNG; repeated N samples per runtime.
-   Warmup: configurable warmup iterations; default on for JIT engines, optional off for cold-start comparisons.
-   Metrics: wall time per stage, RSS, GC counts if exposed; per-run metadata (commit hash, runtime version, flags, host caps).
-   Output: JSON and CSV; human-friendly table view; path to push into site visualizer.

## Workloads to cover

-   Compute: Fibonacci/recursive, matrix multiply, JSON encode/decode, small graph search.
-   Capability-driven: FS read/write batches, HTTP fetch to local stub, logging/printf, IPC round-trips.
-   Component-hosted: WASM components that call capability providers through the local Wasmtime host (stdio/in-process); wRPC/wasmCloud is backlog.
-   UI/GPU (later): layout IR replay and WebGPU warmups through host provider.

## Instrumentation ideas

-   Wrap runtimes with adapter interface that records: init time, module load time, execute time, and capability call latency histograms.
-   Optional per-op tracing via stdio middleware; wRPC instrumentation is backlog. Keep overhead bounded and measurable.
-   Expose per-runtime flag sets in results to keep comparisons transparent.

## Data-oriented engines (Nova, porffor)

-   Track2 memory layout assumptions and SIMD/SIMT availability.
-   Note whether they favor linear memory patterns that align with component pipelines.
-   Capture any constraints (e.g., porffor WASM-only, Nova build targets).
