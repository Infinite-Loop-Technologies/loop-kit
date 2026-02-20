'use client';

import { useEffect, useMemo, useState } from 'react';
import type { GraphState } from '@loop-kit/graphite';
import { useGraphite, useIntent } from '@loop-kit/graphite/react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from '@/components/ui/command';
import {
    buildIntentSearchText,
    resolveIntentPayload,
    type GraphiteIntentRegistryEntry,
} from './graphite-intent-registry';

type GraphiteIntentCommandMenuProps<TState extends GraphState = GraphState> = {
    intents: readonly GraphiteIntentRegistryEntry<TState>[];
    enabled?: boolean;
    openShortcut?: string;
    className?: string;
};

function matchesModShortcut(event: KeyboardEvent, shortcut: string) {
    const normalized = shortcut.trim().toLowerCase();
    if (normalized !== 'mod+k') return false;
    const key = event.key.toLowerCase();
    return key === 'k' && (event.ctrlKey || event.metaKey);
}

export function GraphiteIntentCommandMenu<
    TState extends GraphState = GraphState,
>({
    intents,
    enabled = true,
    openShortcut = 'mod+k',
    className,
}: GraphiteIntentCommandMenuProps<TState>) {
    const store = useGraphite<TState>();
    const dispatchIntent = useIntent<TState>();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (!matchesModShortcut(event, openShortcut)) return;
            if (event.cancelable) {
                event.preventDefault();
            }
            event.stopPropagation();
            event.stopImmediatePropagation();
            setOpen((prev) => !prev);
        };

        window.addEventListener('keydown', onKeyDown, { capture: true });
        return () => {
            window.removeEventListener('keydown', onKeyDown, { capture: true });
        };
    }, [enabled, openShortcut]);

    const grouped = useMemo(() => {
        const map = new Map<string, GraphiteIntentRegistryEntry<TState>[]>();
        const sorted = [...intents].sort((left, right) =>
            left.title.localeCompare(right.title),
        );

        for (const entry of sorted) {
            const key = entry.category?.trim() || 'General';
            const list = map.get(key) ?? [];
            list.push(entry);
            map.set(key, list);
        }

        return [...map.entries()];
    }, [intents]);

    const execute = (entry: GraphiteIntentRegistryEntry<TState>) => {
        const payload = resolveIntentPayload(entry, store.getState());
        dispatchIntent(entry.intent, payload);
        setOpen(false);
    };

    return (
        <CommandDialog
            open={open}
            onOpenChange={setOpen}
            className={className}
            title='Intent Command Menu'
            description='Search and dispatch registered intents.'>
            <CommandInput placeholder='Search intents...' />
            <CommandList>
                <CommandEmpty>No matching intents.</CommandEmpty>
                {grouped.map(([groupName, entries]) => (
                    <CommandGroup key={groupName} heading={groupName}>
                        {entries.map((entry) => (
                            <CommandItem
                                key={entry.id}
                                value={`${entry.title} ${buildIntentSearchText(entry)}`}
                                onSelect={() => execute(entry)}>
                                <div className='flex min-w-0 flex-1 flex-col'>
                                    <span className='truncate'>
                                        {entry.title}
                                    </span>
                                    {entry.description ? (
                                        <span className='truncate text-xs text-muted-foreground'>
                                            {entry.description}
                                        </span>
                                    ) : null}
                                </div>
                                <CommandShortcut>
                                    {entry.intent}
                                </CommandShortcut>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                ))}
            </CommandList>
        </CommandDialog>
    );
}
