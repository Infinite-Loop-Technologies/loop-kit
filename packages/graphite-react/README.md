# @loop-kit/graphite-react

React projection layer for Graphite runtime scopes, queries, state slices, and recognizers.

## Concepts

- `GraphiteProvider`: injects runtime + scope context.
- `useQuery`: subscribes to `QueryEngine` and reruns only on touched deps.
- `useStateSlice`: reads validator-derived `StateView` slices.
- `useDispatch`: dispatches actions, commits intent patches, and manages overlay patches.
- `useRecognizer` + `InputBoundary`: modular high-frequency gesture routing into `InteractionRuntime`.

## How To Use

```tsx
import { GraphiteRuntime, asScopeId } from '@loop-kit/graphite-core';
import { GraphiteProvider, InputBoundary, useStateSlice } from '@loop-kit/graphite-react';

const runtime = new GraphiteRuntime();
const scopeId = asScopeId('main');

function View() {
    const dock = useStateSlice('dock');
    return <pre>{JSON.stringify(dock, null, 2)}</pre>;
}

export function App() {
    return (
        <GraphiteProvider runtime={runtime} scopeId={scopeId}>
            <InputBoundary>
                <View />
            </InputBoundary>
        </GraphiteProvider>
    );
}
```

## How Dock Demonstrates It

`@loop-kit/dock` uses these bindings directly:

- `DockView` renders from `useStateSlice(DOCK_FACET)`.
- `InputBoundary` streams pointer/key events to drag recognizers.
- `useRecognizer(createDragTabRecognizer())` registers docking interaction logic.

## Add A New Facet/System

1. Register your validator on the runtime.
2. Read the facet with `useStateSlice('facet.name')` or `useQuery(...)`.
3. Wire interaction commands through `useDispatch`.
4. Keep durable changes in commits; keep transient previews in overlay patches.

## Commands

- `pnpm --filter @loop-kit/graphite-react run typecheck`
- `pnpm --filter @loop-kit/graphite-react run build`
