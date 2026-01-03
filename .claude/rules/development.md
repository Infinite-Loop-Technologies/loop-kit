# Development Workflow Rules

## Rust Development

### Build Commands
```bash
cargo build                    # Build all crates
cargo build --release          # Release build
cargo run -p loop-cli          # Run CLI
cargo test                     # Run tests
cargo clippy                   # Lint
cargo fmt                      # Format
```

### Code Style
- Use `rustfmt` defaults (run `cargo fmt` before commits)
- Explicit error handling (prefer `anyhow::Result` for CLI, `thiserror` for libraries)
- Document public APIs with `///` doc comments
- Keep `unsafe` to minimum; document safety invariants when used

### Error Handling
```rust
// CLI/application level
use anyhow::{Context, Result};

fn do_thing() -> Result<()> {
    let file = File::open("config.toml")
        .context("Failed to open config")?;
    Ok(())
}

// Library level
use thiserror::Error;

#[derive(Error, Debug)]
pub enum MyError {
    #[error("Invalid config: {0}")]
    InvalidConfig(String),
}
```

### Project Structure
```
crates/
├── loop-runtime/          # Wasmtime host
│   ├── src/
│   │   ├── lib.rs
│   │   └── host/         # Host implementations
│   └── Cargo.toml
└── loop-cli/             # CLI tool
    ├── src/
    │   ├── main.rs
    │   └── commands/     # Subcommands
    └── Cargo.toml
```

## TypeScript Development

### Build Commands
```bash
pnpm install                           # Install deps
pnpm build                             # Build all packages
pnpm --filter @loop/cli dev            # Watch CLI
pnpm --filter @loop-kit/registry dev   # Watch registry
pnpm --filter registry dev             # Next.js dev server
pnpm --filter registry lint            # Lint site
```

### Code Style
- ESM modules only
- Strict TypeScript (no `any` without justification)
- Functional components and hooks for React
- Explicit return types for public APIs
- 2-space indents (align with existing)

### React Patterns
```typescript
// Functional components
export function MyComponent({ value }: Props) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    // side effects here
  }, [deps]);

  return <div>{value}</div>;
}

// Custom hooks
export function useCustomThing() {
  const [state, setState] = useState();
  return { state, update: setState };
}
```

### Module Organization
```
packages/
├── cli/
│   ├── src/
│   │   ├── index.ts      # Entry point
│   │   ├── commands/     # CLI commands
│   │   └── ui/           # Ink components
│   └── package.json
└── registry/
    ├── src/
    │   ├── index.ts      # Public API
    │   └── types.ts      # Shared types
    └── package.json
```

## WIT Development

### Validation Workflow
```bash
# After any WIT change
wasm-tools component wit validate wit/loop-core/world.wit

# Validate all WIT files
find wit -name "*.wit" -exec wasm-tools component wit validate {} \;
```

### File Organization
```
wit/
├── loop-core/
│   └── world.wit         # Package: loop:core@0.1.0
├── loop-fx/
│   └── world.wit         # Package: loop:fx@0.1.0
├── deps/                 # External WIT (vendored or wit-deps)
│   └── wasi/
└── experimental/         # Unstable experiments
```

### Adding New Capabilities
1. Create directory: `wit/loop-newcap/`
2. Define package: `package loop:newcap@0.1.0;`
3. Define world with types inside
4. Validate: `wasm-tools component wit validate wit/loop-newcap/world.wit`
5. Document in knowledge/capabilities-runtime.md
6. Add to CLAUDE.md capabilities table

## Git Workflow

### Commit Style
Follow Conventional Commits:
```
feat(cli): add component scaffolding command
fix(runtime): correct window event handling
docs: update WIT syntax rules
chore(deps): bump wasmtime to 15.0
refactor(fx): simplify node reconciliation
test(cli): add integration tests for new command
```

Scope examples: `cli`, `runtime`, `fx`, `ui`, `window`, `deps`, `site`

### Branch Naming
- Feature: `feature/description`
- Fix: `fix/description`
- Refactor: `refactor/description`
- Current: `refactor/fix-the-fucking-registry`

### Before Committing
```bash
# Rust
cargo fmt
cargo clippy
cargo test

# TypeScript
pnpm build
pnpm --filter registry lint   # if changed site

# WIT
wasm-tools component wit validate wit/*/world.wit
```

## Pull Requests

### PR Description Template
```markdown
## Summary
[Concise description of changes]

## Changes
- Added X
- Fixed Y
- Updated Z

## Testing
- [ ] Manual testing completed
- [ ] Relevant commands verified
- [ ] WIT validation passes

## Notes
[Environment variables, migration steps, etc.]
```

### Screenshots
Include for UI-visible changes (site, CLI output)

## File Operations

### Creating Files
- **AVOID creating files unless necessary**
- Prefer editing existing files
- Don't create markdown docs unless explicitly requested
- Templates for new components/hosts are exceptions

### Editing Files
- Always read file first before editing
- Preserve existing style (indentation, formatting)
- Match existing patterns in the file
- Run relevant linter/formatter after

### Deleting Files
- Ensure no imports/references remain
- Update related documentation
- Clean up related test files

## Dependency Management

### Rust Dependencies
```toml
# Cargo.toml - prefer exact versions for tools
wasmtime = "15.0"
anyhow = "1.0"

# Use workspace dependencies when available
[workspace.dependencies]
```

### TypeScript Dependencies
```bash
# Add to specific package
pnpm --filter @loop/cli add some-package

# Add to workspace root (dev dependencies)
pnpm add -D -w some-dev-tool
```

### WIT Dependencies
- Use `wit-deps` for external WIT packages
- Vendor critical dependencies in `wit/deps/`
- Document source and version

## Testing

### Rust Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_thing() {
        assert_eq!(do_thing(), expected);
    }
}
```

### Manual Testing
Since automated tests are minimal:
1. Build: `cargo build` or `pnpm build`
2. Smoke test commands manually
3. Check console for warnings/errors
4. Verify expected behavior

### CLI Testing
```bash
# Build CLI
pnpm --filter @loop/cli build

# Test command
node packages/cli/dist/index.js --help
node packages/cli/dist/index.js component new test-comp
```

## What to Avoid

- Don't over-engineer simple features
- Don't add features beyond requirements
- Don't create abstractions for one-time use
- Don't add comments to code you didn't change
- Don't add error handling for impossible scenarios
- Don't make backwards-compatibility hacks
- Don't commit secrets or hand-edit lockfiles
- Don't touch wRPC/OCI/wasmCloud (backlogged)
