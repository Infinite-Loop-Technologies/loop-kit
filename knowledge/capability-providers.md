# Capability providers and transports

## Open loops

| Type                  | Description                                                                     | Next action/owner                       |
| --------------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| research question     | How to layer wRPC over multiple transports (nats, quic, unix sockets) for hosts | doc: enumerate options + tradeoffs      |
| possible project      | Stdio/IPC sidecar provider template for rapid prototyping                       | build: minimal Node/Rust sidecar + spec |
| important next action | Decide default provider set for benchmarks (FS, net, IO/logging)                | pick: wasmCloud providers vs sidecars   |
| research question     | Can we hot-swap providers without restarting host runtimes?                     | test: design handshake + reload signal  |
| possible project      | Remote provider endpoints for multi-machine benchmarking                        | design: auth + latency budget + config  |

## Provider strategies

-   wasmCloud-style binaries: per-platform executables speaking wRPC; great for isolation and portability; need build/distribution flow.
-   Stdio/IPC sidecars: simplest dev loop; spawn local processes (Node, Rust) and communicate over stdio/domain sockets; ideal for experimental providers.
-   In-process native libs: fastest path but increases host TCB; keep for trusted/internal setups.
-   Remote endpoints: run providers on other machines; transport-agnostic wRPC keeps this viable; measure latency impact for benchmarks.

## Transports and notes

-   wRPC: default; transport-agnostic; works over NATS, QUIC, TCP, Unix/Named pipes; supports capability proxies.
-   Stdio pipes: trivial to bootstrap; good for local adapters and quick engine embeddings.
-   Domain sockets / named pipes: lower overhead than TCP on same host; good for Windows/macOS/Linux.
-   HTTP/2 or HTTP/3: easy debuggability; pair with streaming/bidirectional upgrades.
-   Shared memory (future): explore for GPU/large buffer paths; needs safety story.

## Benchmark implications

-   Provide both wasmCloud providers and stdio sidecars so benchmarks can run without host rebuilds.
-   Record transport type per run to attribute latency correctly.
-   Keep provider protocol compatible with component-native engines (StarlingMonkey/porffor embeddings).
