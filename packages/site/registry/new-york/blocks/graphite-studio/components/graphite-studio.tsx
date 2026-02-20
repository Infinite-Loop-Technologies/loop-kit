'use client';

import { useMemo, useState } from 'react';
import {
    $merge,
    $set,
    createLocalStoragePersistenceAdapter,
    type QueryInput,
} from '@loop-kit/graphite';
import {
    GraphiteInspector,
    GraphiteIntentBrowser,
    GraphiteProvider,
    useCommit,
    useGraphite,
    useHistory,
    useIntent,
    useQuery,
    useGraphitePersistence,
} from '@loop-kit/graphite/react';

import {
    $increment,
    createGraphiteDemoStore,
    type GraphiteDemoState,
    type PostRecord,
    type TaskRecord,
} from '../../../intentproducers/task-intents';
import {
    createDefaultTaskQueryModel,
    useGraphiteTaskQuery,
} from '../../../hooks/use-graphite-task-query';
import {
    createDefaultTaskShortcutBindings,
    createTaskIntentRegistry,
    TASK_SHORTCUT_CONTEXT_FIELDS,
    useGraphiteShortcutSystem,
} from '../../../systems/graphite-shortcuts';
import {
    createQueryBuilderModel,
    GraphiteQueryBuilder,
    type QueryBuilderField,
} from '../../../systems/graphite-query-builder';
import { GraphiteDataTable } from '../../../systems/graphite-data-table';
import { GraphiteShortcutManager } from '../../../systems/graphite-shortcut-manager';
import { GraphiteIntentCommandMenu } from '../../../systems/graphite-intent-command-menu';

function randomPriority() {
    return Math.floor(Math.random() * 5);
}

function randomTagSet(): string[] {
    const seed = ['inbox', 'ui', 'core', 'query', 'sync', 'ops'];
    const first = seed[Math.floor(Math.random() * seed.length)];
    const second = seed[Math.floor(Math.random() * seed.length)];
    return Array.from(new Set([first, second]));
}

function toPostImportPayload() {
    const id = Math.floor(Date.now() / 1000).toString(36);
    return {
        posts: [
            {
                id: `post-${id}`,
                title: `Imported post ${id}`,
                published: Math.random() > 0.4,
                likes: Math.floor(Math.random() * 4),
            },
        ],
    };
}

const TASK_FILTER_FIELDS: QueryBuilderField[] = [
    { key: 'title', label: 'Title', type: 'string' },
    { key: 'tags', label: 'Tags', type: 'string' },
    { key: 'priority', label: 'Priority', type: 'number' },
    { key: 'completed', label: 'Completed', type: 'boolean' },
];

