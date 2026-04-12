import * as React from 'react';

import { useScopedShortcutMap } from '@loop-kit/interaction-react';
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

export interface ActionRegistryEntry<TContext extends Record<string, unknown> = Record<string, unknown>, TPayload = unknown> {
    actionId: string;
    category?: string;
    description?: string;
    id: string;
    keywords?: readonly string[];
    payload?: TPayload | ((context: Readonly<TContext>) => TPayload);
    title: string;
}

export type GraphiteIntentRegistryEntry<TContext extends Record<string, unknown> = Record<string, unknown>, TPayload = unknown> =
    ActionRegistryEntry<TContext, TPayload>;

export function resolveActionPayload<TContext extends Record<string, unknown>, TPayload>(
    entry: ActionRegistryEntry<TContext, TPayload>,
    context: Readonly<TContext>,
): TPayload | undefined {
    if (typeof entry.payload === 'function') {
        return (entry.payload as (context: Readonly<TContext>) => TPayload)(context);
    }
    return entry.payload;
}

export interface ShortcutBinding {
    actionEntryId: string;
    description?: string;
    enabled: boolean;
    id: string;
    preventDefault: boolean;
    shortcut: string;
    when: QueryBuilderModel;
}

export type GraphiteShortcutBinding = ShortcutBinding;

let shortcutBindingCounter = 0;

function nextShortcutBindingId() {
    shortcutBindingCounter += 1;
    return `shortcut_${Date.now().toString(36)}_${shortcutBindingCounter.toString(36)}`;
}

export function createShortcutBinding(actionEntryId: string, shortcut = ''): ShortcutBinding {
    return {
        actionEntryId,
        id: nextShortcutBindingId(),
        description: '',
        enabled: true,
        preventDefault: true,
        shortcut,
        when: createQueryBuilderModel(),
    };
}

type UseShortcutBindingsOptions<TContext extends Record<string, unknown> = Record<string, unknown>> = {
    bindings: readonly ShortcutBinding[];
    context: TContext;
    enabled?: boolean;
    entries: readonly ActionRegistryEntry<TContext>[];
};

export function useShortcutBindings<TContext extends Record<string, unknown> = Record<string, unknown>>({
    bindings,
    context,
    enabled = true,
    entries,
}: UseShortcutBindingsOptions<TContext>) {
    const entryMap = React.useMemo(() => {
        const map = new Map<string, ActionRegistryEntry<TContext>>();
        for (const entry of entries) {
            map.set(entry.id, entry);
        }
        return map;
    }, [entries]);

    const shortcuts = React.useMemo(
        () =>
            bindings
                .filter((binding) => binding.enabled && binding.shortcut.trim())
                .map((binding) => {
                    const entry = entryMap.get(binding.actionEntryId);
                    if (!entry) {
                        return null;
                    }
                    return {
                        actionId: entry.actionId,
                        description: binding.description || entry.description,
                        enabled,
                        gesture: binding.shortcut,
                        payload: resolveActionPayload(entry, context),
                        when: () => evaluateQueryBuilder(binding.when, context),
                    };
                })
                .filter((binding): binding is NonNullable<typeof binding> => binding != null),
        [bindings, context, enabled, entryMap],
    );

    useScopedShortcutMap(shortcuts);
    return shortcuts;
}

export const useGraphiteShortcutBindings = useShortcutBindings;

export type ShortcutSettingsPanelProps<TContext extends Record<string, unknown> = Record<string, unknown>> = {
    bindings: readonly ShortcutBinding[];
    className?: string;
    contextFields: readonly QueryBuilderField[];
    entries: readonly ActionRegistryEntry<TContext>[];
    onBindingsChange: (next: ShortcutBinding[]) => void;
};

export function ShortcutSettingsPanel<TContext extends Record<string, unknown> = Record<string, unknown>>({
    bindings,
    className,
    contextFields,
    entries,
    onBindingsChange,
}: ShortcutSettingsPanelProps<TContext>) {
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const selected = bindings.find((binding) => binding.id === selectedId) ?? null;

    const columns = React.useMemo<DataTableColumn<ShortcutBinding>[]>(
        () => [
            {
                key: 'shortcut',
                header: 'Shortcut',
                sortable: true,
                sortValue: (row) => row.shortcut,
                cell: (row) => row.shortcut || 'unset',
            },
            {
                key: 'action',
                header: 'Action',
                sortable: true,
                sortValue: (row) => row.actionEntryId,
                cell: (row) =>
                    entries.find((entry) => entry.id === row.actionEntryId)?.title ?? row.actionEntryId,
            },
            {
                key: 'when',
                header: 'When',
                sortable: true,
                sortValue: (row) => row.when.rules.length,
                cell: (row) => summarizeQueryBuilder(row.when),
            },
            {
                key: 'enabled',
                header: 'Enabled',
                sortable: true,
                sortValue: (row) => Number(row.enabled),
                cell: (row) => (row.enabled ? 'yes' : 'no'),
            },
        ],
        [entries],
    );

    const addBinding = () => {
        const firstEntry = entries[0];
        if (!firstEntry) {
            return;
        }
        const created = createShortcutBinding(firstEntry.id);
        onBindingsChange([...bindings, created]);
        setSelectedId(created.id);
    };

    const updateSelected = (updater: (binding: ShortcutBinding) => ShortcutBinding) => {
        if (!selected) {
            return;
        }
        onBindingsChange(bindings.map((binding) => (binding.id === selected.id ? updater(binding) : binding)));
    };

    return (
        <Stack className={className} gap='3'>
            <InlineHeader
                onAdd={addBinding}
                subtitle='Map shortcuts to registered interaction actions with optional query-based conditions.'
                title='Shortcut Browser'
            />

            <DataTable columns={columns} emptyMessage='No shortcuts configured.' rows={bindings} />

            {selected ? (
                <Panel emphasis='subtle'>
                    <Stack gap='3'>
                        <Heading level={3} size='sm'>
                            Edit {selected.shortcut || selected.actionEntryId}
                        </Heading>
                        <Text size='sm'>Action: {selected.actionEntryId}</Text>
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
                            onClick={() => onBindingsChange(bindings.filter((binding) => binding.id !== selected.id))}
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
                    <Button
                        key={binding.id}
                        kind={binding.id === selectedId ? 'solid' : 'outline'}
                        onClick={() => setSelectedId(binding.id)}
                        style={{
                            padding: '0.75rem',
                            textAlign: 'left',
                            width: '100%',
                        }}
                        tone={binding.id === selectedId ? 'accent' : 'neutral'}
                        type='button'>
                        <Stack gap='1'>
                            <Text as='span' emphasis='strong' size='sm'>
                                {binding.shortcut || 'unset'}
                            </Text>
                            <Text as='span' size='sm' tone='muted'>
                                {entries.find((entry) => entry.id === binding.actionEntryId)?.title ?? binding.actionEntryId}
                            </Text>
                        </Stack>
                    </Button>
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
