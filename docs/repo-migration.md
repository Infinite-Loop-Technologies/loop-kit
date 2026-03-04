# Repo Migration Notes

This repository now runs on `pnpm + loop` orchestration with no Moon/Proto dependency.

## CI Baseline

GitHub Actions matrix:

- `ubuntu-latest`
- `windows-latest`

Steps:

1. `pnpm install --frozen-lockfile`
2. `pnpm run loop:smoke -- --cwd .`
3. `pnpm run loop -- ci --cwd .`

## Stable CLI Policy

- Default entrypoint is the pinned published CLI (`tools/release/loop-cli-stable.json`).
- Dev CLI stays explicit (`pnpm run loop:dev -- <args>`).
- If pinned stable lacks a newly introduced command, stable runner falls back to dev CLI with a warning.
