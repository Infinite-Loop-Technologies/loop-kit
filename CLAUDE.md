# Claude Code Guide for loop-kit

loop-kit is an experimental full-stack toolkit for composing apps and games from WASM-centric components, incremental effect systems, and capability-driven hosts.

## Project Philosophy

- **Components-first**: WASM components are the default unit; native is an escape hatch when needed
- **Capability-driven**: WASI baseline + rich caps (UI/GPU/storage/net) via pluggable providers
- **Incremental effects**: React-like reconciliation via `loop:fx` with deterministic scheduling
- **Tooling as code**: workspaces ship their own CLIs/editors; loop-kit provides SDKs and bootstrap tools
- **Expert audience**: terse communication, avoid restating obvious context

## Current Architecture

### Monorepo Structure
- **TypeScript workspace** (pnpm): CLI, registry library, Next.js site
- **Rust runtime** (crates/): Wasmtime host (`loop-runtime`), CLI tools (`loop-cli`)
- **WIT definitions** (wit/): Component interfaces and capability namespaces
- **Knowledge base** (knowledge/): Research notes and design docs

### Key Directories
```
loop-kit/
├── crates/
│   ├── loop-runtime/     # Wasmtime host implementation
│   └── loop-cli/         # Rust CLI (replacing TS CLI)
├── packages/
│   ├── cli/              # Legacy TypeScript CLI
│   ├── registry/         # Shared registry library
│   └── site/             # Next.js registry UI
├── wit/
│   ├── loop-core/        # logging, cancellation, timers
│   ├── loop-fx/          # effect/fiber runtime
│   ├── loop-ui/          # UI IR (layout trees)
│   ├── loop-window/      # windowing/input
│   ├── loop-pkg/         # package resolution
│   └── loop-devserver/   # workspace tooling
├── knowledge/            # Design docs and research
└── .claude/             # Claude Code rules

```

## Development Commands

### Rust workspace
```bash
cargo build              # Build all crates
cargo run -p loop-cli    # Run CLI
cargo test               # Run tests
```

### TypeScript workspace
```bash
pnpm install             # Install deps
pnpm build               # Build all packages
pnpm --filter @loop/cli dev          # Watch CLI
pnpm --filter @loop-kit/registry dev # Watch registry lib
pnpm --filter registry dev           # Run Next.js dev server
```

## Capability Namespaces

| Namespace | Purpose |
|-----------|---------|
| `loop:core` | Logging, timers, randomness, cancellation |
| `loop:fx` | Effect/fiber runtime, reconciliation |
| `loop:ui` | High-level UI IR (block/inline/flex/text) |
| `loop:window` | Windowing, input, surfaces |
| `loop:gfx` | GPU/WebGPU abstraction |
| `loop:pkg` | Package resolution, artifact fetch |
| `loop:devserver` | Workspace graph, component loader |

See `.claude/rules/capabilities.md` for details.

## WIT Usage

WIT (WebAssembly Interface Type) files define component interfaces. **Syntax is strict** - see `.claude/rules/wit-syntax.md` for detailed rules.

Key principles:
- Place types/records inside worlds or interfaces (no package-level loose types)
- Import existing packages with `use package:name@version`
- Validate early: `wasm-tools component wit validate wit/path/to/file.wit`
- Reuse WASI packages when possible (clocks, filesystem, http, cli)

## Knowledge Base

Critical reading (knowledge/):
- `wit-notes.md` - WIT hygiene and composition patterns
- `capabilities-runtime.md` - Capability system design
- `effect-system.md` - Incremental effects (loop:fx)
- `wasm-tooling.md` - Toolchain cheatsheet

## Near-Term Focus

1. Rust Wasmtime host CLI for running local WASM components
2. Example components in `examples/` (logging, FS, HTTP, UI)
3. CLI scaffolding (`loop component new`, `loop host new`)
4. Local packaging flow (defer OCI/wRPC until host loop is stable)

## Coding Standards

- **Rust**: std formatting, explicit error handling, prefer `anyhow` for CLI errors
- **TypeScript**: ESM modules, strict types, functional components
- **WIT**: See `.claude/rules/wit-syntax.md` for detailed syntax rules
- **Commits**: Conventional style (`feat(cli):`, `fix(runtime):`, `docs:`)

## What NOT to Do

- Don't add features beyond requirements (no over-engineering)
- Don't create documentation files unless explicitly requested
- Don't commit secrets or hand-edit lockfiles
- Don't make wRPC/OCI/wasmCloud changes (backlogged until local host is stable)
- Don't add types at package level in WIT (must be in world/interface)

## Rules Reference

Detailed rules in `.claude/rules/`:
- `architecture.md` - Core design principles
- `wit-syntax.md` - WIT syntax and validation
- `capabilities.md` - Capability system details
- `development.md` - Workflow and conventions
- `testing.md` - Testing guidelines
