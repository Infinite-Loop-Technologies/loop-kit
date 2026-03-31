import { describe, expect, test } from 'bun:test';

import {
    DOCK_INTENTS,
    DOCK_LAYOUT_DISPATCH_OPTIONS,
    UI_INTENTS,
    createDockIntentRegistry,
    createDockStore,
} from '../src/index';

describe('loom pack dock store', () => {
    test('initializes Loom theme and color mode state', () => {
        const store = createDockStore(undefined, {
            initialColorMode: 'light',
            initialThemeId: 'aquatic',
        });

        const state = store.getState();
        expect(state.ui.colorMode).toBe('light');
        expect(state.ui.themeId).toBe('aquatic');
    });

    test('registers dock and ui intents on the runtime', () => {
        const store = createDockStore();

        store.dispatchIntent(
            DOCK_INTENTS.addPanel,
            {
                groupId: 'group-center',
                title: 'New Panel',
            },
            DOCK_LAYOUT_DISPATCH_OPTIONS,
        );

        store.dispatchIntent(UI_INTENTS.setThemeId, { themeId: 'neumorph' });
        const state = store.getState();

        expect(
            Object.values(state.dock.nodes).some(
                (node) => node.kind === 'panel' && node.data.title === 'New Panel',
            ),
        ).toBe(true);
        expect(state.ui.themeId).toBe('neumorph');
    });

    test('builds a non-empty dock intent registry', () => {
        const registry = createDockIntentRegistry();
        expect(registry.length).toBeGreaterThan(3);
        expect(registry.some((entry) => entry.id === 'dock.next-theme')).toBe(true);
    });
});
