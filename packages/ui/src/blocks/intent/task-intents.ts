import {
    $delete,
    $link,
    $merge,
    $set,
    createGraphStore,
    defineMutation,
} from '@loop-kit/graphite';
import type {
    GraphNode,
    GraphState,
    GraphiteRuntime,
} from '@loop-kit/graphite';

export interface TaskRecord {
    id: string;
    title: string;
    completed: boolean;
    priority: number;
    tags: string[];
    createdAt: number;
}

export interface PostRecord {
    id: string;
    title: string;
    published: boolean;
    likes: number;
}

export interface DemoUiState {
    filter: string;
    minPriority: number;
    includeCompleted: boolean;
    sortDirection: 'asc' | 'desc';
    selectedTaskId: string | null;
}

export interface GraphiteDemoState extends GraphState {
    tasks: TaskRecord[];
    posts: PostRecord[];
    nodes: Record<string, GraphNode>;
    ui: DemoUiState;
}

export const $increment = defineMutation('increment', (by: number = 1) => ({
    by,
}));

function toNode(task: TaskRecord): GraphNode {
    return {
        id: task.id,
        type: 'task',
        data: {
            title: task.title,
            completed: task.completed,
            priority: task.priority,
            tags: task.tags,
        },
        links: {},
    };
}

function nextTaskId(state: Readonly<GraphiteDemoState>): string {
    const next = state.tasks.length + 1;
    return `task-${next.toString(10).padStart(2, '0')}`;
}

function createSeedTasks(): TaskRecord[] {
    return [
        {
            id: 'task-01',
            title: 'Model intent -> patch -> commit',
            completed: false,
            priority: 3,
            tags: ['graphite', 'core'],
            createdAt: Date.now() - 100_000,
        },
        {
            id: 'task-02',
            title: 'Wire dynamic query filters',
            completed: false,
            priority: 2,
            tags: ['query', 'ui'],
            createdAt: Date.now() - 80_000,
        },
        {
            id: 'task-03',
            title: 'Publish inspector tooling',
            completed: true,
            priority: 1,
            tags: ['tooling'],
            createdAt: Date.now() - 60_000,
        },
    ];
}

function createSeedPosts(): PostRecord[] {
    return [
        {
            id: 'post-01',
            title: 'Graphite launch notes',
            published: true,
            likes: 4,
        },
        {
            id: 'post-02',
            title: 'Reactive query design',
            published: false,
            likes: 1,
        },
    ];
}

export function createGraphiteDemoState(): GraphiteDemoState {
    const tasks = createSeedTasks();
    const nodes: Record<string, GraphNode> = {};
    for (const task of tasks) {
        nodes[task.id] = toNode(task);
    }

    return {
        tasks,
        posts: createSeedPosts(),
        nodes,
        ui: {
            filter: '',
            minPriority: 0,
            includeCompleted: false,
            sortDirection: 'desc',
            selectedTaskId: null,
        },
    };
}

export function createGraphiteDemoStore(): GraphiteRuntime<GraphiteDemoState> {
    const store = createGraphStore<GraphiteDemoState>({
        initialState: createGraphiteDemoState(),
        eventMode: 'when-observed',
        maxCommits: 300,
    });

    store.registerMutationOperator('increment', (ctx, payload) => {
        const amount = Number((payload as { by?: number }).by ?? 1);
        const current = Number(ctx.get() ?? 0);
        ctx.set(current + amount);
    });

    store.registerQueryOperator('containsText', (value, directive) => {
        if (!Array.isArray(value)) return value;
        const needle = String(directive ?? '')
            .trim()
            .toLowerCase();
        if (!needle) return value;

        return value.filter((entry) => {
            if (typeof entry !== 'object' || entry === null) return false;
            const title = String(
                (entry as { title?: unknown }).title ?? '',
            ).toLowerCase();
            const tagsRaw = (entry as { tags?: unknown }).tags;
            const tags = Array.isArray(tagsRaw) ? tagsRaw : [];
            const hasTag = tags.some((tag) =>
                String(tag).toLowerCase().includes(needle),
            );
            return title.includes(needle) || hasTag;
        });
    });

    registerTaskIntents(store);
    return store;
}

