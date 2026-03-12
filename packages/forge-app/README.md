# @loop-kit/forge-app

Shared Forge frontend shell package for loop-kit.

## What lives here

- The shared route table and lightweight navigation abstraction.
- The reusable Forge shell layout and placeholder route views.
- The panel-host stub that both web and desktop shells mount.

## Current consumers

- `apps/forge-web`
- `apps/forge-desktop`

## Local commands

- `pnpm --filter @loop-kit/forge-app typecheck`
- `pnpm --filter @loop-kit/forge-app test`
