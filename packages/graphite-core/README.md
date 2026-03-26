# @loop-kit/graphite-core

Graphite runtime kernel for intent graphs, overlay previews, validation, interaction, history, and effects.

## Concepts

- `IntentStore`: durable graph with schema-light node/edge/prop data.
- `OverlayLayer`: per-scope ephemeral patch stack for previews; easy to clear.
- `Patch` and `Commit`: invertible low-level ops applied atomically with version bumps.
- `QueryEngine`: dependency-captured reactive queries with touched-key invalidation.
- `Validators` and `StateView`: deterministic intent snapshot transforms into derived slices + diagnostics.
- `InteractionRuntime`: recognizer arena, capture, hit-testing, and ephemeral session state.
- Optional `History`, `EventLog`, `EffectRunner`, and instrumentation (`GraphiteMetrics`).

## How To Use

```ts
import { GraphiteRuntime, asNodeId, asScopeId } from '@loop-kit/graphite-core';

const runtime = new GraphiteRuntime({
    enableHistory: true,
    enableEventLog: true,
    validateMode: 'lazy',
});

runtime.registerValidator('my.facet', (snapshot) => ({
    slice: { nodes: snapshot.listNodeIds() },
    diagnostics: [],
}));

const scope = runtime.getScope(asScopeId('main'));
scope.commitIntentPatch({
    ops: [{ kind: 'setProp', nodeId: asNodeId('n1'), key: 'label', value: 'Node 1' }],
});
```

## How Dock Demonstrates It

`@loop-kit/dock` uses:

- `IntentStore` for dock root/group/tab nodes.
- `OverlayLayer` for drag/drop preview intent.
- `Validator` -> `StateView` for normalized dock tree, layout IR, and diagnostics.
- `InteractionRuntime` + recognizer arena for drag gestures.
- `History` boundaries for undo/redo on docking commits.

## Add A New Facet/System

1. Define schema constants and patch builders in a separate package/module.
2. Implement a validator `(snapshot) => { slice, diagnostics }`.
3. Register it with `runtime.registerValidator('facet.name', validator)`.
4. Optionally register actions/effects that commit patches with explicit `meta.origin`.

## Commands

- `pnpm --filter @loop-kit/graphite-core run typecheck`
- `pnpm --filter @loop-kit/graphite-core run test`
- `pnpm --filter @loop-kit/graphite-core run bench`
- `pnpm --filter @loop-kit/graphite-core run build`
