# @loop-kit/forge-api

Forge Fastify control-plane API foundation with Neon + Drizzle persistence seams.

## Includes

- Fastify app factory with plugin-based route registration
- WorkOS auth context seam and stub service wiring
- Polar projection and quota-enforcement placeholder interfaces
- Drizzle schema baseline and generated migrations
- Fastify `inject()` integration tests

## Local commands

- `pnpm --filter @loop-kit/forge-api dev`
- `pnpm --filter @loop-kit/forge-api build`
- `pnpm --filter @loop-kit/forge-api typecheck`
- `pnpm --filter @loop-kit/forge-api test`
- `pnpm --filter @loop-kit/forge-api db:generate`
- `pnpm --filter @loop-kit/forge-api db:check`
