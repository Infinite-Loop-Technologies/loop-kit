# Workspace And Automation

## Purpose

A Loop workspace should feel like a place where projects build artifacts, install reusable units, configure providers, and run automation workflows through the same runtime model.

## Workspace Model

- A workspace contains packages or projects that compile into artifacts.
- Workspaces should be able to declare installed units, provider configuration, local overrides, and automation entrypoints.
- The host should understand enough about the workspace to watch for changes, resolve artifact references, and trigger useful rebuild or regeneration flows.

## Developer Ergonomics

- Make registry-backed units feel local through caching, generated wrappers, and clear reference syntax.
- Support TypeScript import workflows that can fetch artifacts and generate type-safe wrappers when that improves the developer experience.
- Prefer explicit generated files or reviewable caches over hidden magic.

## Automation Units

- Treat automation components as first-class artifacts that can be invoked directly through the CLI or host APIs.
- Build workflow units on top of the same standard surface used by other units instead of creating a disconnected automation subsystem.
- Support richer pipeline-style workflows, including software delivery and agentic operations, without hard-coding those flows into the host.

## Toolchains

- Toolchains and binary dependencies should fit through provider surfaces rather than ad hoc shell assumptions.
- Wrap tools such as Proto where that creates a stable capability surface for workflows.
- Use containers when a toolchain is platform-specific or operationally heavy.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/ref/loop-kit-fundamentals/index.md](index.md)
<!-- markdown-backlinks:end -->
