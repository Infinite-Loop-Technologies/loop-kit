'use client';

import { useMemo, useState } from 'react';
import type { GraphState } from '@loop-kit/graphite';
import {
    useIntentShortcuts,
    type IntentShortcut,
} from '@loop-kit/graphite/react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    createQueryBuilderModel,
    evaluateQueryBuilder,
    GraphiteQueryBuilder,
    summarizeQueryBuilder,
    type QueryBuilderField,
    type QueryBuilderModel,
} from './graphite-query-builder';
import {
    resolveIntentPayload,
    type GraphiteIntentRegistryEntry,
} from './graphite-intent-registry';
import {
    GraphiteDataTable,
    type GraphiteDataTableColumn,
} from './graphite-data-table';

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
    intents: readonly GraphiteIntentRegistryEntry<TState>[];
    bindings: readonly GraphiteShortcutBinding[];
    contextSelector: (state: Readonly<TState>) => Record<string, unknown>;
    enabled?: boolean;
};

export function useGraphiteShortcutBindings<
    TState extends GraphState = GraphState,
>({
    intents,
    bindings,
    contextSelector,
    enabled = true,
}: UseGraphiteShortcutBindingsOptions<TState>) {
    const intentMap = useMemo(() => {
        const map = new Map<string, GraphiteIntentRegistryEntry<TState>>();
        for (const entry of intents) {
            map.set(entry.id, entry);
        }
        return map;
    }, [intents]);

    const shortcuts = useMemo(() => {
        const next: IntentShortcut<unknown, TState>[] = [];
        for (const binding of bindings) {
            if (!binding.enabled || !binding.shortcut.trim()) continue;
            const intent = intentMap.get(binding.intentId);
            if (!intent) continue;

            next.push({
                shortcut: binding.shortcut,
                intent: intent.intent,
                description: binding.description || intent.description,
                payload: (context: { state: Readonly<TState> }) =>
                    resolveIntentPayload(intent, context.state),
                preventDefault: binding.preventDefault,
                when: (context: { state: Readonly<TState> }) =>
                    evaluateQueryBuilder(
                        binding.when,
                        contextSelector(context.state),
                    ),
            });
        }
        return next;
    }, [bindings, intentMap, contextSelector]);

    useIntentShortcuts(shortcuts, {
        enabled,
    });

    return shortcuts;
}

type GraphiteShortcutManagerProps<TState extends GraphState = GraphState> = {
    intents: readonly GraphiteIntentRegistryEntry<TState>[];
    bindings: readonly GraphiteShortcutBinding[];
    onBindingsChange: (next: GraphiteShortcutBinding[]) => void;
    contextFields: readonly QueryBuilderField[];
    className?: string;
};

export function GraphiteShortcutManager<
    TState extends GraphState = GraphState,
>({
    intents,
    bindings,
    onBindingsChange,
    contextFields,
    className,
}: GraphiteShortcutManagerProps<TState>) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedBinding =
        bindings.find((binding) => binding.id === selectedId) ?? null;

    const updateBinding = (
        bindingId: string,
        updater: (binding: GraphiteShortcutBinding) => GraphiteShortcutBinding,
    ) => {
        onBindingsChange(
            bindings.map((binding) =>
                binding.id === bindingId ? updater(binding) : binding,
            ),
        );
    };

    const removeBinding = (bindingId: string) => {
        onBindingsChange(
            bindings.filter((binding) => binding.id !== bindingId),
        );
        if (selectedId === bindingId) {
            setSelectedId(null);
        }
    };

    const columns: GraphiteDataTableColumn<GraphiteShortcutBinding>[] = [
        {
            key: 'shortcut',
            header: 'Shortcut',
            sortable: true,
            sortValue: (row) => row.shortcut,
            cell: (row) => (
                <input
                    className='h-8 w-full rounded border border-input bg-background px-2 text-sm'
                    value={row.shortcut}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                        updateBinding(row.id, (current) => ({
                            ...current,
                            shortcut: event.target.value,
                        }))
                    }
                    placeholder='alt+shift+n'
                />
            ),
        },
        {
            key: 'intent',
            header: 'Intent',
            sortable: true,
            sortValue: (row) => row.intentId,
            cell: (row) => (
                <select
                    className='h-8 w-full rounded border border-input bg-background px-2 text-sm'
                    value={row.intentId}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                        updateBinding(row.id, (current) => ({
                            ...current,
                            intentId: event.target.value,
                        }))
                    }>
                    {intents.map((intent) => (
                        <option key={intent.id} value={intent.id}>
                            {intent.title}
                        </option>
                    ))}
                </select>
            ),
        },
        {
            key: 'when',
            header: 'When',
            sortable: true,
            sortValue: (row) => row.when.rules.length,
            cell: (row) => (
                <button
                    type='button'
                    className='text-left text-sm text-muted-foreground hover:text-foreground'
                    onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(row.id);
                    }}>
                    {summarizeQueryBuilder(row.when)}
                </button>
            ),
        },
        {
            key: 'prevent',
            header: 'Prevent Browser Default',
            sortable: true,
            sortValue: (row) => Number(row.preventDefault),
            cell: (row) => (
                <div className='flex items-center justify-center'>
                    <input
                        type='checkbox'
                        checked={row.preventDefault}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                            updateBinding(row.id, (current) => ({
                                ...current,
                                preventDefault: event.target.checked,
                            }))
                        }
                    />
                </div>
            ),
        },
        {
            key: 'enabled',
            header: 'Enabled',
            sortable: true,
            sortValue: (row) => Number(row.enabled),
            cell: (row) => (
                <div className='flex items-center justify-center'>
                    <input
                        type='checkbox'
                        checked={row.enabled}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                            updateBinding(row.id, (current) => ({
                                ...current,
                                enabled: event.target.checked,
                            }))
                        }
                    />
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
                <Button
                    type='button'
                    size='sm'
                    variant='ghost'
                    onClick={(event) => {
                        event.stopPropagation();
                        removeBinding(row.id);
                    }}>
                    Remove
                </Button>
            ),
        },
    ];

    const addBinding = () => {
        const firstIntent = intents[0];
        if (!firstIntent) return;
        const created = createShortcutBinding(firstIntent.id);
        onBindingsChange([...bindings, created]);
        setSelectedId(created.id);
    };

    return (
        <section className={className}>
            <div className='mb-3 flex items-center justify-between gap-3'>
                <div>
                    <h3 className='text-base font-semibold'>
                        Shortcut Manager
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                        Configure shortcut -&gt; intent mappings with optional
                        dynamic when clauses.
                    </p>
                </div>
                <Button type='button' size='sm' onClick={addBinding}>
                    Add shortcut
                </Button>
            </div>

            <GraphiteDataTable
                rows={bindings}
                columns={columns}
                rowKey={(row) => row.id}
                emptyMessage='No shortcut bindings yet.'
                onRowClick={(row) => setSelectedId(row.id)}
                rowClassName={(row) =>
                    row.id === selectedId ? 'bg-muted/40' : undefined
                }
            />

            {selectedBinding ? (
                <div className='mt-3 rounded-xl border bg-card/40 p-3'>
                    <Label className='mb-2 block text-xs uppercase tracking-wide text-muted-foreground'>
                        When clause for{' '}
                        {selectedBinding.shortcut || selectedBinding.intentId}
                    </Label>
                    <GraphiteQueryBuilder
                        fields={contextFields}
                        value={selectedBinding.when}
                        onChange={(next) =>
                            updateBinding(selectedBinding.id, (current) => ({
                                ...current,
                                when: next,
                            }))
                        }
                    />
                </div>
            ) : null}
        </section>
    );
}
