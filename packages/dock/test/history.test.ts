import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asNodeId } from '@loop-kit/graphite-core';
import { buildMoveTabPatch, buildSplitTabPatch } from '../src/facet/patchBuilders.js';
import { DOCK_REL_TABS } from '../src/facet/schema.js';
import { createDockFixture } from './utils.js';

test('history undo/redo works for tab move patch', () => {
    const fixture = createDockFixture({ enableHistory: true });
    const snapshot = fixture.runtime.overlayLayer.readIntentSnapshot(fixture.scopeId);

    const movePatch = buildMoveTabPatch(snapshot, {
        tabId: fixture.ids.tab1,
        sourceGroupId: fixture.ids.groupA,
        targetGroupId: fixture.ids.groupB,
        targetIndex: 1,
    });
    fixture.runtime.commitIntentPatch(movePatch, { origin: 'dock.test.move', history: true });

    assert.ok(
        fixture.runtime.intentStore.graph.getOrderedEdges(fixture.ids.groupB, DOCK_REL_TABS).includes(fixture.ids.tab1),
    );

    fixture.runtime.undo();
    assert.ok(
        fixture.runtime.intentStore.graph.getOrderedEdges(fixture.ids.groupA, DOCK_REL_TABS).includes(fixture.ids.tab1),
    );

    fixture.runtime.redo();
    assert.ok(
        fixture.runtime.intentStore.graph.getOrderedEdges(fixture.ids.groupB, DOCK_REL_TABS).includes(fixture.ids.tab1),
    );
});

test('history undo/redo works for split patch', () => {
    const fixture = createDockFixture({ enableHistory: true });
    const newGroupId = asNodeId('dock.group.split.test');
    const snapshot = fixture.runtime.overlayLayer.readIntentSnapshot(fixture.scopeId);

    const splitPatch = buildSplitTabPatch(snapshot, {
        tabId: fixture.ids.tab2,
        sourceGroupId: fixture.ids.groupA,
        targetGroupId: fixture.ids.groupB,
        region: 'right',
        newGroupId,
    });
    fixture.runtime.commitIntentPatch(splitPatch, { origin: 'dock.test.split', history: true });

    assert.equal(fixture.runtime.intentStore.graph.hasNode(newGroupId), true);
    assert.ok(
        fixture.runtime.intentStore.graph.getOrderedEdges(newGroupId, DOCK_REL_TABS).includes(fixture.ids.tab2),
    );

    fixture.runtime.undo();
    assert.equal(fixture.runtime.intentStore.graph.hasNode(newGroupId), false);

    fixture.runtime.redo();
    assert.equal(fixture.runtime.intentStore.graph.hasNode(newGroupId), true);
});
