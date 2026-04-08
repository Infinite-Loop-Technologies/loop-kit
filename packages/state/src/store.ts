import * as React from 'react';
import { diff, getUpdateKeys, patch, revise } from './patch.js';
import type { Update } from './types.js';

export type StateListener = () => void;

export type StateStoreOptions = {
    maxHistory?: number;
};

export type CommitOptions = {
    history?: boolean;
};

type HistoryEntry<T> = {
    forward: Update<T>;
    reverse: Update<T>;
};

export type StateStore<T> = {
    canRedo: () => boolean;
    canUndo: () => boolean;
    clearHistory: () => void;
    getState: () => T;
    redo: () => boolean;
    reset: (state: T) => void;
    setState: (state: T | ((state: T) => T), options?: CommitOptions) => T;
    subscribe: (listener: StateListener) => () => void;
    undo: () => boolean;
    update: (update: Update<T>, options?: CommitOptions) => T;
};

export function createStateStore<T>(initialState: T, options: StateStoreOptions = {}): StateStore<T> {
    let state = initialState;
    let past: HistoryEntry<T>[] = [];
    let future: HistoryEntry<T>[] = [];
    const listeners = new Set<StateListener>();
    const maxHistory = Math.max(0, options.maxHistory ?? 100);

    const emit = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    const commit = (nextState: T, recordHistory: boolean) => {
        if (Object.is(nextState, state)) {
            return state;
        }

        if (recordHistory) {
            const forward = diff(state, nextState);
            if (forward !== undefined && getUpdateKeys(forward).length > 0) {
                const reverse = revise(state, forward);
                past = [...past, { forward, reverse }];
                if (past.length > maxHistory) {
                    past = past.slice(past.length - maxHistory);
                }
                future = [];
            }
        }

        state = nextState;
        emit();
        return state;
    };

    return {
        canRedo: () => future.length > 0,
        canUndo: () => past.length > 0,
        clearHistory: () => {
            past = [];
            future = [];
            emit();
        },
        getState: () => state,
        redo: () => {
            const entry = future[future.length - 1];
            if (!entry) {
                return false;
            }
            future = future.slice(0, -1);
            past = [...past, entry];
            state = patch(state, entry.forward);
            emit();
            return true;
        },
        reset: (nextState: T) => {
            state = nextState;
            past = [];
            future = [];
            emit();
        },
        setState: (nextState, commitOptions) => {
            const resolved =
                typeof nextState === 'function'
                    ? (nextState as (state: T) => T)(state)
                    : nextState;
            return commit(resolved, commitOptions?.history !== false);
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        undo: () => {
            const entry = past[past.length - 1];
            if (!entry) {
                return false;
            }
            past = past.slice(0, -1);
            future = [...future, entry];
            state = patch(state, entry.reverse);
            emit();
            return true;
        },
        update: (update, commitOptions) => commit(patch(state, update), commitOptions?.history !== false),
    };
}

export function useStateStore<T>(initialState: T, options?: StateStoreOptions) {
    return React.useMemo(() => createStateStore(initialState, options), [initialState, options?.maxHistory]);
}

export function useStoreSelector<TState, TSelected>(
    store: StateStore<TState>,
    selector: (state: TState) => TSelected,
): TSelected {
    return React.useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState()),
        () => selector(store.getState()),
    );
}

export function useStoreState<TState>(store: StateStore<TState>) {
    return useStoreSelector(store, (state) => state);
}
