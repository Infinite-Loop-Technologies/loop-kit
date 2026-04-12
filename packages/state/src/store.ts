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

export type StateSliceOptions<TState, TSlice> = {
    maxHistory?: number;
    replace: (state: TState, slice: TSlice) => TState;
    select: (state: TState) => TSlice;
};

type StateSliceHistoryEntry<TSlice> = {
    forward: Update<TSlice>;
    reverse: Update<TSlice>;
};

export type StateSlice<TState, TSlice> = {
    canRedo: () => boolean;
    canUndo: () => boolean;
    clearHistory: () => void;
    getState: () => TSlice;
    redo: () => boolean;
    setState: (state: TSlice | ((state: TSlice) => TSlice), options?: CommitOptions) => TSlice;
    subscribe: (listener: StateListener) => () => void;
    undo: () => boolean;
    update: (update: Update<TSlice>, options?: CommitOptions) => TSlice;
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
    isEqual: (left: TSelected, right: TSelected) => boolean = Object.is,
): TSelected {
    const cacheRef = React.useRef<{ hasValue: boolean; value: TSelected }>({
        hasValue: false,
        value: undefined as TSelected,
    });

    return React.useSyncExternalStore(
        store.subscribe,
        () => {
            const selected = selector(store.getState());
            if (cacheRef.current.hasValue && isEqual(cacheRef.current.value, selected)) {
                return cacheRef.current.value;
            }
            cacheRef.current = {
                hasValue: true,
                value: selected,
            };
            return selected;
        },
        () => {
            const selected = selector(store.getState());
            if (cacheRef.current.hasValue && isEqual(cacheRef.current.value, selected)) {
                return cacheRef.current.value;
            }
            cacheRef.current = {
                hasValue: true,
                value: selected,
            };
            return selected;
        },
    );
}

export function useStoreState<TState>(store: StateStore<TState>) {
    return useStoreSelector(store, (state) => state);
}

export function createStateSlice<TState, TSlice>(
    store: StateStore<TState>,
    options: StateSliceOptions<TState, TSlice>,
): StateSlice<TState, TSlice> {
    let past: StateSliceHistoryEntry<TSlice>[] = [];
    let future: StateSliceHistoryEntry<TSlice>[] = [];
    const maxHistory = Math.max(0, options.maxHistory ?? 100);
    const listeners = new Set<StateListener>();
    let previousSlice = options.select(store.getState());

    const emit = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    store.subscribe(() => {
        const nextSlice = options.select(store.getState());
        if (Object.is(previousSlice, nextSlice)) {
            return;
        }
        previousSlice = nextSlice;
        emit();
    });

    const commit = (nextSlice: TSlice, commitOptions?: CommitOptions) => {
        const currentSlice = options.select(store.getState());
        if (Object.is(currentSlice, nextSlice)) {
            return currentSlice;
        }

        if (commitOptions?.history !== false) {
            const forward = diff(currentSlice, nextSlice);
            if (forward !== undefined && getUpdateKeys(forward).length > 0) {
                const reverse = revise(currentSlice, forward);
                past = [...past, { forward, reverse }];
                if (past.length > maxHistory) {
                    past = past.slice(past.length - maxHistory);
                }
                future = [];
            }
        }

        store.setState((state) => options.replace(state, nextSlice), { history: false });
        return options.select(store.getState());
    };

    return {
        canRedo: () => future.length > 0,
        canUndo: () => past.length > 0,
        clearHistory: () => {
            past = [];
            future = [];
            emit();
        },
        getState: () => options.select(store.getState()),
        redo: () => {
            const entry = future[future.length - 1];
            if (!entry) {
                return false;
            }
            const currentSlice = options.select(store.getState());
            future = future.slice(0, -1);
            past = [...past, entry];
            store.setState(
                (state) => options.replace(state, patch(currentSlice, entry.forward)),
                { history: false },
            );
            return true;
        },
        setState: (nextState, commitOptions) => {
            const currentSlice = options.select(store.getState());
            const resolved =
                typeof nextState === 'function'
                    ? (nextState as (state: TSlice) => TSlice)(currentSlice)
                    : nextState;
            return commit(resolved, commitOptions);
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
            const currentSlice = options.select(store.getState());
            past = past.slice(0, -1);
            future = [...future, entry];
            store.setState(
                (state) => options.replace(state, patch(currentSlice, entry.reverse)),
                { history: false },
            );
            return true;
        },
        update: (update, commitOptions) => {
            const currentSlice = options.select(store.getState());
            return commit(patch(currentSlice, update), commitOptions);
        },
    };
}

export function createStoreContext<TState>(displayName: string) {
    const StoreContext = React.createContext<StateStore<TState> | null>(null);
    StoreContext.displayName = `${displayName}Context`;

    function Provider({
        children,
        store,
    }: {
        children: React.ReactNode;
        store: StateStore<TState>;
    }) {
        return React.createElement(StoreContext.Provider, { value: store }, children);
    }

    function useStore() {
        const store = React.useContext(StoreContext);
        if (!store) {
            throw new Error(`${displayName}Provider is required before using ${displayName}.`);
        }
        return store;
    }

    function useSelector<TSelected>(
        selector: (state: TState) => TSelected,
        isEqual?: (left: TSelected, right: TSelected) => boolean,
    ) {
        return useStoreSelector(useStore(), selector, isEqual);
    }

    function useState() {
        return useStoreState(useStore());
    }

    return {
        Provider,
        useSelector,
        useState,
        useStore,
    };
}
