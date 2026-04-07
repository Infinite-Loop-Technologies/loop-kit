import {
    createDockV2Group,
    createDockV2Panel,
    createDockV2State,
    type DockV2Controller,
    type DockV2Group,
    type DockV2State,
} from '@loop-kit/dock';

export const forgeLayerIds = {
    alert: 'layer-alert',
    command: 'layer-command',
    peek: 'layer-peek',
    workspace: 'layer-workspace',
} as const;

export const forgeGroupIds = {
    command: 'group-command-palette',
    inspector: 'group-inspector',
    peek: 'group-side-peek',
    sidebar: 'group-sidebar',
    workspace: 'group-workspace',
} as const;

export const forgePanelIds = {
    browser: 'panel-reference-browser',
    command: 'panel-command-palette',
    inspector: 'panel-inspector',
    issue: 'panel-connected-issue',
    main: 'panel-workspace-main',
    peek: 'panel-side-peek',
    sidebar: 'panel-sidebar',
} as const;

export type ForgeWorkspaceMode = 'focus' | 'split';
export type ForgeInspectorDock = 'left' | 'right';

type ForgeDockStateOptions = {
    commandPaletteOpen?: boolean;
    inspectorDock?: ForgeInspectorDock;
    inspectorOpen?: boolean;
    sidePeekOpen?: boolean;
    workspaceMode?: ForgeWorkspaceMode;
};

function createSidebarPanel() {
    return createDockV2Panel({
        id: forgePanelIds.sidebar,
        kind: 'sidebar',
        title: 'Sidebar',
    });
}

function createMainPanel() {
    return createDockV2Panel({
        id: forgePanelIds.main,
        kind: 'workspace-main',
        title: 'Forge Redesign',
    });
}

function createInspectorPanel() {
    return createDockV2Panel({
        id: forgePanelIds.inspector,
        kind: 'inspector',
        title: 'Inspector',
    });
}

function createCommandPalettePanel() {
    return createDockV2Panel({
        id: forgePanelIds.command,
        kind: 'command-palette',
        title: 'Command Palette',
    });
}

function createSidePeekPanel() {
    return createDockV2Panel({
        id: forgePanelIds.peek,
        kind: 'side-peek',
        title: 'Side Peek',
    });
}

function createIssuePanel() {
    return createDockV2Panel({
        id: forgePanelIds.issue,
        kind: 'workspace-issue',
        title: 'Connected issue',
    });
}

function createBrowserPanel() {
    return createDockV2Panel({
        id: forgePanelIds.browser,
        kind: 'workspace-browser',
        title: 'Design reference node',
    });
}

function createSidebarGroup() {
    return createDockV2Group({
        chrome: {
            framed: false,
            showTabs: false,
            showTitlebar: false,
        },
        id: forgeGroupIds.sidebar,
        layerId: forgeLayerIds.workspace,
        layout: {
            basis: '15.5rem',
            min: '14rem',
            width: '15.5rem',
        },
        mode: 'single',
        panelIds: [forgePanelIds.sidebar],
        policies: {
            attachable: false,
            closeable: false,
            movable: false,
            reorderable: false,
            splittable: false,
            stackable: false,
        },
        title: 'Navigation',
    });
}

function createWorkspaceGroup() {
    return createDockV2Group({
        chrome: {
            framed: false,
            showTabs: false,
            showTitlebar: false,
        },
        id: forgeGroupIds.workspace,
        layerId: forgeLayerIds.workspace,
        layout: {
            basis: 'auto',
            grow: 1,
            min: '0',
        },
        mode: 'single',
        panelIds: [forgePanelIds.main],
        policies: {
            closeable: false,
            reorderable: false,
            splittable: true,
        },
        title: 'Workspace',
    });
}

function createInspectorGroup() {
    return createDockV2Group({
        chrome: {
            framed: false,
            showTabs: false,
            showTitlebar: false,
        },
        id: forgeGroupIds.inspector,
        layerId: forgeLayerIds.workspace,
        layout: {
            basis: '20rem',
            min: '18rem',
            width: '20rem',
        },
        mode: 'single',
        panelIds: [forgePanelIds.inspector],
        policies: {
            attachable: false,
            closeable: true,
            reorderable: false,
            splittable: false,
            stackable: false,
        },
        title: 'Inspector',
    });
}

function createCommandGroup() {
    return createDockV2Group({
        chrome: {
            framed: false,
            showTabs: false,
            showTitlebar: false,
        },
        id: forgeGroupIds.command,
        layerId: forgeLayerIds.command,
        layout: {
            placement: {
                kind: 'center',
                left: 'calc(15.5rem + ((100vw - 15.5rem) / 2))',
                top: '4.875rem',
                width: 'min(42rem, calc(100vw - 18rem))',
            },
        },
        mode: 'swap',
        panelIds: [forgePanelIds.command],
        policies: {
            closeable: true,
            movable: false,
            reorderable: false,
            splittable: false,
        },
        title: 'Command Palette',
    });
}

