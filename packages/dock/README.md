# @loop-kit/dock

Headless docking layout engine on top of Graphite.

`dock` is split into a few focused pieces:
- Structural model: canonical tree + strict normalization rules
- Intents: semantic mutations registered on Graphite
- Geometry: pure layout + hit-testing math
- Interaction: pointer/drag state machine that emits intents
- Debug DOM renderer + overlay helpers for rapid inspection

## Quick Start

```ts
import { createGraphStore } from '@loop-kit/graphite';
import {
  createDockStateFromPanels,
  registerDockIntents,
  createDockIntentNames,
} from '@loop-kit/dock';

const store = createGraphStore({
  initialState: {
    dock: createDockStateFromPanels([
      { id: 'panel-a', title: 'Panel A' },
      { id: 'panel-b', title: 'Panel B' },
    ]),
  },
});

registerDockIntents(store, { path: ['dock'], intentPrefix: 'dock' });
const intents = createDockIntentNames('dock');

store.dispatchIntent(intents.addPanel, { title: 'Panel C' }, { history: 'dock' });
```

## Main Public APIs

- `createDockState` / `createDockStateFromPanels`: create canonical dock state.
- `migrateDockState` / `normalizeDock`: migrate and enforce structural invariants.
- `reduceDockIntent`: apply one semantic action in-memory.
- `registerDockIntents`: wire dock domain intents to a Graphite store.
- `computeLayoutRects` / `hitTest`: pure geometry + drop targeting.
- `createDockInteractionController`: drag/resize session machine emitting intents.
- `createDockDebugRenderer`: DOM renderer with resize and drop overlays.

## Demo

`packages/dock-demo` contains a React + Vite playground using this package end-to-end.

## Build

`@loop-kit/dock` uses a lightweight `tsx`-driven build script:

- `pnpm --filter @loop-kit/dock typecheck`
- `pnpm --filter @loop-kit/dock build`
