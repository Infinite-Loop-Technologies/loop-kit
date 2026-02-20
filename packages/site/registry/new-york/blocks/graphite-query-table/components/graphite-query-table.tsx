'use client';

import { useMemo, useState } from 'react';
import { $set, createGraphStore, type GraphState } from '@loop-kit/graphite';
import {
    GraphiteProvider,
    useIntent,
    useQuery,
} from '@loop-kit/graphite/react';

import {
    createQueryBuilderModel,
    evaluateQueryBuilder,
    GraphiteQueryBuilder,
    type QueryBuilderField,
    type QueryBuilderModel,
} from '../../../systems/graphite-query-builder';
import { GraphiteDataTable } from '../../../systems/graphite-data-table';

type TableRow = {
    id: string;
    title: string;
    owner: string;
    status: 'todo' | 'active' | 'done';
    priority: number;
    points: number;
};

type QueryTableState = GraphState & {
    rows: TableRow[];
};

function createInitialRows(): TableRow[] {
    return [
        {
            id: 'row-01',
            title: 'Build query builder UI',
            owner: 'Avery',
            status: 'done',
            priority: 3,
            points: 5,
        },
        {
            id: 'row-02',
            title: 'Connect shortcuts manager',
            owner: 'Jules',
            status: 'active',
            priority: 2,
            points: 8,
        },
        {
            id: 'row-03',
            title: 'Refactor outline editor',
            owner: 'Sam',
            status: 'todo',
            priority: 4,
            points: 13,
        },
        {
            id: 'row-04',
            title: 'Ship connectors docs',
            owner: 'Avery',
            status: 'active',
            priority: 1,
            points: 3,
        },
    ];
}

function createQueryTableStore() {
    const store = createGraphStore<QueryTableState>({
        initialState: {
            rows: createInitialRows(),
        },
        eventMode: 'when-observed',
        maxCommits: 300,
    });

    store.registerIntent('table/add-row', (_payload, { state }) => {
        const nextIndex = state.rows.length + 1;
        const row: TableRow = {
            id: `row-${nextIndex.toString(10).padStart(2, '0')}`,
            title: `Backlog item ${nextIndex}`,
            owner: ['Avery', 'Jules', 'Sam'][nextIndex % 3] ?? 'Avery',
            status: 'todo',
            priority: Math.max(1, Math.floor(Math.random() * 5)),
            points: Math.max(1, Math.floor(Math.random() * 13)),
        };
        return {
            patch: {
                rows: $set([...state.rows, row]),
            },
            event: {
                name: 'table.row.added',
            },
        };
    });

    store.registerIntent(
        'table/toggle-status',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const index = state.rows.findIndex((row) => row.id === payload.id);
            if (index < 0) return null;
            const row = state.rows[index];
            if (!row) return null;
            const nextStatus =
                row.status === 'todo'
                    ? 'active'
                    : row.status === 'active'
                      ? 'done'
                      : 'todo';
            return {
                patch: {
                    rows: {
                        [String(index)]: {
                            status: $set(nextStatus),
                        },
                    },
                },
                event: {
                    name: 'table.row.status.toggled',
                },
            };
        },
    );

    store.registerIntent(
        'table/delete-row',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const nextRows = state.rows.filter((row) => row.id !== payload.id);
            if (nextRows.length === state.rows.length) return null;
            return {
                patch: {
                    rows: $set(nextRows),
                },
                event: {
                    name: 'table.row.deleted',
                },
            };
        },
    );

    return store;
}

const ROW_FILTER_FIELDS: QueryBuilderField[] = [
    { key: 'title', label: 'Title', type: 'string' },
    { key: 'owner', label: 'Owner', type: 'string' },
    { key: 'status', label: 'Status', type: 'string' },
    { key: 'priority', label: 'Priority', type: 'number' },
    { key: 'points', label: 'Points', type: 'number' },
];

function QueryTableScene() {
    const dispatchIntent = useIntent<QueryTableState>();
    const [queryModel, setQueryModel] = useState<QueryBuilderModel>(() =>
        createQueryBuilderModel(),
    );

    const rows = useQuery<QueryTableState, TableRow[]>((state) => state.rows);
    const filtered = useQuery<QueryTableState, TableRow[]>((state) => {
        if (queryModel.rules.length === 0) return state.rows;

        return state.rows.filter((row) => {
            const record: Record<string, unknown> = {
                id: row.id,
                title: row.title,
                owner: row.owner,
                status: row.status,
                priority: row.priority,
                points: row.points,
            };
            return evaluateQueryBuilder(queryModel, record);
        });
    });

    return (
        <div className='mx-auto max-w-[1180px] space-y-4 p-4'>
            <header className='space-y-2 rounded-xl border bg-card p-4'>
                <h2 className='text-xl font-semibold'>
                    Graphite Query + Data Table
                </h2>
                <p className='text-sm text-muted-foreground'>
                    Reusable query-builder + data-table composition, backed by
                    Graphite query subscriptions and intent-dispatched table
                    mutations.
                </p>
                <div className='flex gap-2'>
                    <button
                        type='button'
                        className='rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent'
                        onClick={() =>
                            dispatchIntent('table/add-row', undefined)
                        }>
                        Add Row Intent
                    </button>
                    <button
                        type='button'
                        className='rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent'
                        onClick={() =>
                            setQueryModel(createQueryBuilderModel())
                        }>
                        Reset Filters
                    </button>
                </div>
            </header>

            <section className='rounded-xl border bg-card p-4'>
                <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                    Filter rules
                </p>
                <GraphiteQueryBuilder
                    fields={ROW_FILTER_FIELDS}
                    value={queryModel}
                    onChange={setQueryModel}
                />
            </section>

            <section className='rounded-xl border bg-card p-4'>
                <p className='mb-3 text-sm text-muted-foreground'>
                    Showing {filtered.length} of {rows.length} rows
                </p>
                <GraphiteDataTable
                    rows={filtered}
                    rowKey={(row) => row.id}
                    columns={[
                        {
                            key: 'title',
                            header: 'Title',
                            sortable: true,
                            sortValue: (row) => row.title,
                            value: (row) => row.title,
                        },
                        {
                            key: 'owner',
                            header: 'Owner',
                            sortable: true,
                            sortValue: (row) => row.owner,
                            value: (row) => row.owner,
                        },
                        {
                            key: 'status',
                            header: 'Status',
                            sortable: true,
                            sortValue: (row) => row.status,
                            value: (row) => row.status,
                        },
                        {
                            key: 'priority',
                            header: 'Priority',
                            sortable: true,
                            sortValue: (row) => row.priority,
                            value: (row) => row.priority,
                        },
                        {
                            key: 'points',
                            header: 'Points',
                            sortable: true,
                            sortValue: (row) => row.points,
                            value: (row) => row.points,
                        },
                        {
                            key: 'actions',
                            header: 'Actions',
                            cell: (row) => (
                                <div className='flex gap-2'>
                                    <button
                                        type='button'
                                        className='rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent'
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            dispatchIntent(
                                                'table/toggle-status',
                                                { id: row.id },
                                            );
                                        }}>
                                        Toggle Status
                                    </button>
                                    <button
                                        type='button'
                                        className='rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent'
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            dispatchIntent('table/delete-row', {
                                                id: row.id,
                                            });
                                        }}>
                                        Delete
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    emptyMessage='No rows match the current filters.'
                />
            </section>
        </div>
    );
}

export default function GraphiteQueryTablePage() {
    const store = useMemo(() => createQueryTableStore(), []);
    return (
        <GraphiteProvider store={store}>
            <QueryTableScene />
        </GraphiteProvider>
    );
}
