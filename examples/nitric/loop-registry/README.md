# loop-kit Nitric Registry Example

This example provides a small registry API for loop-kit artifacts:

- `component`
- `module`
- `bundle`

Endpoints:

- `GET /health`
- `GET /registry`
- `GET /registry/:kind`
- `POST /registry/:kind/:name/:version`

Example writes are in-memory by design so the service is easy to run locally and extend.

## Local commands

```bash
npm install
nitric run
```

Register an artifact:

```bash
curl -X POST http://localhost:4001/registry/component/button/1.0.0
```

List artifacts:

```bash
curl http://localhost:4001/registry
```

## Deploy commands

Run these from the repo root through Dagger:

```bash
pnpm run nitric:registry:build
pnpm run nitric:registry:deploy -- --stack gcp-main --env-file .env.registry
```
