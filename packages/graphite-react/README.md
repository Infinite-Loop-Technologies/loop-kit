# @loop-kit/graphite-react

React utilities for the active `@loop-kit/graphite` runtime.

## What Lives Here

- `GraphiteProvider`
- `useGraphite`
- `useQuery`
- `useCommit`
- `useHistory`
- `useIntent`
- `useGraphitePersistence`
- `useCommitLog`
- `useIntentShortcuts`
- `GraphiteInspector`
- `GraphiteIntentBrowser`

## How To Use

```tsx
import { createGraphStore } from '@loop-kit/graphite';
import { GraphiteProvider, useQuery } from '@loop-kit/graphite-react';

const store = createGraphStore({
    initialState: {
        count: 1,
    },
});

function Counter() {
    const count = useQuery((state) => state.count as number);
    return <span>{count}</span>;
}

export function App() {
    return (
        <GraphiteProvider store={store}>
            <Counter />
        </GraphiteProvider>
    );
}
```

## Commands

- `bun --filter @loop-kit/graphite-react run typecheck`
- `bun --filter @loop-kit/graphite-react run build`