function GraphiteStudioScene() {
    const graphite = useGraphite<GraphiteDemoState>();
    const commit = useCommit<GraphiteDemoState>();
    const dispatchIntent = useIntent<GraphiteDemoState>();
    const history = useHistory<GraphiteDemoState>();

    const persistenceAdapter = useMemo(
        () =>
            createLocalStoragePersistenceAdapter<GraphiteDemoState>({
                key: 'graphite-studio/v2',
            }),
        [],
    );

    useGraphitePersistence<GraphiteDemoState>({
        adapter: persistenceAdapter,
        strategy: 'state',
        debounceMs: 120,
        hydrateOnMount: true,
    });

    const [queryModel, setQueryModel] = useState(createDefaultTaskQueryModel);
    const [shortcutsEnabled, setShortcutsEnabled] = useState(true);
    const [showShortcutManager, setShowShortcutManager] = useState(true);
    const [shortcutBindings, setShortcutBindings] = useState(
        createDefaultTaskShortcutBindings,
    );

    const taskQuery = useGraphiteTaskQuery(queryModel);

    const taskResult = useQuery<GraphiteDemoState, { tasks: TaskRecord[] }>(
        taskQuery as QueryInput<GraphiteDemoState, { tasks: TaskRecord[] }>,
    );

    const ui = useQuery<GraphiteDemoState, GraphiteDemoState['ui']>(
        (state) => state.ui,
    );

    const postQuery = useMemo<
        QueryInput<GraphiteDemoState, { posts: PostRecord[] }>
    >(
        () => ({
            posts: {
                $orderBy: { key: 'likes', direction: 'desc' },
            },
        }),
        [],
    );
    const postResult = useQuery<GraphiteDemoState, { posts: PostRecord[] }>(
        postQuery,
    );

    const tasks = taskResult.tasks ?? [];
    const posts = postResult.posts ?? [];
    const selectedTaskId = ui.selectedTaskId;
    const selectedTask =
        tasks.find((task) => task.id === selectedTaskId) ?? null;
    const fallbackTargetId =
        tasks.find((task) => task.id !== selectedTaskId)?.id ?? null;

    const intents = useMemo(
        () => createTaskIntentRegistry(selectedTaskId, fallbackTargetId),
        [selectedTaskId, fallbackTargetId],
    );

    const shortcuts = useGraphiteShortcutSystem(
        intents,
        shortcutBindings,
        shortcutsEnabled,
    );

    const onSelectTask = (taskId: string | null) => {
        dispatchIntent('ui/select-task', {
            id: taskId,
        });
    };

    const onAddTask = () => {
        dispatchIntent('task/add', {
            title: `Task ${Date.now().toString(36)}`,
            priority: randomPriority(),
            tags: randomTagSet(),
        });
    };

    const onToggleTask = (taskId?: string | null) => {
        dispatchIntent('task/toggle', {
            id: taskId ?? selectedTaskId ?? undefined,
        });
    };

    const onDeleteTask = (taskId?: string | null) => {
        dispatchIntent('task/delete', {
            id: taskId ?? selectedTaskId ?? undefined,
        });
    };

    const onImportPosts = () => {
        dispatchIntent('post/import', toPostImportPayload());
    };

    const onLikePost = (postId: string) => {
        const index = graphite
            .getState()
            .posts.findIndex((post) => post.id === postId);
        if (index < 0) return;
        commit({
            posts: {
                [String(index)]: {
                    likes: $increment(1),
                },
            },
        });
    };

    const actionButtonClass =
        'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50';

    return (
        <div className='mx-auto grid max-w-[1400px] gap-4 p-4 text-foreground xl:grid-cols-[1.7fr_1fr]'>
            <GraphiteIntentCommandMenu intents={intents} enabled />

            <section className='rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm'>
                <header className='mb-4 space-y-2'>
                    <h2 className='text-xl font-semibold'>Graphite Studio</h2>
                    <p className='text-sm text-muted-foreground'>
                        Reusable Graphite systems demo: dynamic query builder,
                        data-table views, shortcut manager with when clauses,
                        command-menu dispatch, undo/redo history, and local
                        persistence.
                    </p>
                    <p className='text-xs text-muted-foreground'>
                        Tip: press <strong>mod+k</strong> to open the intent
                        command menu.
                    </p>
                </header>

                <div className='grid gap-3 md:grid-cols-4'>
                    <label className='flex flex-col gap-1 text-sm'>
                        <span>Text Filter</span>
                        <input
                            className='rounded-md border border-input bg-background px-3 py-2 text-foreground'
                            value={queryModel.textFilter}
                            onChange={(event) => {
                                const next = event.target.value;
                                setQueryModel((current) => ({
                                    ...current,
                                    textFilter: next,
                                }));
                                commit(
                                    { ui: { filter: $set(next) } },
                                    { source: 'query-builder' },
                                );
                            }}
                            placeholder='Filter by title/tag'
                        />
                    </label>

                    <label className='flex flex-col gap-1 text-sm'>
                        <span>Min Priority</span>
                        <input
                            className='rounded-md border border-input bg-background px-3 py-2 text-foreground'
                            type='number'
                            min={0}
                            max={9}
                            value={queryModel.minPriority}
                            onChange={(event) => {
                                const next = Number(event.target.value || 0);
                                setQueryModel((current) => ({
                                    ...current,
                                    minPriority: next,
                                }));
                                commit(
                                    { ui: { minPriority: $set(next) } },
                                    { source: 'query-builder' },
                                );
                            }}
                        />
                    </label>

                    <label className='flex flex-col gap-1 text-sm'>
                        <span>Sort Direction</span>
                        <select
                            className='rounded-md border border-input bg-background px-3 py-2 text-foreground'
                            value={queryModel.sortDirection}
                            onChange={(event) => {
                                const next =
                                    event.target.value === 'asc'
                                        ? 'asc'
                                        : 'desc';
                                setQueryModel((current) => ({
                                    ...current,
                                    sortDirection: next,
                                }));
                                commit(
                                    { ui: { sortDirection: $set(next) } },
                                    { source: 'query-builder' },
                                );
                            }}>
                            <option value='desc'>Priority Desc</option>
                            <option value='asc'>Priority Asc</option>
                        </select>
                    </label>

                    <label className='flex items-center gap-2 pt-6 text-sm'>
                        <input
                            type='checkbox'
                            checked={queryModel.includeCompleted}
                            onChange={(event) => {
                                const next = event.target.checked;
                                setQueryModel((current) => ({
                                    ...current,
                                    includeCompleted: next,
                                }));
                                commit(
                                    { ui: { includeCompleted: $set(next) } },
                                    { source: 'query-builder' },
                                );
                            }}
                        />
                        Include Completed
                    </label>
                </div>

                <div className='mt-3 rounded-xl border bg-card/30 p-3'>
                    <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                        Advanced task filter rules
                    </p>
                    <GraphiteQueryBuilder
                        fields={TASK_FILTER_FIELDS}
                        value={queryModel.rules}
                        onChange={(nextRules) =>
                            setQueryModel((current) => ({
                                ...current,
                                rules: nextRules,
                            }))
                        }
                    />
                </div>

                <div className='mt-3 flex flex-wrap gap-2'>
                    <button className={actionButtonClass} onClick={onAddTask}>
                        Add Task Intent
                    </button>
                    <button
                        className={actionButtonClass}
                        onClick={() => onToggleTask()}
                        disabled={!selectedTaskId}>
                        Toggle Selected
                    </button>
                    <button
                        className={actionButtonClass}
                        onClick={() =>
                            dispatchIntent('task/link', {
                                from: selectedTaskId ?? undefined,
                                to: fallbackTargetId ?? undefined,
                                relation: 'depends-on',
                            })
                        }
                        disabled={!selectedTaskId || !fallbackTargetId}>
                        Link Selected to Fallback
                    </button>
                    <button
                        className={actionButtonClass}
                        onClick={() => onDeleteTask()}
                        disabled={!selectedTaskId}>
                        Delete Selected
                    </button>
                    <button
                        className={actionButtonClass}
                        onClick={() =>
                            dispatchIntent('task/remove-completed', undefined)
                        }>
                        Remove Completed
                    </button>
                    <button
                        className={actionButtonClass}
                        onClick={onImportPosts}>
                        Import Posts Intent
                    </button>
                    <button
                        className={actionButtonClass}
                        onClick={() =>
                            commit({
                                posts: $merge([
                                    {
                                        id: `post-local-${Math.floor(Math.random() * 999).toString(10)}`,
                                        title: 'Local merged post',
                                        published: false,
                                        likes: 0,
                                    },
                                ]),
                            })
                        }>
                        Merge Posts Patch
                    </button>
                    <button
                        className={actionButtonClass}
                        onClick={() => history.undo()}
                        disabled={!history.canUndo}>
                        Undo
                    </button>
                    <button
                        className={actionButtonClass}
                        onClick={() => history.redo()}
                        disabled={!history.canRedo}>
                        Redo
                    </button>
                </div>

                <div className='mt-3 flex flex-wrap gap-4 text-sm'>
                    <label className='flex items-center gap-2'>
                        <input
                            type='checkbox'
                            checked={shortcutsEnabled}
                            onChange={(event) =>
                                setShortcutsEnabled(event.target.checked)
                            }
                        />
                        Enable Keyboard Shortcut Dispatch
                    </label>
                    <label className='flex items-center gap-2'>
                        <input
                            type='checkbox'
                            checked={showShortcutManager}
                            onChange={(event) =>
                                setShowShortcutManager(event.target.checked)
                            }
                        />
                        Show Shortcut Manager
                    </label>
                </div>

                <div className='mt-4 grid gap-3 lg:grid-cols-2'>
                    <section className='rounded-lg border border-border bg-background/70 p-3'>
                        <h3 className='mb-2 font-medium'>
                            Reactive Tasks ({tasks.length})
                        </h3>
                        <GraphiteDataTable
                            rows={tasks}
                            columns={[
                                {
                                    key: 'title',
                                    header: 'Task',
                                    sortable: true,
                                    sortValue: (row) => row.title,
                                    cell: (row) => (
                                        <button
                                            type='button'
                                            className='text-left'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onSelectTask(row.id);
                                            }}>
                                            {row.title}
                                        </button>
                                    ),
                                },
                                {
                                    key: 'priority',
                                    header: 'Priority',
                                    sortable: true,
                                    sortValue: (row) => row.priority,
                                    value: (row) => row.priority,
                                },
                                {
                                    key: 'status',
                                    header: 'Status',
                                    sortable: true,
                                    sortValue: (row) => Number(row.completed),
                                    value: (row) =>
                                        row.completed ? 'done' : 'open',
                                },
                                {
                                    key: 'actions',
                                    header: 'Actions',
                                    cell: (row) => (
                                        <div className='flex gap-1'>
                                            <button
                                                type='button'
                                                className='rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent'
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onToggleTask(row.id);
                                                }}>
                                                Toggle
                                            </button>
                                            <button
                                                type='button'
                                                className='rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent'
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onDeleteTask(row.id);
                                                }}>
                                                Delete
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            rowKey={(row) => row.id}
                            onRowClick={(row) => onSelectTask(row.id)}
                            rowClassName={(row) =>
                                row.id === selectedTaskId
                                    ? 'bg-muted/50'
                                    : undefined
                            }
                        />
                        <p className='mt-2 text-xs text-muted-foreground'>
                            Selected: {selectedTask?.title ?? 'none'}
                        </p>
                    </section>

                    <section className='rounded-lg border border-border bg-background/70 p-3'>
                        <h3 className='mb-2 font-medium'>
                            Posts ({posts.length})
                        </h3>
                        <GraphiteDataTable
                            rows={posts}
                            columns={[
                                {
                                    key: 'title',
                                    header: 'Title',
                                    sortable: true,
                                    sortValue: (row) => row.title,
                                    value: (row) => row.title,
                                },
                                {
                                    key: 'likes',
                                    header: 'Likes',
                                    sortable: true,
                                    sortValue: (row) => row.likes,
                                    value: (row) => row.likes,
                                },
                                {
                                    key: 'action',
                                    header: 'Action',
                                    cell: (row) => (
                                        <button
                                            className='rounded border border-border bg-background px-2 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onLikePost(row.id);
                                            }}>
                                            +1
                                        </button>
                                    ),
                                },
                            ]}
                            rowKey={(row) => row.id}
                        />
                    </section>
                </div>

                {showShortcutManager ? (
                    <div className='mt-4 rounded-lg border border-border bg-background/70 p-3'>
                        <GraphiteShortcutManager
                            intents={intents}
                            bindings={shortcutBindings}
                            onBindingsChange={setShortcutBindings}
                            contextFields={TASK_SHORTCUT_CONTEXT_FIELDS}
                        />
                    </div>
                ) : null}

                <div className='mt-4 grid gap-3 lg:grid-cols-2'>
                    <section className='rounded-lg border border-border bg-background/70 p-3'>
                        <h3 className='mb-2 font-medium'>Active Query Spec</h3>
                        <pre className='max-h-64 overflow-auto rounded bg-muted/40 p-2 text-xs text-muted-foreground'>
                            {JSON.stringify(taskQuery, null, 2)}
                        </pre>
                    </section>
                    <section className='rounded-lg border border-border bg-background/70 p-3'>
                        <h3 className='mb-2 font-medium'>Result Snapshot</h3>
                        <pre className='max-h-64 overflow-auto rounded bg-muted/40 p-2 text-xs text-muted-foreground'>
                            {JSON.stringify(
                                {
                                    tasks: tasks.slice(0, 4),
                                    posts: posts.slice(0, 4),
                                    selectedTaskId,
                                    canUndo: history.canUndo,
                                    canRedo: history.canRedo,
                                },
                                null,
                                2,
                            )}
                        </pre>
                    </section>
                </div>
            </section>

            <section className='space-y-4'>
                <div className='rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm'>
                    <GraphiteIntentBrowser
                        shortcuts={shortcuts}
                        bind={false}
                        active={shortcutsEnabled}
                    />
                </div>
                <div className='rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm'>
                    <GraphiteInspector maxRows={20} />
                </div>
            </section>
        </div>
    );
}

export default function GraphiteStudioPage() {
    const store = useMemo(() => createGraphiteDemoStore(), []);
    return (
        <GraphiteProvider store={store}>
            <GraphiteStudioScene />
        </GraphiteProvider>
    );
}
