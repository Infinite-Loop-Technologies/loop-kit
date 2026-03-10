import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createDockStore,
    DOCK_HISTORY_CHANNEL,
    DOCK_INTENTS,
    DOCK_LAYOUT_DISPATCH_OPTIONS,
    DOCK_UI_DISPATCH_OPTIONS,
    type DockBlockState,
    UI_INTENTS,
} from '../src/blocks/dock/dock-store';

function panelCount(state: DockBlockState) {
    return Object.values(state.dock.nodes).filter((node) => node.kind === 'panel')
        .length;
}

test('dock store undo/redo restores panel layout state', () => {
    const store = createDockStore();
    const before = panelCount(store.getState());

    store.dispatchIntent(
        DOCK_INTENTS.addPanel,
        { title: 'History Test Panel', groupId: store.getState().ui.activeGroupId },
        DOCK_LAYOUT_DISPATCH_OPTIONS,
    );
    const afterAdd = panelCount(store.getState());
    assert.equal(afterAdd, before + 1);
    assert.equal(store.canUndo(DOCK_HISTORY_CHANNEL), true);

    store.dispatchIntent(UI_INTENTS.undoLayout, undefined, DOCK_UI_DISPATCH_OPTIONS);
    const afterUndo = store.getState();
    assert.equal(panelCount(afterUndo), before);
    assert.equal(store.canRedo(DOCK_HISTORY_CHANNEL), true);
    assert.equal(typeof afterUndo.dock.rootId, 'string');
    assert.equal(typeof afterUndo.dock.nodes, 'object');
    assert.equal('kind' in (afterUndo.dock as Record<string, unknown>), false);

    store.dispatchIntent(UI_INTENTS.redoLayout, undefined, DOCK_UI_DISPATCH_OPTIONS);
    assert.equal(panelCount(store.getState()), before + 1);
});

test('requestOpenSettingsPanel updates section and open request id', () => {
    const store = createDockStore();
    const before = store.getState().ui.settingsPanelOpenRequestId;

    store.dispatchIntent(
        UI_INTENTS.requestOpenSettingsPanel,
        { section: 'shortcuts' },
        DOCK_UI_DISPATCH_OPTIONS,
    );
    const ui = store.getState().ui;
    assert.equal(ui.settingsPanelSection, 'shortcuts');
    assert.equal(ui.settingsPanelOpenRequestId, before + 1);
});
