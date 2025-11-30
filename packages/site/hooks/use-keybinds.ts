'use client';

import * as React from 'react';

type Key = string; // e.g. "Shift", "Ctrl+K", "Alt+S"
type MapShape = Record<string, Key>;

const IS_CLIENT = typeof window !== 'undefined';

function lsGet<T>(k: string, d: T): T {
    if (!IS_CLIENT) return d;
    try {
        const v = localStorage.getItem(k);
        return v ? (JSON.parse(v) as T) : d;
    } catch {
        return d;
    }
}
function lsSet<T>(k: string, v: T) {
    if (!IS_CLIENT) return;
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch {}
}

export type UseKeybinds = {
    get: (action: string) => Key;
    set: (action: string, key: Key) => void;
    isHeld: (key: Key) => boolean;
    pressed: Set<string>;
};

/**
 * useKeybinds
 * - Default persists in localStorage.
 * - If Jazz CoValues are available on client, you can plug it in:
 *   pass a `read/write` adapter from your Jazz store here later.
 */
export function useKeybinds(
    initial: MapShape = { splitModifier: 'Shift' }
): UseKeybinds {
    const [map, setMap] = React.useState<MapShape>(() => ({
        ...initial,
        ...lsGet<MapShape>('keybinds', {}),
    }));
    const pressed = React.useRef<Set<string>>(new Set());

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            pressed.current.add(e.key);
        };
        const up = (e: KeyboardEvent) => {
            pressed.current.delete(e.key);
        };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        window.addEventListener('blur', () => pressed.current.clear());
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
            window.removeEventListener('blur', () => pressed.current.clear());
        };
    }, []);

    const api = React.useMemo<UseKeybinds>(
        () => ({
            get: (action) => map[action] ?? '',
            set: (action, key) => {
                setMap((prev) => {
                    const next = { ...prev, [action]: key };
                    lsSet('keybinds', next);
                    return next;
                });
            },
            isHeld: (key) => pressed.current.has(key),
            pressed: pressed.current,
        }),
        [map]
    );

    return api;
}
