import assert from 'node:assert/strict';
import test from 'node:test';

import {
    computeDropIndicator,
    computeLayoutRects,
    splitDirectionFromZone,
    type DockDropTarget,
} from '../src/index.js';
import { createGraphiteDockFixture } from './graphite.fixture.js';

test('computeLayoutRects builds stable group and split handle maps', () => {
    const fixture = createGraphiteDockFixture();
    const layout = computeLayoutRects(
        fixture.dock,
        { x: 0, y: 0, width: 1200, height: 800 },
        { tabBarHeight: 32, splitterSize: 12 },
    );

    assert.equal(layout.groups.length, 3);
    assert.equal(layout.splitHandles.length, 2);

    const leftGroup = layout.groups.find((group) => group.id === fixture.ids.groupLeft);
    const centerGroup = layout.groups.find((group) => group.id === fixture.ids.groupCenter);
    assert.ok(leftGroup);
    assert.ok(centerGroup);
    if (!leftGroup || !centerGroup) {
        return;
    }

    assert.ok(leftGroup.rect.width > 250 && leftGroup.rect.width < 320);
    assert.ok(centerGroup.rect.height > 500 && centerGroup.rect.height < 600);
    assert.equal(layout.nodes[fixture.ids.splitRoot]?.kind, 'split');
    assert.equal(layout.nodes[fixture.ids.groupCenter]?.kind, 'group');
});

test('computeDropIndicator returns tab line and edge overlays', () => {
    const fixture = createGraphiteDockFixture();
    const layout = computeLayoutRects(
        fixture.dock,
        { x: 0, y: 0, width: 1000, height: 700 },
    );
    const centerGroup = layout.groups.find((group) => group.id === fixture.ids.groupCenter);
    assert.ok(centerGroup);
    if (!centerGroup) {
        return;
    }

    const tabTarget: DockDropTarget = {
        groupId: centerGroup.id,
        zone: 'tabbar',
        rect: centerGroup.tabBarRect,
        index: 1,
        score: 30,
    };
    const tabIndicator = computeDropIndicator(tabTarget, layout);
    assert.ok(tabIndicator);
    assert.equal(tabIndicator?.kind, 'line');
    assert.equal(tabIndicator?.label, 'tab');

    const edgeTarget: DockDropTarget = {
        groupId: centerGroup.id,
        zone: 'left',
        rect: centerGroup.rect,
        score: 20,
    };
    const edgeIndicator = computeDropIndicator(edgeTarget, layout);
    assert.ok(edgeIndicator);
    assert.equal(edgeIndicator?.kind, 'zone');
    assert.equal(edgeIndicator?.label, 'left');
});

test('splitDirectionFromZone maps drop zones to split directions', () => {
    assert.equal(splitDirectionFromZone('left'), 'row');
    assert.equal(splitDirectionFromZone('right'), 'row');
    assert.equal(splitDirectionFromZone('top'), 'col');
    assert.equal(splitDirectionFromZone('bottom'), 'col');
});
