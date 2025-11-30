'use client';

import * as React from 'react';

export function useHistory<S>(initial: S, limit = 50) {
    const [present, setPresent] = React.useState<S>(initial);
    const pastRef = React.useRef<S[]>([]);
    const futureRef = React.useRef<S[]>([]);

    const set = React.useCallback(
        (next: S | ((cur: S) => S)) => {
            setPresent((prev) => {
                const value =
                    typeof next === 'function' ? (next as any)(prev) : next;
                // push prev into past; clear future
                pastRef.current.push(prev);
                if (pastRef.current.length > limit) pastRef.current.shift();
                futureRef.current = [];
                return value;
            });
        },
        [limit]
    );

    const undo = React.useCallback(() => {
        const past = pastRef.current;
        if (!past.length) return;
        setPresent((cur) => {
            const prev = past.pop()!;
            futureRef.current.push(cur);
            return prev;
        });
    }, []);

    const redo = React.useCallback(() => {
        const fut = futureRef.current;
        if (!fut.length) return;
        setPresent((cur) => {
            const next = fut.pop()!;
            pastRef.current.push(cur);
            return next;
        });
    }, []);

    const reset = React.useCallback((value: S) => {
        pastRef.current = [];
        futureRef.current = [];
        setPresent(value);
    }, []);

    return {
        value: present,
        set,
        undo,
        redo,
        canUndo: pastRef.current.length > 0,
        canRedo: futureRef.current.length > 0,
        reset,
    };
}
