import {
    $set,
    createGraphStore,
    type DispatchIntentOptions,
    type GraphState,
    type GraphiteRuntime,
} from '@loop-kit/graphite';
import {
    createDockIntentNames,
    createDockState,
    createDockPanelQuery,
    createGroupNode,
    createPanelNode,
    createSplitNode,
    registerDockIntents,
    type DockInteractionIntent,
    type DockPanelSummary,
    type DockState,
} from '@loop-kit/dock';

import type { GraphiteIntentEnvelope } from '../../../systems/graphite-dnd';
import type { GraphiteIntentRegistryEntry } from '../../../systems/graphite-intent-registry';
import {
    createShortcutBinding,
    type GraphiteShortcutBinding,
} from '../../../systems/graphite-shortcut-manager';
import type { QueryBuilderField } from '../../../systems/graphite-query-builder';
import { getActivePanelRef } from './dock-helpers';

export type DockBlockState = GraphState & {
    dock: DockState;
    ui: {
        shortcutsEnabled: boolean;
        showShortcutManager: boolean;
        showOverlay: boolean;
        showOverlayLabels: boolean;
    };
};

export const DOCK_HISTORY_CHANNEL = 'dock';
export const DOCK_INTENTS = createDockIntentNames('dock');
export const UI_INTENTS = {
    setShortcutsEnabled: 'dock/ui/set-shortcuts-enabled',
    setShortcutManagerVisible: 'dock/ui/set-shortcut-manager-visible',
    setOverlayVisible: 'dock/ui/set-overlay-visible',
    setOverlayLabelsVisible: 'dock/ui/set-overlay-labels-visible',
    undoLayout: 'dock/ui/undo-layout',
    redoLayout: 'dock/ui/redo-layout',
} as const;

export const DOCK_LAYOUT_DISPATCH_OPTIONS: DispatchIntentOptions<DockBlockState> =
    {
        history: DOCK_HISTORY_CHANNEL,
        metadata: { domain: 'dock' },
    };

export const DOCK_LAYOUT_TRANSIENT_DISPATCH_OPTIONS: DispatchIntentOptions<DockBlockState> =
    {
        history: false,
        event: false,
        metadata: { domain: 'dock', transient: true },
    };

export const DOCK_UI_DISPATCH_OPTIONS: DispatchIntentOptions<DockBlockState> = {
    history: false,
    event: false,
    metadata: { domain: 'dock', scope: 'ui' },
};

export const SHORTCUT_CONTEXT_FIELDS: QueryBuilderField[] = [
    { key: 'panelCount', label: 'Panel Count', type: 'number' },
    { key: 'canUndo', label: 'Can Undo', type: 'boolean' },
    { key: 'canRedo', label: 'Can Redo', type: 'boolean' },
    { key: 'overlayVisible', label: 'Overlay Visible', type: 'boolean' },
    { key: 'shortcutsEnabled', label: 'Shortcuts Enabled', type: 'boolean' },
];

function createDockFixture(): DockState {
    const explorer = createPanelNode('panel-explorer', 'Explorer');
    const editor = createPanelNode('panel-editor', 'Editor');
    const preview = createPanelNode('panel-preview', 'Preview');
    const consolePanel = createPanelNode('panel-console', 'Console');

    const leftGroup = createGroupNode('group-left', [explorer.id], explorer.id);
    const centerGroup = createGroupNode(
        'group-center',
        [editor.id, preview.id],
        editor.id,
    );
    const bottomGroup = createGroupNode(
        'group-bottom',
        [consolePanel.id],
        consolePanel.id,
    );

    const centerSplit = createSplitNode(
        'split-center',
        'col',
        [centerGroup.id, bottomGroup.id],
        [0.72, 0.28],
    );
    const rootSplit = createSplitNode(
        'split-root',
        'row',
        [leftGroup.id, centerSplit.id],
        [0.26, 0.74],
    );

    return createDockState({
        rootId: rootSplit.id,
        floatRootId: 'float-root-main',
        nodes: {
            [explorer.id]: explorer,
            [editor.id]: editor,
            [preview.id]: preview,
            [consolePanel.id]: consolePanel,
            [leftGroup.id]: leftGroup,
            [centerGroup.id]: centerGroup,
            [bottomGroup.id]: bottomGroup,
            [centerSplit.id]: centerSplit,
            [rootSplit.id]: rootSplit,
        },
    });
}

