import * as React from 'react';

import {
    Button,
    Inline,
    Input,
    Panel,
    Select,
    Stack,
    Table,
    Text,
    type TableColumn,
} from '@loop-kit/loom-react';

export type QueryBuilderFieldType = 'string' | 'number' | 'boolean';

export type QueryBuilderOperator =
    | 'eq'
    | 'neq'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'truthy'
    | 'falsy';

export interface QueryBuilderField {
    key: string;
    label: string;
    type: QueryBuilderFieldType;
    operators?: readonly QueryBuilderOperator[];
}

export interface QueryBuilderRule {
    id: string;
    field: string;
    operator: QueryBuilderOperator;
    value: string;
}

export interface QueryBuilderModel {
    mode: 'all' | 'any';
    rules: QueryBuilderRule[];
}

const DEFAULT_OPERATORS: Record<QueryBuilderFieldType, readonly QueryBuilderOperator[]> = {
    string: ['contains', 'eq', 'neq', 'startsWith', 'endsWith', 'truthy', 'falsy'],
    number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'truthy', 'falsy'],
    boolean: ['eq', 'neq', 'truthy', 'falsy'],
};

let queryBuilderRuleCounter = 0;

function nextRuleId() {
    queryBuilderRuleCounter += 1;
    return `rule_${Date.now().toString(36)}_${queryBuilderRuleCounter.toString(36)}`;
}

export function createQueryBuilderModel(): QueryBuilderModel {
    return {
        mode: 'all',
        rules: [],
    };
}

export function createQueryBuilderRule(
    field: string,
    operator: QueryBuilderOperator = 'contains',
    value = '',
): QueryBuilderRule {
    return {
        id: nextRuleId(),
        field,
        operator,
        value,
    };
}

function parseNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function getFieldValue(record: Record<string, unknown>, field: string): unknown {
    const segments = field.split('.');
    let current: unknown = record;

    for (const segment of segments) {
        if (!current || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[segment];
    }

    return current;
}

function comparableValue(value: unknown) {
    if (typeof value === 'string') return value.toLowerCase();
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value;
    return String(value ?? '').toLowerCase();
}

function evaluateRule(rule: QueryBuilderRule, record: Record<string, unknown>): boolean {
    const actual = getFieldValue(record, rule.field);
    const text = rule.value.trim();

    switch (rule.operator) {
        case 'truthy':
            return Boolean(actual);
        case 'falsy':
            return !actual;
        case 'contains':
            return String(actual ?? '').toLowerCase().includes(text.toLowerCase());
        case 'startsWith':
            return String(actual ?? '').toLowerCase().startsWith(text.toLowerCase());
        case 'endsWith':
            return String(actual ?? '').toLowerCase().endsWith(text.toLowerCase());
        case 'gt':
        case 'gte':
        case 'lt':
        case 'lte': {
            const left = parseNumber(actual);
            const right = parseNumber(text);
            if (left === null || right === null) {
                return false;
            }
            if (rule.operator === 'gt') return left > right;
            if (rule.operator === 'gte') return left >= right;
            if (rule.operator === 'lt') return left < right;
            return left <= right;
        }
        case 'neq':
            return comparableValue(actual) !== comparableValue(text);
        case 'eq':
        default:
            return comparableValue(actual) === comparableValue(text);
    }
}

export function evaluateQueryBuilder(
    model: QueryBuilderModel,
    record: Record<string, unknown>,
): boolean {
    if (model.rules.length <= 0) {
        return true;
    }
    if (model.mode === 'any') {
        return model.rules.some((rule) => evaluateRule(rule, record));
    }
    return model.rules.every((rule) => evaluateRule(rule, record));
}

export function summarizeQueryBuilder(model: QueryBuilderModel): string {
    if (model.rules.length <= 0) {
        return 'always';
    }
    return `${model.mode === 'all' ? 'all' : 'any'} of ${model.rules.length} rule${model.rules.length === 1 ? '' : 's'}`;
}

function operatorLabel(operator: QueryBuilderOperator) {
    switch (operator) {
        case 'eq':
            return 'equals';
        case 'neq':
            return 'not equals';
        case 'contains':
            return 'contains';
        case 'startsWith':
            return 'starts with';
        case 'endsWith':
            return 'ends with';
        case 'gt':
            return '>';
        case 'gte':
            return '>=';
        case 'lt':
            return '<';
        case 'lte':
            return '<=';
        case 'truthy':
            return 'is truthy';
        case 'falsy':
            return 'is falsy';
        default:
            return operator;
    }
}

export type QueryBuilderProps = {
    className?: string;
    fields: readonly QueryBuilderField[];
    onChange: (next: QueryBuilderModel) => void;
    value: QueryBuilderModel;
};

export function QueryBuilder({ className, fields, onChange, value }: QueryBuilderProps) {
    const fieldMap = React.useMemo(() => {
        const map = new Map<string, QueryBuilderField>();
        for (const field of fields) {
            map.set(field.key, field);
        }
        return map;
    }, [fields]);

    const fallbackField = fields[0];

    const addRule = () => {
        if (!fallbackField) {
            return;
        }
        const operators = fallbackField.operators ?? DEFAULT_OPERATORS[fallbackField.type];
        onChange({
            ...value,
            rules: [
                ...value.rules,
                createQueryBuilderRule(fallbackField.key, operators[0] ?? 'contains'),
            ],
        });
    };

    return (
        <Stack className={className} gap='3'>
            <Inline align='center' gap='2'>
                <Text as='span' size='sm' emphasis='strong'>
                    Match
                </Text>
                <Select
                    onChange={(event) =>
                        onChange({
                            ...value,
                            mode: event.currentTarget.value === 'any' ? 'any' : 'all',
                        })
                    }
                    options={[
                        { label: 'All rules', value: 'all' },
                        { label: 'Any rule', value: 'any' },
                    ]}
                    value={value.mode}
                />
                <Button kind='outline' onClick={addRule} type='button'>
                    Add rule
                </Button>
            </Inline>

            {value.rules.length <= 0 ? (
                <Panel emphasis='subtle'>
                    <Text tone='muted'>No rules configured.</Text>
                </Panel>
            ) : (
                <Stack gap='2'>
                    {value.rules.map((rule) => {
                        const field = fieldMap.get(rule.field) ?? fallbackField;
                        if (!field) {
                            return null;
                        }
                        const operators = field.operators ?? DEFAULT_OPERATORS[field.type];
                        const hidesValue = rule.operator === 'truthy' || rule.operator === 'falsy';

                        return (
                            <Panel key={rule.id} emphasis='subtle'>
                                <Stack gap='2'>
                                    <Select
                                        onChange={(event) => {
                                            const nextField = fieldMap.get(event.currentTarget.value) ?? fallbackField;
                                            if (!nextField) {
                                                return;
                                            }
                                            const nextOperators = nextField.operators ?? DEFAULT_OPERATORS[nextField.type];
                                            onChange({
                                                ...value,
                                                rules: value.rules.map((entry) =>
                                                    entry.id === rule.id
                                                        ? {
                                                              ...entry,
                                                              field: nextField.key,
                                                              operator: nextOperators[0] ?? 'contains',
                                                          }
                                                        : entry,
                                                ),
                                            });
                                        }}
                                        options={fields.map((entry) => ({
                                            label: entry.label,
                                            value: entry.key,
                                        }))}
                                        value={rule.field}
                                    />
                                    <Select
                                        onChange={(event) =>
                                            onChange({
                                                ...value,
                                                rules: value.rules.map((entry) =>
                                                    entry.id === rule.id
                                                        ? {
                                                              ...entry,
                                                              operator:
                                                                  event.currentTarget
                                                                      .value as QueryBuilderOperator,
                                                          }
                                                        : entry,
                                                ),
                                            })
                                        }
                                        options={operators.map((operator) => ({
                                            label: operatorLabel(operator),
                                            value: operator,
                                        }))}
                                        value={rule.operator}
                                    />
                                    <Input
                                        disabled={hidesValue}
                                        onChange={(event) =>
                                            onChange({
                                                ...value,
                                                rules: value.rules.map((entry) =>
                                                    entry.id === rule.id
                                                        ? {
                                                              ...entry,
                                                              value: event.currentTarget.value,
                                                          }
                                                        : entry,
                                                ),
                                            })
                                        }
                                        placeholder={hidesValue ? 'No value needed' : 'Value'}
                                        value={rule.value}
                                    />
                                    <Button
                                        kind='ghost'
                                        onClick={() =>
                                            onChange({
                                                ...value,
                                                rules: value.rules.filter((entry) => entry.id !== rule.id),
                                            })
                                        }
                                        type='button'>
                                        Remove
                                    </Button>
                                </Stack>
                            </Panel>
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
}

export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableSortState {
    columnKey: string;
    direction: DataTableSortDirection;
}

export interface DataTableColumn<TRow> {
    cell?: (row: TRow) => React.ReactNode;
    header: string;
    key: string;
    sortValue?: (row: TRow) => string | number | boolean | Date | null | undefined;
    sortable?: boolean;
}

export type DataTableProps<TRow> = {
    className?: string;
    columns: readonly DataTableColumn<TRow>[];
    emptyMessage?: string;
    onSortStateChange?: (next: DataTableSortState | null) => void;
    rows: readonly TRow[];
    sortState?: DataTableSortState | null;
};

function comparePrimitive(left: unknown, right: unknown) {
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
    return leftText < rightText ? -1 : 1;
}

export function getNextDataTableSortState(
    columnKey: string,
    activeSort: DataTableSortState | null | undefined,
): DataTableSortState | null {
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

export function sortDataTableRows<TRow>(
    rows: readonly TRow[],
    columns: readonly DataTableColumn<TRow>[],
    sortState: DataTableSortState | null | undefined,
) {
    if (!sortState) {
        return rows;
    }
    const column = columns.find((entry) => entry.key === sortState.columnKey);
    if (!column?.sortable || !column.sortValue) {
        return rows;
    }

    const direction = sortState.direction === 'desc' ? -1 : 1;
    return [...rows].sort((left, right) => {
        return comparePrimitive(column.sortValue?.(left), column.sortValue?.(right)) * direction;
    });
}

export function DataTable<TRow>({
    className,
    columns,
    emptyMessage = 'No rows.',
    onSortStateChange,
    rows,
    sortState,
}: DataTableProps<TRow>) {
    const [internalSort, setInternalSort] = React.useState<DataTableSortState | null>(null);
    const activeSort = sortState ?? internalSort;
    const sortedRows = React.useMemo(
        () => sortDataTableRows(rows, columns, activeSort),
        [activeSort, columns, rows],
    );

    const tableColumns: TableColumn<TRow>[] = columns.map((column) => ({
        key: column.key,
        header: (
            <button
                onClick={() => {
                    if (!column.sortable) {
                        return;
                    }
                    const next = getNextDataTableSortState(column.key, activeSort);
                    if (onSortStateChange) {
                        onSortStateChange(next);
                        return;
                    }
                    setInternalSort(next);
                }}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: column.sortable ? 'pointer' : 'default',
                    font: 'inherit',
                    padding: 0,
                }}
                type='button'>
                {column.header}
            </button>
        ),
        cell: (row) => (column.cell ? column.cell(row) : null),
    }));

    return sortedRows.length <= 0 ? (
        <Panel className={className} emphasis='subtle'>
            <Text tone='muted'>{emptyMessage}</Text>
        </Panel>
    ) : (
        <Table className={className} columns={tableColumns} rows={sortedRows} />
    );
}
