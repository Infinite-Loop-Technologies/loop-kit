'use client';

import { useMemo, useState, type ReactNode } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../legacy/ui/table';
import { cn } from '../../utils';

export type GraphiteDataTableSortDirection = 'asc' | 'desc';

export interface GraphiteDataTableSortState {
    columnKey: string;
    direction: GraphiteDataTableSortDirection;
}

export interface GraphiteDataTableColumn<TRow> {
    key: string;
    header: string;
    className?: string;
    headerClassName?: string;
    sortable?: boolean;
    sortValue?: (
        row: TRow,
    ) => string | number | boolean | Date | null | undefined;
    cell?: (row: TRow) => ReactNode;
    value?: (row: TRow) => ReactNode;
}

export type GraphiteDataTableProps<TRow> = {
    rows: readonly TRow[];
    columns: readonly GraphiteDataTableColumn<TRow>[];
    rowKey: (row: TRow, index: number) => string;
    ariaLabel?: string;
    className?: string;
    emptyState?: ReactNode;
    emptyMessage?: string;
    rowClassName?: (row: TRow, index: number) => string | undefined;
    renderRowActions?: (row: TRow, index: number) => ReactNode;
    onRowClick?: (row: TRow, index: number) => void;
    sortState?: GraphiteDataTableSortState | null;
    onSortStateChange?: (next: GraphiteDataTableSortState | null) => void;
};

function comparePrimitive(left: unknown, right: unknown): number {
    if (Object.is(left, right)) return 0;

    if (left instanceof Date && right instanceof Date) {
        return left.getTime() < right.getTime() ? -1 : 1;
    }

    if (typeof left === 'number' && typeof right === 'number') {
        return left < right ? -1 : 1;
    }

    if (typeof left === 'boolean' && typeof right === 'boolean') {
        return Number(left) - Number(right);
    }

    const leftText = String(left ?? '').toLowerCase();
    const rightText = String(right ?? '').toLowerCase();
    if (leftText === rightText) return 0;
    return leftText < rightText ? -1 : 1;
}

export function getNextGraphiteDataTableSortState(
    columnKey: string,
    activeSort: GraphiteDataTableSortState | null | undefined,
): GraphiteDataTableSortState | null {
    if (!activeSort || activeSort.columnKey !== columnKey) {
        return {
            columnKey,
            direction: 'asc',
        };
    }

    if (activeSort.direction === 'asc') {
        return {
            columnKey,
            direction: 'desc',
        };
    }

    return null;
}

export function sortGraphiteDataTableRows<TRow>(
    rows: readonly TRow[],
    columns: readonly GraphiteDataTableColumn<TRow>[],
    sortState: GraphiteDataTableSortState | null | undefined,
): readonly TRow[] {
    if (!sortState) {
        return rows;
    }

    const column = columns.find((entry) => entry.key === sortState.columnKey);
    if (!column || !column.sortable || !column.sortValue) {
        return rows;
    }

    const direction = sortState.direction === 'desc' ? -1 : 1;
    return [...rows].sort((left, right) => {
        const leftValue = column.sortValue?.(left);
        const rightValue = column.sortValue?.(right);
        return comparePrimitive(leftValue, rightValue) * direction;
    });
}

export function GraphiteDataTable<TRow>({
    rows,
    columns,
    rowKey,
    ariaLabel,
    className,
    emptyState,
    emptyMessage = 'No rows.',
    rowClassName,
    renderRowActions,
    onRowClick,
    sortState,
    onSortStateChange,
}: GraphiteDataTableProps<TRow>) {
    const [uncontrolledSort, setUncontrolledSort] =
        useState<GraphiteDataTableSortState | null>(null);

    const activeSort = sortState ?? uncontrolledSort;

    const sortedRows = useMemo(
        () => sortGraphiteDataTableRows(rows, columns, activeSort),
        [rows, columns, activeSort],
    );

    const setSort = (next: GraphiteDataTableSortState | null) => {
        if (onSortStateChange) {
            onSortStateChange(next);
            return;
        }
        setUncontrolledSort(next);
    };

    return (
        <div
            className={cn(
                'overflow-hidden rounded-[var(--loop-radius-lg)] border border-border/80 bg-card/55 shadow-[var(--loop-elevation-level1)]',
                className,
            )}>
            <Table aria-label={ariaLabel}>
                <TableHeader>
                    <TableRow className='bg-background/75'>
                        {columns.map((column) => {
                            const isActive =
                                activeSort?.columnKey === column.key;
                            const arrow = !column.sortable
                                ? ''
                                : isActive
                                  ? activeSort?.direction === 'asc'
                                      ? ' ^'
                                      : ' v'
                                  : ' -';

                            return (
                                <TableHead
                                    key={column.key}
                                    className={cn(column.headerClassName)}>
                                    {column.sortable ? (
                                        <button
                                            type='button'
                                            className='inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground'
                                            onClick={() => {
                                                setSort(
                                                    getNextGraphiteDataTableSortState(
                                                        column.key,
                                                        activeSort,
                                                    ),
                                                );
                                            }}>
                                            {column.header}
                                            <span className='text-[10px]'>
                                                {arrow}
                                            </span>
                                        </button>
                                    ) : (
                                        <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                            {column.header}
                                        </span>
                                    )}
                                </TableHead>
                            );
                        })}
                        {renderRowActions ? (
                            <TableHead className='w-px text-right'>
                                <span className='sr-only'>Actions</span>
                            </TableHead>
                        ) : null}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedRows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={
                                    Math.max(
                                        1,
                                        columns.length +
                                            (renderRowActions ? 1 : 0),
                                    )
                                }
                                className='h-20 text-center text-sm text-muted-foreground'>
                                {emptyState ?? emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedRows.map((row, index) => (
                            <TableRow
                                key={rowKey(row, index)}
                                className={cn(
                                    onRowClick && 'cursor-pointer',
                                    rowClassName?.(row, index),
                                )}
                                onClick={
                                    onRowClick
                                        ? () => onRowClick(row, index)
                                        : undefined
                                }>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        className={cn(column.className)}>
                                        {column.cell
                                            ? column.cell(row)
                                            : column.value
                                              ? column.value(row)
                                              : null}
                                    </TableCell>
                                ))}
                                {renderRowActions ? (
                                    <TableCell className='w-px text-right'>
                                        <div
                                            className='flex justify-end gap-2'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                            }}>
                                            {renderRowActions(row, index)}
                                        </div>
                                    </TableCell>
                                ) : null}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
