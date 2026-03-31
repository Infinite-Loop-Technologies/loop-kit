import * as React from 'react';

import type { DispatchIntentOptions, GraphState } from '@loop-kit/graphite';
import {
    useIntentShortcuts,
    type IntentShortcut,
} from '@loop-kit/graphite-react';
import {
    Button,
    Heading,
    Panel,
    Stack,
    Text,
} from '@loop-kit/loom-react';
import {
    createQueryBuilderModel,
    DataTable,
    QueryBuilder,
    evaluateQueryBuilder,
    summarizeQueryBuilder,
    type DataTableColumn,
    type QueryBuilderField,
    type QueryBuilderModel,
} from '@loop-kit/loom-pack-data';

export interface GraphiteIntentRegistryEntry<
    TState extends GraphState = GraphState,
    TPayload = unknown,
> {
    id: string;
    intent: string;
    title: string;
    description?: string;
    category?: string;
    keywords?: readonly string[];
    payload?: TPayload | ((state: Readonly<TState>) => TPayload);
    dispatchOptions?: DispatchIntentOptions<TState>;
}

export function resolveIntentPayload<
    TState extends GraphState = GraphState,
    TPayload = unknown,
>(
    entry: GraphiteIntentRegistryEntry<TState, TPayload>,
    state: Readonly<TState>,
): TPayload | undefined {
    if (typeof entry.payload === 'function') {
        return (entry.payload as (state: Readonly<TState>) => TPayload)(state);
    }
    return entry.payload;
}

export interface GraphiteShortcutBinding {
    id: string;
    shortcut: string;
    intentId: string;
    description?: string;
    preventDefault: boolean;
    enabled: boolean;
    when: QueryBuilderModel;
}

let shortcutBindingCounter = 0;

function nextShortcutBindingId() {
    shortcutBindingCounter += 1;
    return `shortcut_${Date.now().toString(36)}_${shortcutBindingCounter.toString(36)}`;
}

export function createShortcutBinding(
    intentId: string,
    shortcut = '',
): GraphiteShortcutBinding {
    return {
        id: nextShortcutBindingId(),
        shortcut,
        intentId,
        description: '',
        preventDefault: true,
        enabled: true,
        when: createQueryBuilderModel(),
    };
}

type UseGraphiteShortcutBindingsOptions<
    TState extends GraphState = GraphState,
> = {
    allowInEditable?: boolean;
    bindings: readonly GraphiteShortcutBinding[];
    contextSelector: (state: Readonly<TState>) => Record<string, unknown>;
    enabled?: boolean;
    intents: readonly GraphiteIntentRegistryEntry<TState>[];
};

export function useGraphiteShortcutBindings<
    TState extends GraphState = GraphState,
>({
    allowInEditable = false,
    bindings,
    contextSelector,
    enabled = true,
    intents,
}: UseGraphiteShortcutBindingsOptions<TState>) {
    const intentMap = React.useMemo(() => {
        const map = new Map<string, GraphiteIntentRegistryEntry<TState>>();
        for (const entry of intents) {
            map.set(entry.id, entry);
        }
        return map;
    }, [intents]);

    const shortcuts = React.useMemo(() => {
        const next: IntentShortcut<unknown, TState>[] = [];
        for (const binding of bindings) {
            if (!binding.enabled || !binding.shortcut.trim()) {
                continue;
            }
            const intent = intentMap.get(binding.intentId);
            if (!intent) {
                continue;
            }

            next.push({
                shortcut: binding.shortcut,
                intent: intent.intent,
                description: binding.description || intent.description,
                dispatchOptions: intent.dispatchOptions,
                payload: ({ state }: { state: Readonly<TState> }) =>
                    resolveIntentPayload(intent, state),
                preventDefault: binding.preventDefault,
                when: ({ state }: { state: Readonly<TState> }) =>
                    evaluateQueryBuilder(binding.when, contextSelector(state)),
            });
        }
        return next;
    }, [bindings, contextSelector, intentMap]);

    useIntentShortcuts(shortcuts, {
        enabled,
        allowInEditable,
    });

    return shortcuts;
}

export type ShortcutSettingsPanelProps<
    TState extends GraphState = GraphState,
> = {
    bindings: readonly GraphiteShortcutBinding[];
    className?: string;
    contextFields: readonly QueryBuilderField[];
    intents: readonly GraphiteIntentRegistryEntry<TState>[];
    onBindingsChange: (next: GraphiteShortcutBinding[]) => void;
};

export function ShortcutSettingsPanel<
    TState extends GraphState = GraphState,
