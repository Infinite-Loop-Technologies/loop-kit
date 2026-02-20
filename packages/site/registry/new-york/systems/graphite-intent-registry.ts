import type { GraphState } from '@loop-kit/graphite';

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

export function buildIntentSearchText<
    TState extends GraphState = GraphState,
    TPayload = unknown,
>(entry: GraphiteIntentRegistryEntry<TState, TPayload>): string {
    return [
        entry.title,
        entry.description ?? '',
        entry.intent,
        entry.category ?? '',
        ...(entry.keywords ?? []),
    ]
        .join(' ')
        .trim()
        .toLowerCase();
}
