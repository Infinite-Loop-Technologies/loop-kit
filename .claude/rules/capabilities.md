# Capability System Rules

## Namespace Organization

### loop:core (wit/loop-core/world.wit)
- **Purpose**: Baseline utilities - logging, timers, randomness, cancellation
- **Status**: Prototype WIT exists
- **Dependencies**: None (lowest level)
- **Usage**: All higher namespaces depend on loop:core

### loop:fx (wit/loop-fx/world.wit)
- **Purpose**: Effect/fiber runtime, reconciliation, scheduling
- **Status**: Prototype WIT exists
- **Key exports**: `graph`, `hooks`, `scheduler`, `yields`
- **Dependencies**: loop:core (for cancel-token)
- **Design**: See knowledge/effect-system.md

### loop:ui (wit/loop-ui/world.wit)
- **Purpose**: High-level UI IR - block/inline/flex/text/absolute/transform
- **Status**: Prototype WIT exists
- **Model**: Similar to usegpu-layout
- **Renderers**: Map to DOM/webview/native
- **Trust**: Safe IR with host-controlled rendering; raw DOM via loop:dom for trusted components

### loop:window (wit/loop-window/world.wit)
- **Purpose**: Windowing, input, surface management
- **Status**: Prototype WIT exists
- **Native**: Tao/winit
- **Browser**: DOM integration
- **Pairing**: Works with loop:ui for rendering

### loop:gfx
- **Purpose**: GPU/WebGPU surface/queues/buffers
- **Status**: Early design
- **Abstraction**: wgpu/WebGPU
- **Future**: Shared-memory plan, WASI gfx alignment

### loop:pkg (wit/loop-pkg/world.wit)
- **Purpose**: Package/artifact resolution, fetch, caching
- **Status**: Prototype WIT exists
- **Usage**: Component bundling, resolver plugins

### loop:devserver (wit/loop-devserver/world.wit)
- **Purpose**: Workspace graph, component/provider loader, command registry, watch graph
- **Status**: Prototype WIT exists
- **Implementation**: Default CLI impl is swappable via config

### loop:process
- **Purpose**: Caps-aware spawn/exec, stdio/env mapping
- **Status**: Design phase
- **Trust**: Trusted-only by default
- **Gating**: Requires explicit policy/signing

## WASI Integration

### Reuse Strategy
- Import WASI packages where possible:
  - `wasi:clocks/monotonic` - timing
  - `wasi:filesystem`, `wasi:filesystem-preopens` - file access
  - `wasi:http`, `wasi:sockets` - networking
  - `wasi:cli` - CLI/devserver components
- Compose WASI into `loop:*` worlds for SDK compatibility
- Use `use wasi:pkg@version` syntax for imports

### Dependency Direction
- loop:core → WASI (baseline only)
- loop:fx → loop:core
- loop:ui, loop:window, loop:gfx → loop:fx
- loop:devserver, loop:pkg → loop:core + loop:fx

## Trust Classes

### Untrusted (default)
- Sandboxed execution
- No process/spawn capabilities
- No raw DOM access
- File system via WASI preopens only
- Network via allowed hosts only

### Trusted
- Can spawn processes
- Can access raw DOM (via loop:dom)
- Extended filesystem access
- Requires explicit signing/configuration
- Registry metadata should encode trust requirements

## Provider Implementation

### Local Providers (current focus)
- In-process native shims
- Stdio/IPC sidecars for rapid prototyping
- Config-driven provider selection

### Remote Providers (backlog)
- wRPC transport
- wasmCloud integration
- OCI registry
- Defer until local host loop is stable

## Configuration

### Provider Selection
- Default: local stdio/in-process providers for dev server
- Override: configurable per workspace and per capability
- Platform detection: choose providers based on runtime environment
- Composition: platform-specific chains (e.g., macOS Touch Bar) behind stable interface
