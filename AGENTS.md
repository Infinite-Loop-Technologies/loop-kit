# Codex

- Use `pnpm` and `loop` for all orchestration in this repo.
- Default to the pinned published CLI:
  - `pnpm run loop -- <args>`
  - `pnpm run loop:stable -- <args>`
- Use workspace CLI only when explicitly testing in-flight changes:
  - `pnpm run loop:dev -- <args>`
- Stable CLI pin source:
  - `tools/release/loop-cli-stable.json`
- If pinned stable lacks `run/ci`, the stable runner falls back to `tools/release/run-loop-task-shim.mjs`.
- Smoke check policy:
  - `pnpm run loop:smoke -- --cwd .`
  - stable doctor must pass, dev doctor is best-effort.
- Do not use Moon/Proto in this repository.
