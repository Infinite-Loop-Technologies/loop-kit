# Testing Guidelines

## Current Testing State

**No dedicated automated test suite yet.** Rely on:
1. Linters (`cargo clippy`, `pnpm lint`)
2. Type checking (`cargo check`, TypeScript compiler)
3. Manual verification
4. WIT validation

## Manual Testing Workflow

### Rust Changes
```bash
# Build
cargo build

# Check for warnings
cargo clippy

# Format
cargo fmt --check

# Run any existing tests
cargo test

# Smoke test CLI
cargo run -p loop-cli -- --help
cargo run -p loop-cli -- component new test-comp
```

### TypeScript Changes

#### CLI
```bash
# Build
pnpm --filter @loop/cli build

# Test commands
node packages/cli/dist/index.js --help
node packages/cli/dist/index.js component new test-component
```

#### Registry Library
```bash
# Build
pnpm --filter @loop-kit/registry build

# Check types
pnpm --filter @loop-kit/registry typecheck
```

#### Site
```bash
# Start dev server
pnpm --filter registry dev

# Manual testing checklist:
# - Forms submit correctly
# - Drag-and-drop works
# - Editor interactions respond
# - Check console for warnings
# - Test key user flows

# Lint
pnpm --filter registry lint
```

### WIT Changes
```bash
# Validate single file
wasm-tools component wit validate wit/loop-core/world.wit

# Validate all WIT files
find wit -name "*.wit" -type f -exec wasm-tools component wit validate {} \;

# On Windows PowerShell:
Get-ChildItem -Path wit -Filter *.wit -Recurse | ForEach-Object { wasm-tools component wit validate $_.FullName }
```

## Adding Tests (Future)

### Rust Test Structure
Co-locate tests with source using `#[cfg(test)]` modules:

```rust
// src/my_module.rs

pub fn do_thing(x: u32) -> u32 {
    x * 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_do_thing() {
        assert_eq!(do_thing(5), 10);
    }

    #[test]
    fn test_edge_case() {
        assert_eq!(do_thing(0), 0);
    }
}
```

Integration tests in `tests/` directory:
```rust
// tests/integration_test.rs

use loop_cli::commands;

#[test]
fn test_component_creation() {
    // Integration test
}
```

### TypeScript Test Structure
Use `.test.ts` or `.test.tsx` naming:

```typescript
// src/utils.test.ts
import { describe, it, expect } from 'vitest';
import { myUtil } from './utils';

describe('myUtil', () => {
  it('should do the thing', () => {
    expect(myUtil(5)).toBe(10);
  });
});
```

Prefer lightweight runners:
- Vitest for utilities and libraries
- Jest if already in use
- React Testing Library for components

### Component Testing
Example for WASM component testing (future):

```rust
// tests/component_test.rs
use wasmtime::{Engine, Store};
use loop_runtime::host::ComponentHost;

#[test]
fn test_component_logging() {
    let engine = Engine::default();
    let mut store = Store::new(&engine, ());
    let host = ComponentHost::new();

    // Load and test component
    // Verify logging calls
}
```

## Verification Checklist

### Before Committing
- [ ] Code builds without errors
- [ ] Linters pass (clippy, eslint)
- [ ] Formatters applied (rustfmt, prettier)
- [ ] WIT files validate
- [ ] Manual smoke test of changed functionality
- [ ] No console errors in browser (for site changes)
- [ ] Git status clean (no unintended files)

### Before Pull Request
- [ ] All build commands succeed: `cargo build`, `pnpm build`
- [ ] Package-specific lints pass
- [ ] Changes manually tested in relevant environment
- [ ] Documentation updated if needed
- [ ] Commit messages follow convention
- [ ] No secrets or sensitive data committed

## Testing Principles

### What to Test
- Public API surface
- Error conditions
- Edge cases (empty input, max values, etc.)
- Integration points between components
- CLI command outputs and exit codes

### What NOT to Test
- Implementation details
- Third-party library behavior
- Trivial getters/setters
- Auto-generated code

### Test Quality
- Tests should be deterministic (no flaky tests)
- Fast execution (avoid unnecessary sleeps)
- Clear assertions with good error messages
- Isolated (don't depend on other tests)
- Readable (test name describes what it tests)

## Example Test Scenarios

### CLI Command Testing
```rust
#[test]
fn test_component_new_creates_files() {
    // Setup temp directory
    // Run command
    // Assert files exist
    // Assert content is correct
}
```

### Component Host Testing
```rust
#[test]
fn test_host_loads_component() {
    // Create test component
    // Initialize host
    // Load component
    // Verify capabilities wired correctly
}
```

### WIT Binding Testing
```rust
#[test]
fn test_wit_generated_bindings() {
    // Use generated bindings
    // Call exported functions
    // Verify types match
}
```

## Benchmarking

See `benchmarks/README.md` for benchmark plan and `benchmarks/runtime-matrix.md` for runtime setup.

Future benchmark areas:
- Component load time
- Effect system reconciliation performance
- Provider call overhead
- Serialization/deserialization costs

## Continuous Integration (Future)

Planned CI checks:
- `cargo build --release`
- `cargo test`
- `cargo clippy -- -D warnings`
- `pnpm build`
- `pnpm lint`
- WIT validation for all files
- Integration test suite