>({
    bindings,
    className,
    contextFields,
    intents,
    onBindingsChange,
}: ShortcutSettingsPanelProps<TState>) {
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const selected = bindings.find((binding) => binding.id === selectedId) ?? null;

    const columns = React.useMemo<DataTableColumn<GraphiteShortcutBinding>[]>(
        () => [
            {
                key: 'shortcut',
                header: 'Shortcut',
                sortable: true,
                sortValue: (row: GraphiteShortcutBinding) => row.shortcut,
                cell: (row: GraphiteShortcutBinding) => row.shortcut || 'unset',
            },
            {
                key: 'intent',
                header: 'Intent',
                sortable: true,
                sortValue: (row: GraphiteShortcutBinding) => row.intentId,
                cell: (row: GraphiteShortcutBinding) =>
                    intents.find((entry) => entry.id === row.intentId)?.title ?? row.intentId,
            },
            {
                key: 'when',
                header: 'When',
                sortable: true,
                sortValue: (row: GraphiteShortcutBinding) => row.when.rules.length,
                cell: (row: GraphiteShortcutBinding) => summarizeQueryBuilder(row.when),
            },
            {
                key: 'enabled',
                header: 'Enabled',
                sortable: true,
                sortValue: (row: GraphiteShortcutBinding) => Number(row.enabled),
                cell: (row: GraphiteShortcutBinding) => (row.enabled ? 'yes' : 'no'),
            },
        ],
        [intents],
    );

    const addBinding = () => {
        const firstIntent = intents[0];
        if (!firstIntent) {
            return;
        }
        const created = createShortcutBinding(firstIntent.id);
        onBindingsChange([...bindings, created]);
        setSelectedId(created.id);
    };

    const updateSelected = (updater: (binding: GraphiteShortcutBinding) => GraphiteShortcutBinding) => {
        if (!selected) {
            return;
        }
        onBindingsChange(
            bindings.map((binding) => (binding.id === selected.id ? updater(binding) : binding)),
        );
    };

    return (
        <Stack className={className} gap='3'>
            <InlineHeader
                onAdd={addBinding}
                title='Shortcut Browser'
                subtitle='Map shortcuts to registered Graphite intents with optional query-based conditions.'
            />

            <DataTable
                columns={columns}
                emptyMessage='No shortcuts configured.'
                rows={bindings}
            />

            {selected ? (
                <Panel emphasis='subtle'>
                    <Stack gap='3'>
                        <Heading level={3} size='sm'>
                            Edit {selected.shortcut || selected.intentId}
                        </Heading>
                        <Text size='sm'>Intent: {selected.intentId}</Text>
                        <QueryBuilder
                            fields={contextFields}
                            onChange={(next: QueryBuilderModel) =>
                                updateSelected((binding) => ({
                                    ...binding,
                                    when: next,
                                }))
                            }
                            value={selected.when}
                        />
                        <Button
                            kind='outline'
                            onClick={() =>
                                onBindingsChange(bindings.filter((binding) => binding.id !== selected.id))
                            }
                            type='button'>
                            Remove shortcut
                        </Button>
                    </Stack>
                </Panel>
            ) : (
                <Panel emphasis='subtle'>
                    <Text tone='muted'>Select a shortcut to inspect its condition builder.</Text>
                </Panel>
            )}

            <Stack gap='2'>
                {bindings.map((binding) => (
                    <button
                        key={binding.id}
                        onClick={() => setSelectedId(binding.id)}
                        style={{
                            background: binding.id === selectedId ? 'var(--loom-color-surface-overlay)' : 'transparent',
                            border: '1px solid var(--loom-color-border)',
                            borderRadius: 'var(--loom-radius-md)',
                            cursor: 'pointer',
                            font: 'inherit',
                            padding: '0.75rem',
                            textAlign: 'left',
                        }}
                        type='button'>
                        <strong>{binding.shortcut || 'unset'}</strong>
                        <div>{intents.find((entry) => entry.id === binding.intentId)?.title ?? binding.intentId}</div>
                    </button>
                ))}
            </Stack>
        </Stack>
    );
}

function InlineHeader({
    onAdd,
    subtitle,
    title,
}: {
    onAdd: () => void;
    subtitle: string;
    title: string;
}) {
    return (
        <Stack gap='2'>
            <Heading level={2} size='md'>
                {title}
            </Heading>
            <Text tone='muted'>{subtitle}</Text>
            <Button kind='outline' onClick={onAdd} type='button'>
                Add shortcut
            </Button>
        </Stack>
    );
}