export function registerTaskIntents(
    store: GraphiteRuntime<GraphiteDemoState>,
): void {
    store.registerIntent(
        'task/add',
        (
            payload: {
                title?: string;
                priority?: number;
                tags?: string[];
            },
            { state },
        ) => {
            const task: TaskRecord = {
                id: nextTaskId(state),
                title: payload.title?.trim() || 'New Graphite Task',
                completed: false,
                priority: Math.max(0, Math.trunc(payload.priority ?? 1)),
                tags:
                    payload.tags && payload.tags.length > 0
                        ? payload.tags
                        : ['inbox'],
                createdAt: Date.now(),
            };

            return {
                patch: {
                    tasks: $merge([task]),
                    nodes: {
                        [task.id]: $set(toNode(task)),
                    },
                },
                metadata: {
                    intent: 'task/add',
                    taskId: task.id,
                },
                event: {
                    name: 'task.created',
                },
            };
        },
    );

    store.registerIntent(
        'task/toggle',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const index = state.tasks.findIndex(
                (task) => task.id === payload.id,
            );
            if (index < 0) return null;
            const task = state.tasks[index];
            if (!task) return null;

            return {
                patch: {
                    tasks: {
                        [String(index)]: {
                            completed: $set(!task.completed),
                        },
                    },
                    nodes: {
                        [task.id]: {
                            data: {
                                completed: $set(!task.completed),
                            },
                        },
                    },
                },
                event: {
                    name: 'task.toggled',
                },
            };
        },
    );

    store.registerIntent(
        'task/link',
        (payload: { from?: string; to?: string; relation?: string }) => {
            if (!payload.from || !payload.to) return null;
            return {
                patch: {
                    nodes: {
                        [payload.from]: $link({
                            relation: payload.relation ?? 'related',
                            to: payload.to,
                        }),
                    },
                },
                event: {
                    name: 'task.linked',
                },
            };
        },
    );

    store.registerIntent(
        'ui/select-task',
        (payload: { id?: string | null }) => ({
            patch: {
                ui: {
                    selectedTaskId: $set(payload.id ?? null),
                },
            },
            event: {
                name: 'ui.task.selected',
            },
        }),
    );

    store.registerIntent('task/remove-completed', (_payload, { state }) => {
        const remaining = state.tasks.filter((task) => !task.completed);
        const removedIds = new Set(
            state.tasks.filter((task) => task.completed).map((task) => task.id),
        );

        const nextNodes = { ...state.nodes };
        for (const id of removedIds.values()) {
            delete nextNodes[id];
        }

        return {
            patch: {
                tasks: $set(remaining),
                nodes: $set(nextNodes),
                ui: {
                    selectedTaskId: $set(
                        state.ui.selectedTaskId &&
                            remaining.some(
                                (task) => task.id === state.ui.selectedTaskId,
                            )
                            ? state.ui.selectedTaskId
                            : (remaining[0]?.id ?? null),
                    ),
                },
            },
            event: {
                name: 'task.completed.pruned',
            },
        };
    });

    store.registerIntent('post/import', (payload: { posts: PostRecord[] }) => ({
        patch: {
            posts: $merge(payload.posts),
        },
        event: {
            name: 'post.imported',
        },
    }));

    store.registerIntent(
        'task/delete',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const index = state.tasks.findIndex(
                (task) => task.id === payload.id,
            );
            if (index < 0) return null;

            return {
                patch: {
                    tasks: {
                        [String(index)]: $delete(),
                    },
                    nodes: {
                        [payload.id]: $delete(),
                    },
                    ui: {
                        selectedTaskId: $set(
                            state.ui.selectedTaskId === payload.id
                                ? (state.tasks.find(
                                      (task) => task.id !== payload.id,
                                  )?.id ?? null)
                                : state.ui.selectedTaskId,
                        ),
                    },
                },
                event: {
                    name: 'task.deleted',
                },
            };
        },
    );
}
