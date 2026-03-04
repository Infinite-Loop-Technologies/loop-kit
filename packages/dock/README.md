# @loop-kit/dock

Reference docking implementation built on Graphite runtime idioms.

## Concepts

- Intent model nodes: `dock.root`, `dock.group`, `dock.tab`, `dock.panel`.
- Ordered relations:
  - `dock.tabs` (`group -> tabs`)
  - `dock.childGroups` (`root/group -> child groups`)
- Dock validator (`validateDock`) normalizes inconsistent intent into:
  - normalized logical groups/tabs
  - layout IR
  - preview state (from overlay intent)
  - diagnostics (invalid active tabs, cycles, invalid splits)
- Drag recognizer (`dock.dragTab`) writes semantic preview overlay patches during move and commits durable move/split patches on pointer up.
- Geometry and hit-test data stay ephemeral in `DockLayoutCache`, not in intent.

## How To Use

```tsx
import { GraphiteRuntime, asScopeId } from '@loop-kit/graphite-core';
import { GraphiteProvider } from '@loop-kit/graphite-react';
import { DockView, registerDockFacet } from '@loop-kit/dock';

const runtime = new GraphiteRuntime({ enableHistory: true });
registerDockFacet(runtime);

export function DockApp() {
    return (
        <GraphiteProvider runtime={runtime} scopeId={asScopeId('dock')}>
            <DockView />
        </GraphiteProvider>
    );
}
```

## How Dock Demonstrates Graphite

- `IntentStore` stores only semantic dock structure.
- `OverlayLayer` previews drag targets without durable writes.
- `Validators` produce a stable `StateView` for rendering and diagnostics.
- `InteractionRuntime` + arena manages recognizer capture/conflict.
- `History` boundaries are used for docking commits so undo/redo works.

## Add A New Facet/System

1. Add schema constants and patch builders in `src/facet/`.
2. Extend validator output (`DockStateSlice`) and diagnostics.
3. Update `layoutCache` + recognizers for new gesture semantics.
4. Keep transient behavior in overlay patches and finalize with intent commits.

## Commands

- `pnpm --filter @loop-kit/dock run typecheck`
- `pnpm --filter @loop-kit/dock run test`
- `pnpm --filter @loop-kit/dock run build`
