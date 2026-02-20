# @loop-kit/graphite

Graphite is a lightweight intent-driven graph runtime with:

- intent -> patch -> commit mutation pipeline
- reactive query DSL (plain TypeScript objects/functions)
- patch DSL with composable `$` operators
- optional event facts (separate from core commit flow)
- commit diffs + inverse patch generation for undo
- split undo/redo history stacks
- connector host utilities (HTTP polling + WebSocket)
- pluggable persistence adapters (localStorage included)
- runtime instrumentation hooks for tooling and benchmarking

## Install

```bash
pnpm add @loop-kit/graphite
```

## Core Example

```ts
import { createGraphStore, $merge, $set } from '@loop-kit/graphite';

const graphite = createGraphStore({
    initialState: {
        tasks: [],
        nodes: {},
    },
});

graphite.registerIntent(
    'task/create',
    (payload: { id: string; title: string }) => ({
        tasks: $merge([
            {
                id: payload.id,
                title: payload.title,
                completed: false,
                priority: 0,
            },
        ]),
        nodes: {
            [payload.id]: $set({
                id: payload.id,
                type: 'task',
                data: {
                    title: payload.title,
                },
                links: {},
            }),
        },
    }),
);

graphite.dispatchIntent('task/create', { id: 't1', title: 'Ship Graphite' });

const openTasks = graphite.query({
    tasks: {
        $where: { completed: false },
        $orderBy: 'priority',
    },
});
```

## Mutation Operators

Built-in:

- `$set(value)`
- `$merge(value)`
- `$delete()`
- `$move({ from, to })`
- `$link({ from?, relation, to, bidirectional?, inverseRelation? })`
- `$unlink({ from?, relation, to?, bidirectional?, inverseRelation? })`

Custom:

```ts
import { defineMutation } from '@loop-kit/graphite';

const $increment = defineMutation('increment', (by: number = 1) => ({ by }));

graphite.registerMutationOperator('increment', (ctx, payload) => {
    const amount = Number((payload as { by?: number }).by ?? 1);
    const current = Number(ctx.get() ?? 0);
    ctx.set(current + amount);
});
```

## Query DSL

Graphite queries are plain objects or resolver functions:

```ts
graphite.query({
    tasks: {
        $where: { completed: false },
        $orderBy: { key: 'priority', direction: 'desc' },
        $limit: 20,
        subtasks: { $each: true },
    },
});
```

Custom query directives are supported via `registerQueryOperator`.

## React

Use the React bindings from `@loop-kit/graphite/react`.

```tsx
import {
    GraphiteProvider,
    useQuery,
    useCommit,
} from '@loop-kit/graphite/react';
```

Included helpers:

- `GraphiteProvider`
- `useGraphite`
- `useQuery`
- `useCommit`
- `useIntent`
- `useCommitLog`
- `useHistory`
- `useGraphitePersistence`
- `useIntentShortcuts`
- `GraphiteInspector`
- `GraphiteIntentBrowser`

## History

```ts
graphite.canUndo();
graphite.canRedo();
graphite.undo();
graphite.redo();
```

## Persistence

```ts
import {
    attachGraphitePersistence,
    createLocalStoragePersistenceAdapter,
} from '@loop-kit/graphite';

const adapter = createLocalStoragePersistenceAdapter({
    key: 'my-app/graphite',
});
const persistence = attachGraphitePersistence(graphite, {
    adapter,
    strategy: 'state',
});

await persistence.hydrate();
```

## Connectors

```ts
import {
    createConnectorHost,
    createHttpPollingConnector,
} from '@loop-kit/graphite';

const host = createConnectorHost(graphite);
const todosConnector = createHttpPollingConnector({
    id: 'http.todos',
    request: 'https://example.com/todos',
    intervalMs: 10_000,
    toPatch: (payload) => ({ todos: payload }),
});

await host.connect(todosConnector, undefined);
```

## Instrumentation

- `graphite.onCommit(listener)`
- `graphite.onQueryRun(listener)`
- `graphite.onInvalidation(listener)`
- `graphite.onEvent(listener)`

These are intended for inspectors, profiling, benchmarking, and external systems.
