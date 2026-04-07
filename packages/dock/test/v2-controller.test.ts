import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createDockV2Controller,
    createDockV2Group,
    createDockV2Layer,
    createDockV2Panel,
    createDockV2State,
    fromLegacyDockState,
} from '../src/index.js';
import { createGraphiteDockFixture } from './graphite.fixture.js';

function createDockV2Fixture() {
    return createDockV2State({
        activeGroupId: 'group-workspace',
        activeLayerId: 'layer-main',
        focusedPanelId: 'panel-workspace',
        groups: {
            'group-sidebar': createDockV2Group({
                id: 'group-sidebar',
                layerId: 'layer-main',
                layout: {
                    basis: '240px',
                    min: '220px',
                    placement: { kind: 'inline' },
                },
                mode: 'single',
                panelIds: ['panel-sidebar'],
                policies: {
                    attachable: false,
                    closeable: false,
                    movable: true,
                    reorderable: true,
                    resizable: true,
                    splittable: false,
                    stackable: false,
                },
            }),
            'group-workspace': createDockV2Group({
                activePanelId: 'panel-workspace',
                id: 'group-workspace',
                layerId: 'layer-main',
                layout: {
                    grow: 1,
                    min: '0px',
                    placement: { kind: 'inline' },
                },
                mode: 'single',
                panelIds: ['panel-workspace'],
                policies: {
                    closeable: false,
                },
            }),
            'group-inspector': createDockV2Group({
                id: 'group-inspector',
                layerId: 'layer-main',
                layout: {
                    basis: '320px',
                    min: '280px',
                    placement: { kind: 'inline' },
                },
                mode: 'single',
                panelIds: ['panel-inspector'],
            }),
            'group-command-palette': createDockV2Group({
                id: 'group-command-palette',
                layerId: 'layer-command',
                layout: {
                    placement: {
                        kind: 'center',
                        maxWidth: '640px',
                        top: '80px',
                        width: '100%',
                    },
                },
                mode: 'swap',
                panelIds: ['panel-command-palette'],
            }),
            'group-side-peek': createDockV2Group({
                id: 'group-side-peek',
                layerId: 'layer-peek',
                layout: {
                    placement: {
                        edge: 'right',
                        kind: 'edge',
                        width: '380px',
                    },
                },
                mode: 'swap',
                panelIds: ['panel-side-peek'],
            }),
        },
        layerOrder: ['layer-main', 'layer-command', 'layer-peek', 'layer-alert'],
        layers: {
            'layer-alert': createDockV2Layer({
                groupIds: [],
                id: 'layer-alert',
                kind: 'overlay',
                overlay: {
                    behavior: 'queue',
                    interaction: 'modal',
                },
            }),
            'layer-command': createDockV2Layer({
                groupIds: ['group-command-palette'],
                id: 'layer-command',
                kind: 'overlay',
                overlay: {
                    behavior: 'replace',
                    interaction: 'modal',
                    maxGroups: 1,
                },
            }),
            'layer-main': createDockV2Layer({
                flow: {
                    direction: 'horizontal',
                    reorder: 'horizontal-only',
                },
                groupIds: ['group-sidebar', 'group-workspace', 'group-inspector'],
                id: 'layer-main',
                kind: 'flow',
            }),
            'layer-peek': createDockV2Layer({
                groupIds: ['group-side-peek'],
                id: 'layer-peek',
                kind: 'overlay',
                overlay: {
                    behavior: 'replace',
                    interaction: 'passthrough',
                    maxGroups: 1,
                },
            }),
        },
        panels: {
            'panel-command-palette': createDockV2Panel({
                id: 'panel-command-palette',
                kind: 'command-palette',
                title: 'Command Palette',
            }),
            'panel-inspector': createDockV2Panel({
                id: 'panel-inspector',
                kind: 'inspector',
                title: 'Inspector',
            }),
            'panel-side-peek': createDockV2Panel({
                id: 'panel-side-peek',
                kind: 'side-peek',
                title: 'Side Peek',
            }),
            'panel-sidebar': createDockV2Panel({
                id: 'panel-sidebar',
                kind: 'sidebar',
                title: 'Sidebar',
            }),
            'panel-workspace': createDockV2Panel({
                id: 'panel-workspace',
                kind: 'workspace',
                title: 'Workspace',
            }),
        },
    });
}

