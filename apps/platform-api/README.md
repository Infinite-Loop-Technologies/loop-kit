# `@loop-kit/platform-api`

Fastify-based platform API for loop-kit.

Current scope:

- Nitro-powered Fastify entrypoint for local dev and future deployment
- Clerk wired for Fastify route protection
- Workflow DevKit demo route and status endpoint

Local development:

```bash
bun install
bun run --cwd apps/platform-api dev
```

Trigger the demo workflow:

```bash
curl -X POST --json "{\"email\":\"hello@example.com\"}" http://localhost:3000/api/workflows/demo-signup
```

Inspect workflow runs:

```bash
bun run --cwd apps/platform-api workflow:inspect
```
