import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asNodeId } from '@loop-kit/graphite-core';
import { DOCK_FACET, DOCK_PROP_ACTIVE_TAB, DOCK_REL_CHILD_GROUPS } from '../src/facet/schema.js';
import { DOCK_DIAG_CODES } from '../src/facet/diagnostics.js';
import type { DockStateSlice } from '../src/facet/queries.js';
import { createDockFixture } from './utils.js';

test('dock validator normalizes invalid active tab and emits cycle diagnostics', () => {
    const fixture = createDockFixture();
    const scope = fixture.runtime.getScope(fixture.scopeId);

    fixture.runtime.commitIntentPatch({
        ops: [
            {
                kind: 'setProp',
                nodeId: fixture.ids.groupA,
                key: DOCK_PROP_ACTIVE_TAB,
                value: asNodeId('dock.tab.missing'),
            },
            {
                kind: 'insertOrderedEdge',
                nodeId: fixture.ids.groupB,
                rel: DOCK_REL_CHILD_GROUPS,
                to: fixture.ids.groupA,
                index: 0,
            },
        ],
    });

    const state = scope.getStateView().getSlice<DockStateSlice>(DOCK_FACET);
    const diagnostics = scope.getStateView().getDiagnostics(DOCK_FACET);

    assert.ok(state);
    assert.equal(state?.groups[fixture.ids.groupA]?.activeTabId, fixture.ids.tab1);
    assert.ok(diagnostics.some((item) => item.code === DOCK_DIAG_CODES.INVALID_ACTIVE_TAB));
    assert.ok(diagnostics.some((item) => item.code === DOCK_DIAG_CODES.GROUP_CYCLE));
});
