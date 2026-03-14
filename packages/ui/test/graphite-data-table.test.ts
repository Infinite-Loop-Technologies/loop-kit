import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
    GraphiteDataTable,
    getNextGraphiteDataTableSortState,
    sortGraphiteDataTableRows,
    type GraphiteDataTableColumn,
} from '../src/blocks';

type TableRow = {
    id: string;
    name: string;
    count: number;
};

const rows: readonly TableRow[] = [
    { id: 'b', name: 'Bravo', count: 2 },
    { id: 'a', name: 'Alpha', count: 5 },
];

const columns: readonly GraphiteDataTableColumn<TableRow>[] = [
    {
        key: 'name',
        header: 'Name',
        sortable: true,
        sortValue: (row) => row.name,
        value: (row) => row.name,
    },
    {
        key: 'count',
        header: 'Count',
        sortable: true,
        sortValue: (row) => row.count,
        value: (row) => String(row.count),
    },
];

test('getNextGraphiteDataTableSortState cycles asc, desc, and back to null', () => {
    const ascending = getNextGraphiteDataTableSortState('name', null);
    assert.deepEqual(ascending, { columnKey: 'name', direction: 'asc' });

    const descending = getNextGraphiteDataTableSortState('name', ascending);
    assert.deepEqual(descending, { columnKey: 'name', direction: 'desc' });

    const cleared = getNextGraphiteDataTableSortState('name', descending);
    assert.equal(cleared, null);
});

test('sortGraphiteDataTableRows sorts rows by the active column and direction', () => {
    const ascending = sortGraphiteDataTableRows(rows, columns, {
        columnKey: 'name',
        direction: 'asc',
    });
    assert.deepEqual(
        ascending.map((row) => row.id),
        ['a', 'b'],
    );

    const descending = sortGraphiteDataTableRows(rows, columns, {
        columnKey: 'count',
        direction: 'desc',
    });
    assert.deepEqual(
        descending.map((row) => row.id),
        ['a', 'b'],
    );
});

test('GraphiteDataTable renders custom emptyState and row actions', () => {
    const markup = renderToStaticMarkup(
        React.createElement(GraphiteDataTable<TableRow>, {
            ariaLabel: 'Tasks',
            columns,
            emptyState: React.createElement('div', null, 'Nothing to review'),
            renderRowActions: (row) =>
                React.createElement('button', { type: 'button' }, `Open ${row.id}`),
            rowKey: (row) => row.id,
            rows,
        }),
    );

    assert.match(markup, /aria-label="Tasks"/);
    assert.match(markup, />Open a</);
    assert.match(markup, />Open b</);

    const emptyMarkup = renderToStaticMarkup(
        React.createElement(GraphiteDataTable<TableRow>, {
            ariaLabel: 'Tasks',
            columns,
            emptyState: React.createElement('div', null, 'Nothing to review'),
            rowKey: (row) => row.id,
            rows: [],
        }),
    );

    assert.match(emptyMarkup, /Nothing to review/);
});
