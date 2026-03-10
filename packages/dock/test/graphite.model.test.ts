import assert from 'node:assert/strict';
import test from 'node:test';

import { createGraphStore } from '@loop-kit/graphite';
import {
    createDockPanelQuery,
    deserializeDockState,
    normalizeDockState,
    registerDockIntents,
    serializeDockState,
    type DockState,
} from '../src/index.js';
import { createGraphiteDockFixture } from './graphite.fixture.js';

type DockTestState = {
    dock: DockState;
};

test('registerDockIntents supports add, move split, and resize flows', () => {
    const fixture = createGraphiteDockFixture();
    const store = createGraphStore<DockTestState>({
        initialState: {
            dock: fixture.dock,
        },
    });
    const intents = registerDockIntents(store, {
        path: ['dock'],
        intentPrefix: 'dock',
    });

    const beforePanels = createDockPanelQuery<DockTestState>({
        path: ['dock'],
    })(store.getState());
    assert.equal(beforePanels.length, 4);

    store.dispatchIntent(intents.addPanel, {
        title: 'Scratch',
        groupId: fixture.ids.groupCenter,
    });

    const afterAdd = store.getState().dock;
    const centerAfterAdd = afterAdd.nodes[fixture.ids.groupCenter];
    assert.equal(centerAfterAdd?.kind, 'group');
    if (!centerAfterAdd || centerAfterAdd.kind !== 'group') {
        return;
    }
    const scratchPanelId = centerAfterAdd.links.children.find((panelId: string) => {
        const node = afterAdd.nodes[panelId];
        return node?.kind === 'panel' && node.data.title === 'Scratch';
    });
    assert.ok(scratchPanelId);

    store.dispatchIntent(intents.movePanel, {
        panelId: fixture.ids.panelEditor,
        sourceGroupId: fixture.ids.groupCenter,
        targetGroupId: fixture.ids.groupLeft,
        zone: 'right',
    });

    const afterMove = store.getState().dock;
    const createdGroup = (Object.values(afterMove.nodes) as Array<(typeof afterMove.nodes)[string]>).find(
        (node) =>
            node.kind === 'group' &&
            node.id !== fixture.ids.groupLeft &&
            node.id !== fixture.ids.groupCenter &&
            node.id !== fixture.ids.groupBottom &&
            node.links.children.includes(fixture.ids.panelEditor),
    );
    assert.ok(createdGroup);

    store.dispatchIntent(intents.resize, {
        splitId: fixture.ids.splitRoot,
        handleIndex: 0,
        weights: [5, 5],
    });

    const splitRoot = store.getState().dock.nodes[fixture.ids.splitRoot];
    assert.equal(splitRoot?.kind, 'split');
    if (!splitRoot || splitRoot.kind !== 'split') {
        return;
    }
    assert.equal(splitRoot.data.weights.length, splitRoot.links.children.length);
    assert.equal(
        Math.round(
            splitRoot.data.weights.reduce((sum: number, value: number) => sum + value, 0) *
                1000,
        ) /
            1000,
        1,
    );
});

test('createDockPanelQuery returns panel summaries with owning groups', () => {
    const fixture = createGraphiteDockFixture();
    const store = createGraphStore<DockTestState>({
        initialState: {
            dock: fixture.dock,
        },
    });
    const query = createDockPanelQuery<DockTestState>({
        path: ['dock'],
    });

    const panels = query(store.getState());
    assert.equal(panels.length, 4);
    assert.ok(
        panels.some(
            (panel) =>
                panel.id === fixture.ids.panelExplorer &&
                panel.groupId === fixture.ids.groupLeft,
        ),
    );
    assert.ok(
        panels.some(
            (panel) =>
                panel.id === fixture.ids.panelEditor &&
                panel.groupId === fixture.ids.groupCenter,
        ),
    );
});

test('same-group tab move reorders tabs at the intended index', () => {
    const fixture = createGraphiteDockFixture();
    const store = createGraphStore<DockTestState>({
        initialState: {
            dock: fixture.dock,
        },
    });
    const intents = registerDockIntents(store, {
        path: ['dock'],
        intentPrefix: 'dock',
    });

    const commit = store.dispatchIntent(intents.movePanel, {
        panelId: fixture.ids.panelEditor,
        sourceGroupId: fixture.ids.groupCenter,
        targetGroupId: fixture.ids.groupCenter,
        zone: 'tabbar',
        index: 2,
    });
    assert.ok(commit);

    const group = store.getState().dock.nodes[fixture.ids.groupCenter];
    assert.equal(group?.kind, 'group');
    if (!group || group.kind !== 'group') {
        return;
    }
    assert.deepEqual(group.links.children, [
        fixture.ids.panelPreview,
        fixture.ids.panelEditor,
    ]);
});

test('forbidden same-group edge split drops are rejected cleanly', () => {
    const fixture = createGraphiteDockFixture();
    const store = createGraphStore<DockTestState>({
        initialState: {
            dock: fixture.dock,
        },
    });
    const intents = registerDockIntents(store, {
        path: ['dock'],
        intentPrefix: 'dock',
    });
    const before = normalizeDockState(store.getState().dock);

    const commit = store.dispatchIntent(intents.movePanel, {
        panelId: fixture.ids.panelEditor,
        sourceGroupId: fixture.ids.groupCenter,
        targetGroupId: fixture.ids.groupCenter,
        zone: 'left',
    });
    assert.equal(commit, null);
    assert.deepEqual(normalizeDockState(store.getState().dock), before);
});

test('removing the last tab collapses empty groups and redundant splits', () => {
    const fixture = createGraphiteDockFixture();
    const store = createGraphStore<DockTestState>({
        initialState: {
            dock: fixture.dock,
        },
    });
    const intents = registerDockIntents(store, {
        path: ['dock'],
        intentPrefix: 'dock',
    });

    const commit = store.dispatchIntent(intents.removePanel, {
        panelId: fixture.ids.panelConsole,
    });
    assert.ok(commit);

    const dock = store.getState().dock;
    assert.equal(dock.nodes[fixture.ids.groupBottom], undefined);
    assert.equal(dock.nodes[fixture.ids.splitCenter], undefined);

    const splitRoot = dock.nodes[fixture.ids.splitRoot];
    assert.equal(splitRoot?.kind, 'split');
    if (!splitRoot || splitRoot.kind !== 'split') {
        return;
    }
    assert.deepEqual(splitRoot.links.children, [fixture.ids.groupLeft, fixture.ids.groupCenter]);
});

test('dock state serializes and deserializes to the same normalized structure', () => {
    const fixture = createGraphiteDockFixture();
    const normalized = normalizeDockState(fixture.dock);
    const encoded = serializeDockState(fixture.dock);
    const decoded = deserializeDockState(encoded);

    assert.deepEqual(decoded, normalized);
});