function createSidePeekGroup() {
    return createDockV2Group({
        chrome: {
            framed: false,
            showTabs: false,
            showTitlebar: false,
        },
        id: forgeGroupIds.peek,
        layerId: forgeLayerIds.peek,
        layout: {
            placement: {
                edge: 'right',
                kind: 'edge',
                width: '23.75rem',
            },
        },
        mode: 'swap',
        panelIds: [forgePanelIds.peek],
        policies: {
            closeable: true,
            movable: false,
            reorderable: false,
            splittable: false,
        },
        title: 'Side Peek',
    });
}

function createBaseForgeDockState() {
    return createDockV2State({
        activeGroupId: forgeGroupIds.workspace,
        activeLayerId: forgeLayerIds.workspace,
        focusedPanelId: forgePanelIds.main,
        groups: {
            [forgeGroupIds.inspector]: createInspectorGroup(),
            [forgeGroupIds.sidebar]: createSidebarGroup(),
            [forgeGroupIds.workspace]: createWorkspaceGroup(),
        },
        layerOrder: [
            forgeLayerIds.workspace,
            forgeLayerIds.peek,
            forgeLayerIds.command,
            forgeLayerIds.alert,
        ],
        layers: {
            [forgeLayerIds.alert]: {
                groupIds: [],
                id: forgeLayerIds.alert,
                kind: 'overlay',
                overlay: {
                    behavior: 'queue',
                    interaction: 'modal',
                },
            },
            [forgeLayerIds.command]: {
                groupIds: [],
                id: forgeLayerIds.command,
                kind: 'overlay',
                overlay: {
                    behavior: 'replace',
                    interaction: 'modal',
                    maxGroups: 1,
                },
            },
            [forgeLayerIds.peek]: {
                groupIds: [],
                id: forgeLayerIds.peek,
                kind: 'overlay',
                overlay: {
                    behavior: 'replace',
                    interaction: 'passthrough',
                    maxGroups: 1,
                },
            },
            [forgeLayerIds.workspace]: {
                flow: {
                    direction: 'horizontal',
                    gap: '0',
                    reorder: 'horizontal-only',
                },
                groupIds: [forgeGroupIds.sidebar, forgeGroupIds.workspace, forgeGroupIds.inspector],
                id: forgeLayerIds.workspace,
                kind: 'flow',
            },
        },
        panels: {
            [forgePanelIds.inspector]: createInspectorPanel(),
            [forgePanelIds.main]: createMainPanel(),
            [forgePanelIds.sidebar]: createSidebarPanel(),
        },
    });
}

function ensureGroupOrder(
    state: DockV2State,
    dock: ForgeInspectorDock,
) {
    const workspaceLayer = state.layers[forgeLayerIds.workspace];
    workspaceLayer.groupIds = workspaceLayer.groupIds.filter((groupId) => groupId !== forgeGroupIds.inspector);

    const workspaceIndex = workspaceLayer.groupIds.indexOf(forgeGroupIds.workspace);
    const insertIndex =
        dock === 'left'
            ? Math.max(0, workspaceIndex)
            : workspaceLayer.groupIds.length;
    workspaceLayer.groupIds.splice(insertIndex, 0, forgeGroupIds.inspector);
}

function setInspectorOpen(
    state: DockV2State,
    open: boolean,
    dock: ForgeInspectorDock,
) {
    if (!open) {
        state.layers[forgeLayerIds.workspace].groupIds = state.layers[forgeLayerIds.workspace].groupIds.filter(
            (groupId) => groupId !== forgeGroupIds.inspector,
        );
        delete state.groups[forgeGroupIds.inspector];
        delete state.panels[forgePanelIds.inspector];
        return;
    }

    state.groups[forgeGroupIds.inspector] = createInspectorGroup();
    state.panels[forgePanelIds.inspector] = createInspectorPanel();
    ensureGroupOrder(state, dock);
}

function setWorkspaceMode(
    state: DockV2State,
    mode: ForgeWorkspaceMode,
) {
    const workspaceGroup = createWorkspaceGroup();

    if (mode === 'split') {
        state.panels[forgePanelIds.issue] = createIssuePanel();
        state.panels[forgePanelIds.browser] = createBrowserPanel();
        workspaceGroup.mode = 'split';
        workspaceGroup.panelIds = [forgePanelIds.main, forgePanelIds.issue, forgePanelIds.browser];
        workspaceGroup.splitNodes = {
            'split-workspace-col': {
                children: [
                    {
                        kind: 'panel',
                        panelId: forgePanelIds.issue,
                    },
                    {
                        kind: 'panel',
                        panelId: forgePanelIds.browser,
                    },
                ],
                direction: 'col',
                id: 'split-workspace-col',
                weights: [0.5, 0.5],
            },
            'split-workspace-row': {
                children: [
                    {
                        kind: 'panel',
                        panelId: forgePanelIds.main,
                    },
                    {
                        kind: 'split',
                        splitId: 'split-workspace-col',
                    },
                ],
                direction: 'row',
                id: 'split-workspace-row',
                weights: [0.66, 0.34],
            },
        };
        workspaceGroup.splitRootId = 'split-workspace-row';
    } else {
        delete state.panels[forgePanelIds.issue];
        delete state.panels[forgePanelIds.browser];
    }

    state.groups[forgeGroupIds.workspace] = workspaceGroup;
}

