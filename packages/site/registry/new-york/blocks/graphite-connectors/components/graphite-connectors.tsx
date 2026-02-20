'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    $set,
    createConnectorHost,
    createGraphStore,
    createHttpPollingConnector,
    createLocalStoragePersistenceAdapter,
    type GraphState,
} from '@loop-kit/graphite';
import {
    GraphiteInspector,
    GraphiteProvider,
    useCommitLog,
    useGraphite,
    useGraphitePersistence,
    useIntent,
    useQuery,
} from '@loop-kit/graphite/react';

import { GraphiteDataTable } from '../../../systems/graphite-data-table';

type RemoteTodo = {
    id: number;
    title: string;
    completed: boolean;
};

type ConnectorDemoState = GraphState & {
    remote: {
        todos: RemoteTodo[];
        lastSyncAt: number | null;
        source: string;
        status: 'idle' | 'syncing' | 'ready' | 'error';
        errors: string[];
    };
};

function createConnectorDemoStore() {
    const store = createGraphStore<ConnectorDemoState>({
        initialState: {
            remote: {
                todos: [],
                lastSyncAt: null,
                source: 'https://jsonplaceholder.typicode.com/todos?_limit=12',
                status: 'idle',
                errors: [],
            },
        },
        eventMode: 'when-observed',
        maxCommits: 500,
    });

    store.registerIntent('remote/clear', () => ({
        patch: {
            remote: {
                todos: $set([]),
                status: $set('idle'),
            },
        },
        event: {
            name: 'remote.todos.cleared',
        },
    }));

    return store;
}

const todosConnector = createHttpPollingConnector<
    ConnectorDemoState,
    unknown[]
>({
    id: 'http.todos',
    request: 'https://jsonplaceholder.typicode.com/todos?_limit=12',
    intervalMs: 20_000,
    immediate: false,
    toPatch: (payload) => {
        const todos = payload
            .map((entry) => ({
                id: Number((entry as { id?: unknown }).id ?? 0),
                title: String((entry as { title?: unknown }).title ?? ''),
                completed: Boolean(
                    (entry as { completed?: unknown }).completed,
                ),
            }))
            .filter((entry) => Number.isFinite(entry.id) && entry.id > 0);

        return {
            remote: {
                todos: $set(todos),
                lastSyncAt: $set(Date.now()),
                source: $set(
                    'https://jsonplaceholder.typicode.com/todos?_limit=12',
                ),
                status: $set('ready'),
            },
        };
    },
});

