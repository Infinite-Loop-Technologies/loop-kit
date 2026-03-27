# Tools

`tools/` is for small Bun-first repo automation.

Rules for this folder:

- keep scripts flat and obvious
- use plain `bun tools/<name>.ts`
- prefer `Bun.$`, `Bun.spawn`, `Bun.file`, and `Bun.write` over Node wrappers
- avoid `src/`, nested script packages, and generator scaffolding
- only split by domain when the flat layout stops being readable

Current entry points:

- `workspace.ts`: runs workspace scripts in dependency order for root orchestration
