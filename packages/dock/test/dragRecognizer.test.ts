import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOCK_REL_TABS } from '../src/facet/schema.js';
import { createDragTabRecognizer } from '../src/interaction/recognizers/dragTab.js';
import type { DockStateSlice } from '../src/facet/queries.js';
import { DOCK_FACET } from '../src/facet/schema.js';
import { createDockFixture } from './utils.js';

test('dragTab recognizer writes overlay preview and commits final move', () => {
    const fixture = createDockFixture({ enableHistory: true });
    const runtime = fixture.runtime;
    const scope = runtime.getScope(fixture.scopeId);

    scope.interactionRuntime.registerRecognizer(createDragTabRecognizer());
    scope.interactionRuntime.setHitTestProviders([
        {
            id: 'test.hit',
            hitTest: (x, _y, input) => {
                if (input.kind === 'pointerdown') {
                    return {
                        nodeId: fixture.ids.tab1,
                        zoneId: 'tab:dock.tab.1',
                        regionType: 'tab',
                        data: {
                            tabId: fixture.ids.tab1,
                            groupId: fixture.ids.groupA,
                            index: 0,
                        },
                    };
                }

                if (input.kind === 'pointermove' || input.kind === 'pointerup') {
                    return {
                        nodeId: fixture.ids.groupB,
                        zoneId: `drop:${fixture.ids.groupB}:center`,
                        regionType: 'drop-center',
                        data: {
                            targetGroupId: fixture.ids.groupB,
                            region: 'center',
                        },
                    };
                }

                return undefined;
            },
        },
    ]);

    const commits: string[] = [];
    runtime.commitController.subscribe((commit) => {
        commits.push(commit.meta.origin ?? 'unknown');
    });

    scope.interactionRuntime.handleInput({
        kind: 'pointerdown',
        pointerId: 1,
        x: 10,
        y: 10,
    });
    scope.interactionRuntime.handleInput({
        kind: 'pointermove',
        pointerId: 1,
        x: 200,
        y: 20,
    });

    assert.equal(runtime.overlayLayer.getOverlayStack(fixture.scopeId).length, 1);
    const preview = scope.getStateView().getSlice<DockStateSlice>(DOCK_FACET)?.preview;
    assert.equal(preview?.targetGroupId, fixture.ids.groupB);

    scope.interactionRuntime.handleInput({
        kind: 'pointerup',
        pointerId: 1,
        x: 200,
        y: 20,
    });

    assert.equal(runtime.overlayLayer.getOverlayStack(fixture.scopeId).length, 0);
    assert.ok(runtime.intentStore.graph.getOrderedEdges(fixture.ids.groupB, DOCK_REL_TABS).includes(fixture.ids.tab1));
    assert.ok(commits.includes('dock.dragTab'));
});
