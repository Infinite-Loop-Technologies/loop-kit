import { describe, expect, test } from 'bun:test';

import {
    createDragCoordinator,
    createKeyboardScopeManager,
    createViewRegistry,
} from '../src/index';

describe('loom-interactions view registry', () => {
    test('stores and lists views', () => {
        const registry = createViewRegistry();
        registry.register('alpha', null);
        expect(registry.get('alpha')?.id).toBe('alpha');
        expect(registry.list().map((entry) => entry.id)).toEqual(['alpha']);
    });
});

describe('loom-interactions keyboard scopes', () => {
    test('dispatches to the active scope', () => {
        const manager = createKeyboardScopeManager();
        let handled = 0;
        manager.register('root', () => {
            handled += 1;
            return true;
        });
        manager.activate('root');
        manager.dispatch({ key: 'k' } as KeyboardEvent);
        expect(handled).toBe(1);
    });
});

describe('loom-interactions drag coordinator', () => {
    test('tracks transient drag state', () => {
        const drag = createDragCoordinator();
        drag.start('panel-1', { x: 2, y: 4 });
        drag.move({ x: 10, y: 12 });
        expect(drag.snapshot()).toEqual({
            itemId: 'panel-1',
            point: { x: 10, y: 12 },
        });
        drag.end();
        expect(drag.snapshot()).toBeNull();
    });
});
