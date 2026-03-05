# Codex

- Use `pnpm` and `loop` for all orchestration in this repo.
- Stable npm CLI is the default dogfooding path:
  - `pnpm run loop <args>`
  - `pnpm run loop:stable <args>`
- Stable CLI pin is defined once in `package.json`:
  - `scripts.loop:stable = pnpm dlx @loop-kit/loop-cli@0.1.0`
- Use workspace CLI only when explicitly testing in-flight changes:
  - `pnpm run loop:dev <args>`
- Version check:
  - `pnpm run loop:version`
- Why this avoids being stranded:
  - daily workflows use a known-good published CLI
  - if stable is behind or you need in-flight changes, switch explicitly to `pnpm run loop:dev <args>`
- Smoke check policy:
  - `pnpm run loop:smoke --cwd .`
  - stable doctor must pass, dev doctor is best-effort.
- Do not use Moon/Proto in this repository.
