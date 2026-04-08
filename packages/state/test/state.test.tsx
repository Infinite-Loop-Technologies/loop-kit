import * as React from 'react';
import { describe, expect, test } from 'bun:test';
import { renderToString } from 'react-dom/server';

import {
    $apply,
    $delete,
    $patch,
    $set,
    createStateStore,
    diff,
    getUpdateKeys,
    patch,
    revise,
    useCursor,
    useStoreSelector,
    useUpdateState,
} from '../src/index-react';

describe('@loop-kit/state patching', () => {
    test('patch merges nested objects and supports delete/set/apply/patch ops', () => {
        const source: {
            count: number;
            nested: {
                keep?: boolean;
                label: string;
                extra?: string;
            };
        } = {
            count: 1,
            nested: {
                keep: true,
                label: 'hello',
            },
        };

        const updated = patch<typeof source>(source, {
            count: $apply((value: number) => value + 1),
            nested: {
                extra: $set<string>('new'),
                keep: $delete(),
                label: $patch((value: string) => `${value} world`),
            },
        });

        expect(updated).toEqual({
            count: 2,
            nested: {
                extra: 'new',
                label: 'hello world',
            },
        });
    });

    test('diff and revise round-trip through patch', () => {
        const source = { items: ['a'], nested: { open: false, size: 2 } };
        const target = { items: ['a', 'b'], nested: { open: true, size: 3 } };

        const forward = diff(source, target);
        const applied = patch(source, forward);
        const reverse = revise(source, forward);

        expect(applied).toEqual(target);
        expect(patch(applied, reverse)).toEqual(source);
        expect(getUpdateKeys(forward)).toEqual(['items', 'nested.open', 'nested.size']);
    });
});

describe('@loop-kit/state store', () => {
    test('tracks undo and redo using patch history', () => {
        const store = createStateStore({ count: 0 });

        store.update({ count: 1 });
        store.update({ count: 2 });
        expect(store.getState()).toEqual({ count: 2 });
        expect(store.canUndo()).toBe(true);

        expect(store.undo()).toBe(true);
        expect(store.getState()).toEqual({ count: 1 });
        expect(store.redo()).toBe(true);
        expect(store.getState()).toEqual({ count: 2 });
    });
});

describe('@loop-kit/state react helpers', () => {
    test('useCursor exposes nested updater pairs', () => {
        const snapshots: string[] = [];

        function Example() {
            const cursor = useCursor(useUpdateState({ ui: { theme: 'base' } }));
            const [theme, updateTheme] = cursor.ui.theme();
            React.useMemo(() => {
                if (theme === 'base') {
                    updateTheme('aquatic');
                }
            }, [theme, updateTheme]);
            snapshots.push(theme);
            return React.createElement('div', null, theme);
        }

        renderToString(React.createElement(Example));
        expect(snapshots).toContain('base');
    });

    test('useStoreSelector reads store state through useSyncExternalStore', () => {
        const store = createStateStore({ count: 1 });
        const snapshots: number[] = [];

        function Example() {
            const count = useStoreSelector(store, (state) => state.count);
            snapshots.push(count);
            return React.createElement('div', null, count);
        }

        renderToString(React.createElement(Example));
        store.update({ count: 2 });
        renderToString(React.createElement(Example));

        expect(snapshots).toEqual([1, 2]);
    });
});