function setOverlayGroup(
    state: DockV2State,
    groupId: typeof forgeGroupIds.command | typeof forgeGroupIds.peek,
    open: boolean,
) {
    const layerId =
        groupId === forgeGroupIds.command
            ? forgeLayerIds.command
            : forgeLayerIds.peek;
    const layer = state.layers[layerId];

    layer.groupIds = layer.groupIds.filter((existingGroupId) => existingGroupId !== groupId);

    if (!open) {
        delete state.groups[groupId];
        delete state.panels[groupId === forgeGroupIds.command ? forgePanelIds.command : forgePanelIds.peek];
        return;
    }

    if (groupId === forgeGroupIds.command) {
        state.groups[groupId] = createCommandGroup();
        state.panels[forgePanelIds.command] = createCommandPalettePanel();
    } else {
        state.groups[groupId] = createSidePeekGroup();
        state.panels[forgePanelIds.peek] = createSidePeekPanel();
    }

    layer.groupIds.push(groupId);
}

function replaceState(
    controller: DockV2Controller,
    updater: (state: DockV2State) => DockV2State,
) {
    return controller.replaceState(updater(createDockV2State(controller.getState())));
}

export function getForgeWorkspaceMode(state: DockV2State): ForgeWorkspaceMode {
    return state.groups[forgeGroupIds.workspace]?.mode === 'split' ? 'split' : 'focus';
}

export function isForgeGroupOpen(
    state: DockV2State,
    groupId: string,
) {
    return state.layerOrder.some((layerId) => state.layers[layerId]?.groupIds.includes(groupId));
}

export function createForgeDockState(options: ForgeDockStateOptions = {}) {
    const workspaceMode = options.workspaceMode ?? 'focus';
    const inspectorDock = options.inspectorDock ?? 'right';
    const inspectorOpen = options.inspectorOpen ?? workspaceMode === 'focus';
    const commandPaletteOpen = options.commandPaletteOpen ?? true;
    const sidePeekOpen = options.sidePeekOpen ?? true;

    const state = createBaseForgeDockState();
    setWorkspaceMode(state, workspaceMode);
    setInspectorOpen(state, inspectorOpen, inspectorDock);
    setOverlayGroup(state, forgeGroupIds.command, commandPaletteOpen);
    setOverlayGroup(state, forgeGroupIds.peek, sidePeekOpen);
    return state;
}

export function toggleForgeWorkspaceMode(controller: DockV2Controller) {
    return replaceState(controller, (state) => {
        const nextMode = getForgeWorkspaceMode(state) === 'split' ? 'focus' : 'split';
        setWorkspaceMode(state, nextMode);
        setInspectorOpen(state, nextMode === 'focus', 'right');
        state.focusedPanelId = forgePanelIds.main;
        state.activeGroupId = forgeGroupIds.workspace;
        state.activeLayerId = forgeLayerIds.workspace;
        return state;
    });
}

export function toggleForgeInspector(controller: DockV2Controller) {
    return replaceState(controller, (state) => {
        const open = !isForgeGroupOpen(state, forgeGroupIds.inspector);
        setInspectorOpen(state, open, 'right');
        return state;
    });
}

export function dockForgeInspector(
    controller: DockV2Controller,
    dock: ForgeInspectorDock,
) {
    return replaceState(controller, (state) => {
        setInspectorOpen(state, true, dock);
        return state;
    });
}

export function openForgeCommandPalette(controller: DockV2Controller) {
    return replaceState(controller, (state) => {
        setOverlayGroup(state, forgeGroupIds.command, true);
        state.activeLayerId = forgeLayerIds.command;
        state.activeGroupId = forgeGroupIds.command;
        state.focusedPanelId = forgePanelIds.command;
        return state;
    });
}

export function toggleForgeCommandPalette(controller: DockV2Controller) {
    return replaceState(controller, (state) => {
        setOverlayGroup(state, forgeGroupIds.command, !isForgeGroupOpen(state, forgeGroupIds.command));
        return state;
    });
}

export function openForgeSidePeek(controller: DockV2Controller) {
    return replaceState(controller, (state) => {
        setOverlayGroup(state, forgeGroupIds.peek, true);
        return state;
    });
}

export function toggleForgeSidePeek(controller: DockV2Controller) {
    return replaceState(controller, (state) => {
        setOverlayGroup(state, forgeGroupIds.peek, !isForgeGroupOpen(state, forgeGroupIds.peek));
        return state;
    });
}