test('openPanel creates an implicit group on the target layer', () => {
    const controller = createDockV2Controller(createDockV2Fixture());

    const result = controller.openPanel({
        layerId: 'layer-alert',
        panel: createDockV2Panel({
            id: 'panel-alert-1',
            kind: 'alert',
            title: 'Unsaved changes',
        }),
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
        return;
    }
    const layer = result.value.layers['layer-alert'];
    assert.equal(layer.groupIds.length, 1);
    const group = result.value.groups[layer.groupIds[0] ?? ''];
    assert.equal(group?.mode, 'single');
    assert.deepEqual(group?.panelIds, ['panel-alert-1']);
});

test('ensurePanel focuses an existing panel instead of duplicating it', () => {
    const controller = createDockV2Controller(createDockV2Fixture());

    const result = controller.ensurePanel({
        panel: createDockV2Panel({
            id: 'panel-workspace',
            kind: 'workspace',
            title: 'Workspace',
        }),
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
        return;
    }
    assert.equal(result.value.focusedPanelId, 'panel-workspace');
    assert.equal(Object.keys(result.value.panels).length, 5);
});

test('splitPanel creates and preserves split metadata', () => {
    const state = createDockV2Fixture();
    state.groups['group-workspace'] = createDockV2Group({
        ...state.groups['group-workspace']!,
        mode: 'tabs',
        panelIds: ['panel-workspace', 'panel-notes'],
    });
    state.panels['panel-notes'] = createDockV2Panel({
        id: 'panel-notes',
        kind: 'notes',
        title: 'Notes',
    });

    const controller = createDockV2Controller(state);
    const result = controller.splitPanel({
        direction: 'row',
        groupId: 'group-workspace',
        panelId: 'panel-workspace',
        position: 'after',
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
        return;
    }
    const group = result.value.groups['group-workspace'];
    assert.equal(group?.mode, 'split');
    assert.ok(group?.splitRootId);
    assert.equal(Object.keys(group?.splitNodes ?? {}).length, 1);
});

test('attachPanel rehomes a panel into another group', () => {
    const state = createDockV2Fixture();
    state.groups['group-workspace'] = createDockV2Group({
        ...state.groups['group-workspace']!,
        mode: 'tabs',
        panelIds: ['panel-workspace', 'panel-notes'],
    });
    state.panels['panel-notes'] = createDockV2Panel({
        id: 'panel-notes',
        kind: 'notes',
        title: 'Notes',
    });

    const controller = createDockV2Controller(state);
    const result = controller.attachPanel({
        groupId: 'group-inspector',
        panelId: 'panel-notes',
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
        return;
    }
    assert.deepEqual(result.value.groups['group-inspector']?.panelIds, [
        'panel-inspector',
        'panel-notes',
    ]);
    assert.deepEqual(result.value.groups['group-workspace']?.panelIds, ['panel-workspace']);
});

test('dismissLayer respects overlay queue behavior', () => {
    const controller = createDockV2Controller(createDockV2Fixture());

    controller.openPanel({
        layerId: 'layer-alert',
        panel: createDockV2Panel({
            id: 'panel-alert-1',
            kind: 'alert',
            title: 'Unsaved changes',
        }),
    });
    controller.openPanel({
        layerId: 'layer-alert',
        panel: createDockV2Panel({
            id: 'panel-alert-2',
            kind: 'alert',
            title: 'Permissions changed',
        }),
    });

    const dismissed = controller.dismissLayer({
        layerId: 'layer-alert',
    });

    assert.equal(dismissed.ok, true);
    if (!dismissed.ok) {
        return;
    }
    const alertLayer = dismissed.value.layers['layer-alert'];
    assert.equal(alertLayer.groupIds.length, 1);
});

test('closeGroup respects non-closeable group policies', () => {
    const controller = createDockV2Controller(createDockV2Fixture());
    const result = controller.closeGroup('group-sidebar');

    assert.equal(result.ok, false);
    if (result.ok) {
        return;
    }
    assert.equal(result.error.code, 'group-locked');
});

test('fromLegacyDockState adapts legacy tree groups into a flow layer', () => {
    const fixture = createGraphiteDockFixture();
    const adapted = fromLegacyDockState(fixture.dock);

    assert.equal(adapted.layerOrder[0], 'legacy-flow');
    assert.ok(adapted.layers['legacy-flow']);
    assert.ok(adapted.groups[fixture.ids.groupLeft]);
    assert.ok(adapted.panels[fixture.ids.panelEditor]);
});
