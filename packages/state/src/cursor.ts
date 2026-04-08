// Adapted from use.gpu/packages/state/src/cursor.ts. See ../UPSTREAM.md.

import type { Cursor, Pair, Update } from './types.js';
import { $set } from './patch.js';

export type CursorEntry<T> = [Cursor<T> | null, CursorMap<T>];
export type CursorMap<T> = Map<string | symbol, CursorEntry<any>>;

const NO_ENTRY = [null, null] as const;

export const makeCursor = <T>(
    pair: Pair<T>,
    defaults?: T,
    keep?: CursorMap<T> | null,
): [Cursor<T>, CursorMap<T>] => {
    const defaultValue = defaults as any;
    const root = () => pair;
    const map: CursorMap<T> = new Map();

    const cursor = new Proxy(root, {
        get(_target, property) {
            const [existingCursor, existingMap] = map.get(property) ?? NO_ENTRY;
            if (existingCursor) {
                return existingCursor;
            }

            if (property === Symbol.toPrimitive) {
                return () => '[Cursor cursor]';
            }

            const child = refinePair(pair, property as keyof T, defaultValue);
            const entry = makeCursor(child, defaultValue?.[property], existingMap);
            map.set(property, entry);
            return entry[0];
        },
    }) as Cursor<T>;

    if (keep && pair[0]) {
        for (const key of keep.keys()) {
            const [nextValue] = refinePair(pair, key as keyof T, defaultValue);
            const entry = keep.get(key);
            if (!entry) {
                continue;
            }
            const [existingCursor, existingMap] = entry;
            if (existingCursor) {
                const [previousValue] = existingCursor();
                if (previousValue === nextValue) {
                    map.set(key, entry);
                    continue;
                }
            }
            if (nextValue) {
                map.set(key, [null, existingMap]);
            }
        }
    }

    return [cursor, map];
};

export const refinePair = <T, K extends keyof T>(
    pair: Pair<T>,
    key: K,
    defaults?: Record<K, unknown>,
): Pair<T[K]> => {
    const [value, updateValue] = pair;
    const defaultEntry = defaults != null ? defaults[key] : undefined;
    let current = value != null ? (value as T)[key] : undefined;
    let updater: (update: Update<T[K]>) => void;

    if (current === undefined && defaultEntry !== undefined) {
        let first = true;
        current = defaultEntry as T[K];
        updater = (update) => {
            if (first) {
                updateValue({ [key]: $set(defaultEntry as T[K]) } as Update<T>);
            }
            updateValue({ [key]: update } as Update<T>);
            first = false;
        };
    } else {
        updater = (update) => {
            updateValue({ [key]: update } as Update<T>);
        };
    }

    return [current as T[K], updater];
};
