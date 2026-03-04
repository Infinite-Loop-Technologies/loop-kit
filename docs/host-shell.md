# Host Shell

`host-shell` is a reusable native shell scaffold for Loop products.

## Packages

- `packages/bridge`: JSON-RPC envelope schemas + named-pipe client helper.
- `crates/host-shell`: Rust named-pipe server with `host.ping`.
- `apps/shell-ui`: Vite app that pings host-shell through a dev proxy.

## Run Locally

```bash
pnpm run loop -- run dev:shell --cwd .
```

This runs:

- `cargo run -p host-shell`
- `pnpm --filter @loop-kit/shell-ui dev`

The default pipe is `\\.\pipe\loop-kit-host-shell` on Windows.

## Protocol

- Transport: newline-delimited JSON-RPC envelopes over named pipes.
- Supported method: `host.ping`.
- Response shape:
  - `type: "result"`
  - `result.message: "pong"`

## CEF Forward Path

This scaffold intentionally keeps naming generic (`host-shell`, `bridge`, `shell-ui`) so product-specific shells can reuse the same IPC and protocol surface without coupling to any one app.
