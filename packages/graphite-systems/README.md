# @loop-kit/graphite-systems

Reusable facet modules and action registry for Graphite runtime hosts.

## Concepts

- `ActionRegistry`: register/invoke action IDs with `when` predicates and `run` handlers.
- Facets are plain modules with:
  - schema constants
  - helper queries
  - patch builders
  - validators (`slice + diagnostics`)
  - optional policy helpers
- Included facet modules:
  - `editing` with `edit.delete` (trait-routed).
  - `docking` skeleton (shared constants + helpers used by dock package).

## How To Use

```ts
import { ActionRegistry, editingFacet } from '@loop-kit/graphite-systems';

const actions = new ActionRegistry();
editingFacet.registerEditingActions(actions);
```

## How Dock Demonstrates It

`@loop-kit/dock` consumes Graphite idioms end-to-end and can share schema/policy conventions with system facets. The docking skeleton in this package intentionally stays lightweight while full behavior lives in the dock package.

## Add A New Facet/System

1. Create a new folder under `src/facets/<name>/`.
2. Add `schema.ts`, `queries.ts`, `patchBuilders.ts`, and `validate.ts`.
3. Export the facet from `src/facets/index.ts`.
4. Register actions in `ActionRegistry` if keyboard/palette dispatch is needed.

## Commands

- `pnpm --filter @loop-kit/graphite-systems run typecheck`
- `pnpm --filter @loop-kit/graphite-systems run build`