function GraphiteConnectorsScene() {
    const store = useGraphite<ConnectorDemoState>();
    const dispatchIntent = useIntent<ConnectorDemoState>();
    const commits = useCommitLog<ConnectorDemoState>(30);

    const persistenceAdapter = useMemo(
        () =>
            createLocalStoragePersistenceAdapter<ConnectorDemoState>({
                key: 'graphite-connectors/v1',
            }),
        [],
    );

    useGraphitePersistence<ConnectorDemoState>({
        adapter: persistenceAdapter,
        strategy: 'state',
        debounceMs: 120,
        hydrateOnMount: true,
    });

    const todos = useQuery<ConnectorDemoState, RemoteTodo[]>(
        (state) => state.remote.todos,
    );
    const status = useQuery<
        ConnectorDemoState,
        ConnectorDemoState['remote']['status']
    >((state) => state.remote.status);
    const lastSyncAt = useQuery<ConnectorDemoState, number | null>(
        (state) => state.remote.lastSyncAt,
    );
    const errors = useQuery<ConnectorDemoState, string[]>(
        (state) => state.remote.errors,
    );

    const [isConnected, setIsConnected] = useState(false);
    const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
    const [refreshHandle, setRefreshHandle] = useState<
        null | (() => Promise<void>)
    >(null);

    useEffect(() => {
        if (!isAutoSyncEnabled) {
            setIsConnected(false);
            setRefreshHandle(null);
            return;
        }

        let cancelled = false;
        const host = createConnectorHost(store);

        void host
            .connect(todosConnector, undefined)
            .then((handle) => {
                if (cancelled) {
                    void handle.dispose();
                    return;
                }
                setIsConnected(true);
                setRefreshHandle(() => handle.refresh);
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Failed to connect HTTP connector.';
                store.materializeExternalPatch(
                    {
                        remote: {
                            status: $set('error'),
                            errors: $set([message]),
                        },
                    },
                    {
                        connectorId: 'http.todos',
                        connectorType: 'http-polling',
                    },
                );
            });

        return () => {
            cancelled = true;
            setIsConnected(false);
            setRefreshHandle(null);
            void host.disconnectAll();
        };
    }, [store, isAutoSyncEnabled]);

    const runManualSync = async () => {
        store.materializeExternalPatch(
            {
                remote: {
                    status: $set('syncing'),
                },
            },
            {
                connectorId: 'http.todos',
            },
        );
        await refreshHandle?.();
    };

    const sourceCommits = commits.filter(
        (record) => record.source === 'external',
    );

    return (
        <div className='mx-auto grid max-w-[1280px] gap-4 p-4 text-foreground lg:grid-cols-[1.6fr_1fr]'>
            <section className='rounded-xl border border-border bg-card p-4 shadow-sm'>
                <header className='mb-4 space-y-2'>
                    <h2 className='text-xl font-semibold'>
                        Graphite Connectors
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                        External API integration through connector adapters.
                        This demo uses an HTTP polling connector that
                        materializes external patches into Graphite.
                    </p>
                </header>

                <div className='mb-4 flex flex-wrap items-center gap-2'>
                    <button
                        type='button'
                        className='rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent'
                        onClick={() => setIsAutoSyncEnabled((prev) => !prev)}>
                        {isAutoSyncEnabled
                            ? 'Disable Auto Sync'
                            : 'Enable Auto Sync'}
                    </button>
                    <button
                        type='button'
                        className='rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50'
                        disabled={!isAutoSyncEnabled || !refreshHandle}
                        onClick={() => {
                            void runManualSync();
                        }}>
                        Sync Now
                    </button>
                    <button
                        type='button'
                        className='rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent'
                        onClick={() =>
                            dispatchIntent('remote/clear', undefined)
                        }>
                        Clear Imported Data
                    </button>
                </div>

                <div className='mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4'>
                    <div className='rounded-lg border bg-background/60 p-3 text-sm'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                            Connector
                        </p>
                        <p className='mt-1 font-medium'>
                            {isConnected ? 'connected' : 'idle'}
                        </p>
                    </div>
                    <div className='rounded-lg border bg-background/60 p-3 text-sm'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                            Store Status
                        </p>
                        <p className='mt-1 font-medium'>{status}</p>
                    </div>
                    <div className='rounded-lg border bg-background/60 p-3 text-sm'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                            Last Sync
                        </p>
                        <p className='mt-1 font-medium'>
                            {lastSyncAt
                                ? new Date(lastSyncAt).toLocaleTimeString()
                                : 'never'}
                        </p>
                    </div>
                    <div className='rounded-lg border bg-background/60 p-3 text-sm'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                            External Commits
                        </p>
                        <p className='mt-1 font-medium'>
                            {sourceCommits.length}
                        </p>
                    </div>
                </div>

                <GraphiteDataTable
                    rows={todos}
                    rowKey={(row) => row.id.toString(10)}
                    columns={[
                        {
                            key: 'id',
                            header: 'ID',
                            sortable: true,
                            sortValue: (row) => row.id,
                            value: (row) => row.id,
                        },
                        {
                            key: 'title',
                            header: 'Title',
                            sortable: true,
                            sortValue: (row) => row.title,
                            value: (row) => row.title,
                        },
                        {
                            key: 'completed',
                            header: 'Done',
                            sortable: true,
                            sortValue: (row) => Number(row.completed),
                            value: (row) => (row.completed ? 'yes' : 'no'),
                        },
                    ]}
                    emptyMessage='No connector data yet. Enable sync and run Sync Now.'
                />

                {errors.length > 0 ? (
                    <div className='mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive'>
                        {errors[errors.length - 1]}
                    </div>
                ) : null}
            </section>

            <section className='space-y-4'>
                <div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
                    <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
                        Connector Commit Log
                    </h3>
                    <div className='max-h-[340px] overflow-auto rounded-lg border bg-background/50 p-2'>
                        {sourceCommits.length === 0 ? (
                            <p className='text-xs text-muted-foreground'>
                                No external commits yet.
                            </p>
                        ) : (
                            sourceCommits
                                .slice()
                                .reverse()
                                .map((record) => (
                                    <p
                                        key={record.id}
                                        className='mb-1 text-xs text-muted-foreground'>
                                        #{record.index} {record.source} -{' '}
                                        {record.changedPaths.length} path(s)
                                    </p>
                                ))
                        )}
                    </div>
                </div>

                <div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
                    <GraphiteInspector maxRows={16} />
                </div>
            </section>
        </div>
    );
}

export default function GraphiteConnectorsPage() {
    const store = useMemo(() => createConnectorDemoStore(), []);
    return (
        <GraphiteProvider store={store}>
            <GraphiteConnectorsScene />
        </GraphiteProvider>
    );
}
