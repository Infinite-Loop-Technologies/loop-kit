# Tools

`tools/` is for small Bun-first repo automation.

Rules for this folder:

- keep scripts flat and obvious
- use plain `bun tools/<name>.ts`
- prefer `Bun.$`, `Bun.spawn`, `Bun.file`, and `Bun.write` over Node wrappers
- avoid `src/`, nested script packages, and generator scaffolding
- only split by domain when the flat layout stops being readable

Current entry points:

- `utils.ts`: shared Bun-first helpers for repo scripts
- `publish-packages.ts`: Bun-native release helper with interactive wizard, aligned version bumps, and CI-safe non-interactive flags

Examples:

- `bun run ./tools/publish-packages`
- `bun run ./tools/publish-packages publish --non-interactive --package all --tag latest`
- `bun run ./tools/publish-packages bump minor --non-interactive`
- `bun run ./tools/publish-packages release minor --non-interactive --package volt --tag next --dry-run`
