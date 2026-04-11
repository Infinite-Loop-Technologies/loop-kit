# loop-kit

`loop-kit` is a Bun-first prototype monorepo for capability-oriented UI/runtime systems and the products built on top of them, especially Forge, Dock, Loom, Volt, and a small platform API.

## Current Repo Shape

- `apps/forge`
  - the main product-facing prototype
  - currently mid-rebuild around auth, workspace bootstrap, and cleaner feature boundaries
- `apps/dock-demo`
  - the proving ground for dock behavior, drag/drop, layers, and policy boundaries
- `apps/loom-demo`
  - Loom-focused demo surface
- `apps/platform-api`
  - Nitro/Fastify service for auth/workflow experiments and future backend work
- `apps/volt-demo`, `apps/volt-site`, `apps/volt-jco-demo`
  - Volt proof surfaces and narrative/demo apps
- `packages/interaction` and `packages/interaction-react`
  - shared interaction runtime plus React bridge
- `packages/dock` and `packages/loom-pack-dock`
  - headless dock behavior plus the Loom/React bridge
- `packages/loom-*`
  - Loom renderer, contracts, themes, and packs
- `packages/volt` and `packages/create-volt`
  - Bun-native runtime-topology/workflow tooling and scaffolding
- `examples/`
  - extracted example material that does not belong in the main app/package tree
- `experiments/`
  - smaller prototype labs and notes
- `tools/`
  - lightweight Bun scripts for repo automation

## Runtime And Tooling

- Bun is the default runtime for scripts, tests, and workspace commands.
- Proto stays in place to pin tool versions.
- Most UI apps use Volt via app-local `volt.config.ts` files.
- The root `volt.workspace.ts` currently coordinates the Forge app plus the Volt demo and site surfaces.
- `apps/dock-demo`, `apps/loom-demo`, and `apps/platform-api` currently run outside the root Volt workspace topology.

## Quickstart

```powershell
proto install --yes
bun install
bun run ci
```

## Common Commands

```bash
bun run forge:dev
bun run dock:dev
bun run loom:dev
bun run platform:dev
bun run volt:demo:dev
bun run volt:site:dev
bun run volt:jco-demo:dev
bun run build
bun run typecheck
bun run test
bun run ci
bun run workspaces:list
```

## Control Plane

Repo knowledge and work tracking live in:

- `CHECKLIST.md`
  - durable tasks, slices, blockers, and follow-ups
- `AGENT_INBOX.md`
  - temporary captures, ideas, and open loops for future agent work
- `HUMAN_INBOX.md`
  - explicit setup asks, decisions, and other human-owned next actions
- `ARCHITECTURE.md`
  - repo map and non-negotiable architectural direction
- `references/`
  - durable support docs with descriptive filenames
- `references/codex-automation-prompts.md`
  - reusable prompts for sweeps, reviews, inbox triage, and autonomous work

When working in this repo, scan inboxes, the relevant checklist sections, and `references/` filenames before guessing.

## Useful Starting Docs

- `ARCHITECTURE.md`
- `references/project-volt-overview.md`
- `references/project-volt-project-model.md`
- `references/forge-app-structure.md`
- `references/dock-integration.md`
- `references/interaction-runtime.md`

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
