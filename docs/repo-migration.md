# Repo Migration Notes

This repository now runs on `pnpm + loop` orchestration with no Moon/Proto dependency.

## CI Baseline

GitHub Actions matrix:

- `ubuntu-latest`
- `windows-latest`

Steps:

1. `pnpm install --frozen-lockfile`
2. `pnpm run loop:smoke --cwd .`
3. `pnpm run ci`

## Stable CLI Policy

- Default entrypoint is the pinned published CLI via `pnpm run loop <args>`.
- Stable pin is defined once in `package.json` (`scripts.loop:stable`).
- Dev CLI stays explicit (`pnpm run loop:dev <args>`).
- This keeps dogfooding on a known-good release while preserving an explicit escape hatch to dev CLI when stable is behind.
- Core `run/ci` task scripts (`pnpm run build|typecheck|test|ci`) currently route through explicit dev CLI.
