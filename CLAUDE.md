# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is loop-kit?

loop-kit is a software development toolkit, primarily focused on JS/TS today with plans to expand to more languages. The current active work is:

1. **`packages/graphite`** — a published reactive graph state library (`@loop-kit/graphite`)
2. **`packages/site`** — a shadcn-style UI component library (informally called "the component library" or "the shadcn registry") built with Next.js, powered by Graphite

Future planned work (in rough priority order):
- **Capability/host system** — secure capability granting to sandboxed modules, with a browser host as the first target. Graphite will be treated as a capability itself. Modules are granted capabilities explicitly, with careful permission control.
- **loop-kit CLI** — a new CLI (the old one was removed; a better one is planned)
- **loop-kit registry** — a first-party registry that may eventually replace the shadcn registry currently in use
- **loop-cloud** — self-hostable infrastructure (with a monetized hosted offering) for running loop-kit modules as long-running servers, a sync server for Graphite, and more
- **AI agent integration** — an AI agent that works natively with loop-kit: hot-reloading modules, working on modules in parallel, testing, simulating capability providers, MCP servers, etc.
- **WASM sandboxing** — on hold; simpler sandboxing approaches are being explored first

## Commands

**Root workspace:**
```bash
pnpm build          # Build all packages
pnpm release:patch  # Bump patch version + publish all packages
pnpm release:minor  # Bump minor version + publish all packages
```

**Component library / site (`packages/site`):**
```bash
pnpm --filter @loop-kit/site dev              # Next.js dev server (Turbopack)
pnpm --filter @loop-kit/site build            # Build registry then Next.js
pnpm --filter @loop-kit/site lint             # ESLint
pnpm --filter @loop-kit/site registry:build   # Build shadcn component registry
```

**Graphite (`packages/graphite`):**
```bash
pnpm --filter @loop-kit/graphite build        # tsc compile to dist/
pnpm --filter @loop-kit/graphite typecheck    # Type check without emit
```

## Architecture

pnpm monorepo (`pnpm-workspace.yaml`) with two active TypeScript packages.

### `packages/graphite` — `@loop-kit/graphite`

Published npm library. A reactive graph runtime with an intent→patch→commit mutation pipeline.

- **`core.ts`** — `GraphiteRuntime`: main class, node graph, mutation processing, undo/redo history
- **`dsl.ts`** — patch operators: `$set`, `$merge`, `$delete`, `$move`, `$link`, `$unlink`
- **`types.ts`** — all TypeScript types
- **`react.tsx`** — hooks: `useQuery`, `useCommit`, `useIntent`, `useHistory`; debug components: `GraphiteInspector`, `GraphiteIntentBrowser`
- **`connectors.ts`** — HTTP polling and WebSocket connectors
- **`persistence.ts`** — localStorage adapters

### `packages/site` — UI component library

A Next.js 15 App Router site deployed to Vercel. This is a shadcn-style component library — components live in the `registry/` directory and are published as a shadcn registry. Graphite powers much of the interactive functionality.

- **`registry/`** — component and block definitions built via `shadcn build`. **Blocks** are full demo compositions (similar to blocks on shadcn's own registry).
- **`app/`** — App Router pages: `docs/`, `playground/`, `embed/`, `api/`
- **`content/docs/`** — MDX documentation source files
- **`components/`** — site-specific React components
- **`hooks/`** and **`lib/`** — shared utilities

The site references `@loop-kit/graphite` locally via a TypeScript path alias.

## Tech Stack Highlights

- **Next.js 15** with Turbopack, React 19, App Router
- **Tailwind CSS 4**, shadcn/ui (new-york style), Radix UI, Lucide icons
- **Dockview** for multi-panel workbench layouts
- **CodeMirror 6**, **TipTap 3**, **BlockNote** for editor components
- **Vercel AI SDK** + **v0 SDK** for generative UI features
- **React Flow** for node graph visualization
- **Three.js** / WebGPU (`@use-gpu/*`) for 3D/GPU rendering
- **Zustand** + **Immer** for state management in the site
- **xterm.js** + **WebContainer** for the interactive playground terminal

## CI/CD

- `.github/workflows/vercel-site.yml` — deploys `packages/site` to Vercel on push
- `.github/workflows/publish-graphite.yml` — publishes `@loop-kit/graphite` to npm (manual trigger, supports dry-run)
