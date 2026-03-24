# Standard Surface And WIT

## Purpose

The loop-kit standard surface should be a family of WIT packages, interfaces, and worlds that let independently-built units interoperate without collapsing back into one giant runtime crate or package.

## Authoring Rules

- Prefer small WIT packages with clear ownership over one omnibus package.
- Prefer focused interfaces and worlds that describe a coherent capability surface.
- Keep imports and exports explicit; avoid hidden ambient behavior.
- Design for adapters from the start so native libraries, executables, and containers can participate without pretending to be something they are not.

## First Package Families

The first standard-surface wave should likely cover:

- registry discovery, fetch, publish, and artifact metadata
- runtime invocation and command-style execution
- grants, permissions, and capability requests
- workspace/project inspection and installation
- automation/workflow execution
- binding-generation and type-description helpers

## World Design Guidance

- Use command-like worlds for units that feel like tools or automation steps.
- Use provider worlds for host-managed capability implementations.
- Use data-only interfaces for shared value types and descriptor vocabularies.
- Keep extension packages separate from the minimum core surface so compatibility remains tractable.

## Tooling Expectations

The rewrite should establish a WIT workflow that covers:

- formatting and linting
- compatibility and breaking-change checks
- package naming and directory conventions
- TypeScript and Rust binding generation
- validation for component export/import discipline

## Practical Constraints

- Some surfaces will need native or host-only providers at first; model those as explicit provider contracts instead of poking holes in the boundary model.
- Do not let convenience codegen dictate the architecture. The standard surface should reflect durable capability seams, not temporary SDK gaps.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/next-actions/active/010-standard-surface-wit-package-map.md](../../next-actions/active/010-standard-surface-wit-package-map.md)
- [docs/next-actions/active/011-wit-tooling-and-linting.md](../../next-actions/active/011-wit-tooling-and-linting.md)
- [docs/next-actions/active/014-component-provider-composition.md](../../next-actions/active/014-component-provider-composition.md)
- [docs/next-actions/active/017-typescript-importer-and-bindings.md](../../next-actions/active/017-typescript-importer-and-bindings.md)
- [docs/next-actions/active/018-artifact-builders-and-toolchains.md](../../next-actions/active/018-artifact-builders-and-toolchains.md)
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- [docs/ref/loop-kit-fundamentals/index.md](index.md)
<!-- markdown-backlinks:end -->
