import assert from 'node:assert/strict';
import test from 'node:test';

import {
    computeLayoutRects,
    createDockInteractionController,
    type DockDropTarget,
} from '../src/index.js';
import { createGraphiteDockFixture } from './graphite.fixture.js';

test('interaction controller resolves drag-and-drop tab targets', () => {
    const fixture = createGraphiteDockFixture();
    const layout = computeLayoutRects(
        fixture.dock,
        { x: 0, y: 0, width: 1200, height: 800 },
        { tabBarHeight: 32, splitterSize: 12 },
    );

    const seenTargets: DockDropTarget[] = [];
    const controller = createDockInteractionController({
        onDropTargetChange: (target) => {
            if (target) {
                seenTargets.push(target);
            }
        },
    });

    const leftGroup = layout.groups.find((group) => group.id === fixture.ids.groupLeft);
    assert.ok(leftGroup);
    if (!leftGroup) {
        return;
    }

    const pointer = {
        x: leftGroup.tabBarRect.x + leftGroup.tabBarRect.width / 2,
        y: leftGroup.tabBarRect.y + leftGroup.tabBarRect.height / 2,
    };

    controller.startPanelDrag(fixture.ids.panelEditor);
    controller.updatePointer(pointer, layout);

    const intent = controller.endPanelDrag(pointer, layout);
    assert.ok(intent);
    assert.equal(intent?.name, 'dock/move-panel');
    if (!intent || intent.name !== 'dock/move-panel') {
        return;
    }

    assert.equal(intent.payload.panelId, fixture.ids.panelEditor);
    assert.equal(intent.payload.targetGroupId, fixture.ids.groupLeft);
    assert.equal(intent.payload.zone, 'tabbar');
    assert.ok(seenTargets.length > 0);
});

test('interaction controller emits transient and final resize intents', () => {
    const fixture = createGraphiteDockFixture();
    const layout = computeLayoutRects(
        fixture.dock,
        { x: 0, y: 0, width: 1200, height: 800 },
        { tabBarHeight: 32, splitterSize: 12 },
    );
    const handle = layout.splitHandles.find(
        (entry) => entry.splitId === fixture.ids.splitRoot,
    );
    assert.ok(handle);
    if (!handle) {
        return;
    }
    const splitNode = fixture.dock.nodes[handle.splitId];
    assert.equal(splitNode?.kind, 'split');
    if (!splitNode || splitNode.kind !== 'split') {
        return;
    }
    const splitRect = layout.nodes[handle.splitId]?.rect;
    assert.ok(splitRect);
    if (!splitRect) {
        return;
    }

    const controller = createDockInteractionController({
        minWeight: 0.05,
    });
    const startPoint = {
        x: 400,
        y: 120,
    };
    controller.startResize({
        splitId: handle.splitId,
        handleIndex: handle.index,
        direction: handle.direction,
        startPoint,
        splitSize: splitRect.width,
        weights: splitNode.data.weights,
    });

    const transient = controller.updateResize({
        x: startPoint.x + 120,
        y: startPoint.y,
    });
    assert.ok(transient);
    assert.equal(transient?.name, 'dock/resize');
    assert.equal(transient?.transient, true);

    const finalIntent = controller.endResize({
        x: startPoint.x + 120,
        y: startPoint.y,
    });
    assert.ok(finalIntent);
    assert.equal(finalIntent?.name, 'dock/resize');
    assert.equal(finalIntent?.transient, false);
    if (!finalIntent || finalIntent.name !== 'dock/resize') {
        return;
    }

    const sum = finalIntent.payload.weights.reduce((total, value) => total + value, 0);
    assert.ok(sum > 0.99 && sum < 1.01);
});

test('interaction controller resolves edge drop zones from content pointer positions', () => {
    const fixture = createGraphiteDockFixture();
    const layout = computeLayoutRects(
        fixture.dock,
        { x: 0, y: 0, width: 1200, height: 800 },
        { tabBarHeight: 32, splitterSize: 12 },
    );
    const centerGroup = layout.groups.find((group) => group.id === fixture.ids.groupCenter);
    assert.ok(centerGroup);
    if (!centerGroup) {
        return;
    }

    const pointer = {
        x: centerGroup.rect.x + 6,
        y: centerGroup.rect.y + centerGroup.tabBarRect.height + centerGroup.rect.height * 0.4,
    };

    const controller = createDockInteractionController();
    controller.startPanelDrag(fixture.ids.panelPreview);
    controller.updatePointer(pointer, layout);
    const target = controller.getDropTarget();

    assert.ok(target);
    assert.equal(target?.groupId, fixture.ids.groupCenter);
    assert.equal(target?.zone, 'left');
});