export function createPreviewDockFixture(): DockState {
    const outline = createPanelNode('panel-outline', 'Outline');
    const code = createPanelNode('panel-code', 'Code');
    const notes = createPanelNode('panel-notes', 'Notes');

    const leftGroup = createGroupNode(
        'group-preview-left',
        [outline.id, notes.id],
        outline.id,
    );
    const rightGroup = createGroupNode(
        'group-preview-right',
        [code.id],
        code.id,
    );
    const rootSplit = createSplitNode(
        'split-preview-root',
        'row',
        [leftGroup.id, rightGroup.id],
        [0.45, 0.55],
    );

    return createDockState({
        rootId: rootSplit.id,
        floatRootId: 'float-root-preview',
        nodes: {
            [outline.id]: outline,
            [code.id]: code,
            [notes.id]: notes,
            [leftGroup.id]: leftGroup,
            [rightGroup.id]: rightGroup,
            [rootSplit.id]: rootSplit,
        },
    });
}

export function createDockStore(
    dockFixture: DockState = createDockFixture(),
): GraphiteRuntime<DockBlockState> {
    const store = createGraphStore<DockBlockState>({
        initialState: {
            dock: dockFixture,
            ui: {
                shortcutsEnabled: true,
                showShortcutManager: false,
                showOverlay: true,
                showOverlayLabels: true,
            },
        },
        eventMode: 'when-observed',
        maxCommits: 2000,
    });

    registerDockIntents(store, {
        path: ['dock'],
        intentPrefix: 'dock',
    });

    store.registerIntent(
        UI_INTENTS.setShortcutsEnabled,
        (payload: { enabled?: boolean }) => ({
            ui: {
                shortcutsEnabled: $set(Boolean(payload.enabled)),
            },
        }),
    );

    store.registerIntent(
        UI_INTENTS.setShortcutManagerVisible,
        (payload: { visible?: boolean }) => ({
            ui: {
                showShortcutManager: $set(Boolean(payload.visible)),
            },
        }),
    );

    store.registerIntent(
        UI_INTENTS.setOverlayVisible,
        (payload: { visible?: boolean }) => ({
            ui: {
                showOverlay: $set(Boolean(payload.visible)),
            },
        }),
    );

    store.registerIntent(
        UI_INTENTS.setOverlayLabelsVisible,
        (payload: { visible?: boolean }) => ({
            ui: {
                showOverlayLabels: $set(Boolean(payload.visible)),
            },
        }),
    );

    store.registerIntent(UI_INTENTS.undoLayout, () => {
        store.undo(undefined, DOCK_HISTORY_CHANNEL);
        return null;
    });

    store.registerIntent(UI_INTENTS.redoLayout, () => {
        store.redo(undefined, DOCK_HISTORY_CHANNEL);
        return null;
    });

    return store;
}

function panelCount(state: Readonly<DockBlockState>) {
    return Object.values(state.dock.nodes).filter((node) => node.kind === 'panel')
        .length;
}

