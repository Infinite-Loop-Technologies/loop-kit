// Adapted from use.gpu/packages/state/src/hooks.ts. See ../UPSTREAM.md.

import type {
    Cursor,
    Initial,
    Pair,
    Update,
    Updater,
    UseCallback,
    UseMemo,
    UseRef,
    UseState,
} from './types.js';
import { patch } from './patch.js';
import { type CursorMap, makeCursor } from './cursor.js';

export const injectUseCursor =
    (useMemo: UseMemo, useRef: UseRef) =>
    <T>(pair: Pair<T>, defaults?: T): Cursor<T> => {
        const [value, updateValue] = pair;
        const keepRef = useRef<CursorMap<T> | null>(null);
        const updaterRef = useRef<Updater<T> | null>(null);

        const [cursor, map] = useMemo(() => {
            const keep = updaterRef.current === updateValue ? keepRef.current : null;
            return makeCursor(pair, defaults, keep);
        }, [defaults, updateValue, value]);

        keepRef.current = map;
        updaterRef.current = updateValue;
        return cursor;
    };

export const injectUseUpdateState =
    (useCallback: UseCallback, useMemo: UseMemo, useState: UseState) =>
    <T>(initialState: Initial<T>, useStateHook: UseState = useState): Pair<T> => {
        const [state, setState] = useStateHook(initialState);
        const updateState = useCallback((update: Update<T>) => {
            setState((current: T) => patch(current, update));
        }, [setState]);

        return useMemo(() => [state, updateState] as Pair<T>, [state, updateState]);
    };
