# @loop-kit/dock

Dock state, layout, and interaction helpers used by the current Loop Kit
workbench demos.

## What Lives Here

- graph-shaped dock state builders
- dock intent registration on top of `@loop-kit/graphite`
- layout rectangle computation
- drop indicator helpers
- interaction controller for panel drag and resize flows

## How To Use

```ts
import {
    createDockIntentNames,
    createDockPanelQuery,
    createDockState,
    registerDockIntents,
} from '@loop-kit/dock';
```

`@loop-kit/loom-pack-dock` is the main high-level consumer of this package today.

## Commands

- `bun --filter @loop-kit/dock run typecheck`
- `bun --filter @loop-kit/dock run test`
- `bun --filter @loop-kit/dock run build`