export function createDockIntentRegistry(
    includeDebug = true,
): GraphiteIntentRegistryEntry<DockBlockState>[] {
    const entries: GraphiteIntentRegistryEntry<DockBlockState>[] = [
        {
            id: 'dock.add-panel',
            intent: DOCK_INTENTS.addPanel,
            title: 'Add Panel',
            description: 'Create a new panel in the active group.',
            category: 'Dock',
            keywords: ['panel', 'create', 'tab'],
            dispatchOptions: DOCK_LAYOUT_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                title: `Panel ${panelCount(state) + 1}`,
            }),
        },
        {
            id: 'dock.remove-active-panel',
            intent: DOCK_INTENTS.removePanel,
            title: 'Remove Active Panel',
            description: 'Close the currently active panel.',
            category: 'Dock',
            keywords: ['panel', 'close', 'tab'],
            dispatchOptions: DOCK_LAYOUT_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => {
                const active = getActivePanelRef(state.dock);
                return active ? { panelId: active.panelId } : undefined;
            },
        },
        {
            id: 'dock.undo-layout',
            intent: UI_INTENTS.undoLayout,
            title: 'Undo Layout',
            description: 'Undo the last dock layout mutation.',
            category: 'History',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
        },
        {
            id: 'dock.redo-layout',
            intent: UI_INTENTS.redoLayout,
            title: 'Redo Layout',
            description: 'Redo the last undone dock layout mutation.',
            category: 'History',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
        },
    ];

    if (!includeDebug) {
        return entries;
    }

    entries.push(
        {
            id: 'dock.toggle-overlay',
            intent: UI_INTENTS.setOverlayVisible,
            title: 'Toggle Drop Overlay',
            description: 'Show or hide drop target guides.',
            category: 'Debug',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                visible: !state.ui.showOverlay,
            }),
        },
        {
            id: 'dock.toggle-overlay-labels',
            intent: UI_INTENTS.setOverlayLabelsVisible,
            title: 'Toggle Overlay Labels',
            description: 'Show or hide debug labels on drop guides.',
            category: 'Debug',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                visible: !state.ui.showOverlayLabels,
            }),
        },
        {
            id: 'dock.toggle-shortcuts',
            intent: UI_INTENTS.setShortcutsEnabled,
            title: 'Toggle Shortcuts',
            description: 'Enable or disable keyboard shortcuts.',
            category: 'Debug',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                enabled: !state.ui.shortcutsEnabled,
            }),
        },
        {
            id: 'dock.toggle-shortcut-manager',
            intent: UI_INTENTS.setShortcutManagerVisible,
            title: 'Toggle Shortcut Manager',
            description: 'Open or close shortcut manager panel.',
            category: 'Debug',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                visible: !state.ui.showShortcutManager,
            }),
        },
    );

    return entries;
}

export function createDefaultShortcutBindings(): GraphiteShortcutBinding[] {
    return [
        createShortcutBinding('dock.add-panel', 'alt+shift+n'),
        createShortcutBinding('dock.remove-active-panel', 'alt+shift+w'),
        createShortcutBinding('dock.undo-layout', 'mod+z'),
        createShortcutBinding('dock.redo-layout', 'mod+shift+z'),
        createShortcutBinding('dock.toggle-overlay', 'alt+shift+o'),
        createShortcutBinding('dock.toggle-overlay-labels', 'alt+shift+l'),
        createShortcutBinding('dock.toggle-shortcut-manager', 'alt+shift+k'),
    ].map((binding) => ({
        ...binding,
        enabled: true,
        preventDefault: true,
    }));
}

export function toDockInteractionEnvelope(
    intent: DockInteractionIntent | null,
): GraphiteIntentEnvelope<DockBlockState> | null {
    if (!intent) return null;

    if (intent.name === 'dock/move-panel') {
        return {
            intent: DOCK_INTENTS.movePanel,
            payload: intent.payload,
            options: DOCK_LAYOUT_DISPATCH_OPTIONS,
        };
    }

    return {
        intent: DOCK_INTENTS.resize,
        payload: intent.payload,
        options: intent.transient
            ? DOCK_LAYOUT_TRANSIENT_DISPATCH_OPTIONS
            : DOCK_LAYOUT_DISPATCH_OPTIONS,
    };
}

export const DOCK_PANEL_QUERY = createDockPanelQuery<DockBlockState>({
    path: ['dock'],
});

export type DockPanelList = DockPanelSummary[];
