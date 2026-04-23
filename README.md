# Dockyard

Dockyard is a Bun monorepo for a registry-driven Dock ecosystem. It keeps stable package boundaries small, pushes app-facing installable code into a local registry, and ships a Next.js site that documents and exposes those items.

## Why It Exists

Dock needs two different distribution modes:

- Stable reusable packages for headless logic and thin framework bridges.
- Installable source items for app-facing UI, wiring, and policy that should stay editable in downstream apps.

Dockyard is organized around that split from day one.

## Repo Structure

```text
apps/
  registry/       Next.js registry, docs, and local registry endpoints
packages/
  common/         Small shared primitives
  common-react/   React adapters for foundational primitives
  interaction-core/ Headless target and signal runtime
  interaction-react/ React bridge for interaction-core
  dock/           Stable headless dock boundary
  dock-react/     Thin React bridge for dock
registry/
  items/          Installable source items and demos
  manifests/      Registry manifests and generated-facing metadata
tools/
  scripts/        Small repo scripts
```

## Packages vs Registry Items

- Packages are for stable reusable engines, types, helpers, and boundaries.
- Registry items are installable source code meant to be copied, edited, and adapted.
- Most user-facing Dock UI belongs in `registry/items`, not in `packages/dock` or `packages/dock-react`.
- Services can live in either place:
  - package: when the behavior is foundational and stable
  - registry item: when the behavior is app-specific wiring, policy, or UI glue

## Near-Term Focus

- Keep `dock` headless and portable.
- Keep `dock-react` thin.
- Keep `interaction-*` runtime-first and React-thin.
- Build useful installable Dock source items.
- Use the registry site as the source of truth for docs and source display.

## Local Development

```bash
bun install
bun run dev
```

The registry site runs from `apps/registry`.

## Build And Check

```bash
bun run build
bun run typecheck
bun run check
```

## Roadmap

- Add more registry items across Dock, integrations, and automations.
- Expose a fuller shadcn-compatible registry surface from the site.
- Start porting concrete Dock UI building blocks into installable source items.
- Expand examples once the package boundaries settle.
