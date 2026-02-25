'use client';

import { useMemo, useState, type ReactNode } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

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

type GraphiteDataTableProps<TRow> = {
    rows: readonly TRow[];
    columns: readonly GraphiteDataTableColumn<TRow>[];
    rowKey: (row: TRow, index: number) => string;
    className?: string;
    emptyMessage?: string;
    rowClassName?: (row: TRow, index: number) => string | undefined;
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

export function GraphiteDataTable<TRow>({
    rows,
    columns,
    rowKey,
    className,
    emptyMessage = 'No rows.',
    rowClassName,
    onRowClick,
    sortState,
    onSortStateChange,
}: GraphiteDataTableProps<TRow>) {
    const [uncontrolledSort, setUncontrolledSort] =
        useState<GraphiteDataTableSortState | null>(null);

    const activeSort = sortState ?? uncontrolledSort;

    const sortedRows = useMemo(() => {
        if (!activeSort) return rows;
        const column = columns.find(
            (entry) => entry.key === activeSort.columnKey,
        );
        if (!column || !column.sortable || !column.sortValue) {
            return rows;
        }

        const direction = activeSort.direction === 'desc' ? -1 : 1;
        return [...rows].sort((left, right) => {
            const leftValue = column.sortValue?.(left);
            const rightValue = column.sortValue?.(right);
            return comparePrimitive(leftValue, rightValue) * direction;
        });
    }, [rows, columns, activeSort]);

    const setSort = (next: GraphiteDataTableSortState | null) => {
        if (onSortStateChange) {
            onSortStateChange(next);
            return;
        }
        setUncontrolledSort(next);
    };

    return (
        <div className={cn('rounded-xl border bg-card/40', className)}>
            <Table>
                <TableHeader>
                    <TableRow>
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
                                                if (!isActive) {
                                                    setSort({
                                                        columnKey: column.key,
                                                        direction: 'asc',
                                                    });
                                                    return;
                                                }

                                                if (
                                                    activeSort.direction ===
                                                    'asc'
                                                ) {
                                                    setSort({
                                                        columnKey: column.key,
                                                        direction: 'desc',
                                                    });
                                                    return;
                                                }

                                                setSort(null);
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedRows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={Math.max(1, columns.length)}
                                className='h-20 text-center text-sm text-muted-foreground'>
                                {emptyMessage}
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
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
