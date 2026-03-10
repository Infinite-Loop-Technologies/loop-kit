import {
    createDockState,
    createGroupNode,
    createPanelNode,
    createSplitNode,
    type DockState,
} from '../src/index.js';

export type GraphiteDockFixture = {
    dock: DockState;
    ids: {
        panelExplorer: string;
        panelEditor: string;
        panelPreview: string;
        panelConsole: string;
        groupLeft: string;
        groupCenter: string;
        groupBottom: string;
        splitCenter: string;
        splitRoot: string;
    };
};

export function createGraphiteDockFixture(): GraphiteDockFixture {
    const panelExplorer = createPanelNode('panel-explorer', 'Explorer');
    const panelEditor = createPanelNode('panel-editor', 'Editor');
    const panelPreview = createPanelNode('panel-preview', 'Preview');
    const panelConsole = createPanelNode('panel-console', 'Console');

    const groupLeft = createGroupNode('group-left', [panelExplorer.id], panelExplorer.id);
    const groupCenter = createGroupNode(
        'group-center',
        [panelEditor.id, panelPreview.id],
        panelEditor.id,
    );
    const groupBottom = createGroupNode(
        'group-bottom',
        [panelConsole.id],
        panelConsole.id,
    );

    const splitCenter = createSplitNode(
        'split-center',
        'col',
        [groupCenter.id, groupBottom.id],
        [0.72, 0.28],
    );
    const splitRoot = createSplitNode(
        'split-root',
        'row',
        [groupLeft.id, splitCenter.id],
        [0.26, 0.74],
    );

    const dock = createDockState({
        rootId: splitRoot.id,
        nodes: {
            [panelExplorer.id]: panelExplorer,
            [panelEditor.id]: panelEditor,
            [panelPreview.id]: panelPreview,
            [panelConsole.id]: panelConsole,
            [groupLeft.id]: groupLeft,
            [groupCenter.id]: groupCenter,
            [groupBottom.id]: groupBottom,
            [splitCenter.id]: splitCenter,
            [splitRoot.id]: splitRoot,
        },
    });

    return {
        dock,
        ids: {
            panelExplorer: panelExplorer.id,
            panelEditor: panelEditor.id,
            panelPreview: panelPreview.id,
            panelConsole: panelConsole.id,
            groupLeft: groupLeft.id,
            groupCenter: groupCenter.id,
            groupBottom: groupBottom.id,
            splitCenter: splitCenter.id,
            splitRoot: splitRoot.id,
        },
    };
}
