# Capability providers and transports

## Loop superset (WIT namespaces to stabilize early)

-   `loop:core`: logging/metrics/tracing, clock/timers, randomness, cancellation.
-   `loop:fsx`: scoped FS roots, glob, watch, atomic write/temp, digests.
-   `loop:netx`: HTTP(s) client/server, websockets, DNS, gRPC/wRPC bridge.
-   `loop:process`: spawn/exec with caps-aware env/stdio; native provider shim.
-   `loop:ui`: secure UI IR (nodes/props/events) for plugin rendering; no DOM escape.
-   `loop:dom`: opt-in raw DOM bridge for trusted components.
-   `loop:reactor`: incremental effect/fiber runtime (props down, yields up, hooks, tick).
-   `loop:gfx`: GPU/WebGPU surface, queues, buffers/textures.
-   `loop:toolchain`: bundler/compiler/linker/task runner; fulfilled by WASM or native.
-   `loop:pkg`: binary/artifact fetch via plugin resolvers (Moonrepo-like, better UX).
-   `loop:sync`: multiplayer state sync, CRDT-ish patches, optimistic apply/rollback.
-   `loop:devserver`: workspace scan, component/provider loader, watch graph, command registry.

## Open loops

| Type                  | Description                                                                                                | Next action/owner                                                   |
| :-------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| important next action | Stand up wasmCloud (or fork) host pipeline to run WASM actors with pluggable providers                     | spike: minimal host config + provider wiring                        |
| important next action | Define capability standard library (FS, net, IO/logging, UI/DOM, GPU, storage) with native + WASM variants | draft: provider list + packaging targets                            |
| research question     | How to layer wRPC over multiple transports (nats, quic, unix sockets) for hosts                            | doc: enumerate options + tradeoffs                                  |
| possible project      | Stdio/IPC sidecar provider template for rapid prototyping                                                  | build: minimal Node/Rust sidecar + spec                             |
| important next action | Decide default provider set for benchmarks (FS, net, IO/logging)                                           | pick: wasmCloud providers vs sidecars                               |
| research question     | Can we hot-swap providers without restarting host runtimes?                                                | test: design handshake + reload signal                              |
| possible project      | Remote provider endpoints for multi-machine benchmarking                                                   | design: auth + latency budget + config                              |
| possible project      | Dogfood site/dev flows through loop-kit hosts instead of framework defaults                                | design: replace Next dev/build steps with loop-kit host + providers |

## Provider strategies

-   wasmCloud-style binaries: per-platform executables speaking wRPC; great for isolation and portability; need build/distribution flow.
-   Stdio/IPC sidecars: simplest dev loop; spawn local processes (Node, Rust) and communicate over stdio/domain sockets; ideal for experimental providers.
-   In-process native libs: fastest path but increases host TCB; keep for trusted/internal setups.
-   Remote endpoints: run providers on other machines; transport-agnostic wRPC keeps this viable; measure latency impact for benchmarks.

## Transports and notes

-   wRPC: default; transport-agnostic; works over NATS, QUIC, TCP, Unix/Named pipes; enables capability proxies.
-   Stdio pipes: trivial to bootstrap; good for local adapters and quick engine embeddings.
-   Domain sockets / named pipes: lower overhead than TCP on same host; good for Windows/macOS/Linux.
-   HTTP/2 or HTTP/3: easy debuggability; pair with streaming/bidirectional upgrades.
-   Shared memory (future): explore for GPU/large buffer paths; needs safety story.

## Packaging, registry, and workspace notes

-   wasmCloud packaging (see https://wasmcloud.com/docs/concepts/packaging/): actors/components and providers ship as OCI artifacts; supports local paths during dev, registries in prod.
-   loop-kit workspaces should treat components/providers as first-class packages (WASM and native); registry entries may bundle metadata for required caps and transports.
-   OCI registries double as binary depot for provider executables; align with wash publish flows; consider mirroring to loop cloud.
-   Workspaces need code storage + realtime CRDT sync; dev server mediates checkout/collab while mapping to providers.
-   Plugging non-WASM components: hosts can expose native providers or sidecars; registry still tracks caps + transport hints.
-   Tooling surface: extend wash CLI minimally (wrapper ok) for loop-kit worlds; keep loop CLI thin and componentized.

## Benchmark implications

-   Provide both wasmCloud providers and stdio sidecars so benchmarks can run without host rebuilds.
-   Record transport type per run to attribute latency correctly.
-   Keep provider protocol compatible with component-native engines (StarlingMonkey/porffor embeddings).
