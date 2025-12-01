# Runtime setup matrix

Use this to track install steps, flags, and harness status for each runtime.

| Runtime | Install/notes | Harness status | Flags to test |
| --- | --- | --- | --- |
| Node.js (LTS + latest) | nvm/pnpm; ensure `--experimental-wasm-gc` where relevant | planned | `--jitless`, `--no-liftoff`, `--wasm-gc`, `--max-old-space-size` |
| Bun | download release; verify `bun run` perf mode | planned | default vs `--smol`, GC tuning |
| Deno | `deno upgrade`; allow `--allow-*` per bench | planned | `--v8-flags=...`, native vs component embedding |
| StarlingMonkey | build from Bytecode Alliance repo; embed as component-native adapter | planned | AOT vs JIT modes if available |
| Nova | follow Nova docs; focus on data-oriented configs | research | warmup vs no-warmup; SIMD flags |
| Boa | cargo install or build; run via sidecar | research | interpreter vs JIT if exposed |
| rquickjs | bundle as native sidecar; map FS/net caps | research | GC limits, warmup |
| Hermes (static) | build static Hermes; run via CLI/sidecar | research | JIT off (static), GC tuning |
| porffor | follow https://porffor.dev setup; treat as experimental | research | warmup vs cold; WASM-only constraints |

Open loops:
- Add exact install scripts/links per runtime.
- Decide which runtimes run embedded vs spawned.
- Capture default vs tuned flag sets per runtime for apples-to-apples comparisons.
