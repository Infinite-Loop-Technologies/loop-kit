import {
    $set,
    createGraphStore,
    type DispatchIntentOptions,
    type GraphState,
    type GraphiteRuntime,
    type IntentCompilerContext,
} from '@loop-kit/graphite';
import {
    createDockIntentNames,
    createDockPanelQuery,
    createDockState,
    createGroupNode,
    createPanelNode,
    createSplitNode,
    registerDockIntents,
    type DockInteractionIntent,
    type DockPanelSummary,
    type DockState,
} from '@loop-kit/dock';
import type { ColorMode } from '@loop-kit/loom-core';
import type { GraphiteIntentRegistryEntry, GraphiteShortcutBinding } from '@loop-kit/loom-pack-shortcuts';
import { createShortcutBinding } from '@loop-kit/loom-pack-shortcuts';
import type { QueryBuilderField } from '@loop-kit/loom-pack-data';

import type { DockIntentEnvelope } from './types';
import { getActivePanelRef } from './dock-helpers';

export const dockThemeIds = ['base', 'aquatic', 'neumorph'] as const;
export type DockThemeId = (typeof dockThemeIds)[number];
export type DockSettingsPanelSection = 'general' | 'overlay' | 'shortcuts';

export type DockStoreOptions = {
    activeGroupId?: string;
    initialColorMode?: ColorMode;
    initialThemeId?: DockThemeId;
    settingsPanelSection?: DockSettingsPanelSection;
    shortcutsEnabled?: boolean;
    showOverlay?: boolean;
    showOverlayLabels?: boolean;
};

export type DockBlockState = GraphState & {
    dock: DockState;
    ui: {
        activeGroupId: string;
        colorMode: ColorMode;
        settingsPanelSection: DockSettingsPanelSection;
        settingsPanelOpenRequestId: number;
        shortcutsEnabled: boolean;
        showOverlay: boolean;
        showOverlayLabels: boolean;
        themeId: DockThemeId;
    };
};

export const DOCK_HISTORY_CHANNEL = 'dock';
export const DOCK_INTENTS = createDockIntentNames('dock');
export const UI_INTENTS = {
    nextTheme: 'dock/ui/next-theme',
    openSettings: 'dock/ui/open-settings',
    redoLayout: 'dock/ui/redo-layout',
    setActiveGroup: 'dock/ui/set-active-group',
    setColorMode: 'dock/ui/set-color-mode',
    setOverlayLabelsVisible: 'dock/ui/set-overlay-labels-visible',
    setOverlayVisible: 'dock/ui/set-overlay-visible',
    setSettingsPanelSection: 'dock/ui/set-settings-panel-section',
    setShortcutsEnabled: 'dock/ui/set-shortcuts-enabled',
    setThemeId: 'dock/ui/set-theme-id',
    undoLayout: 'dock/ui/undo-layout',
} as const;

export const DOCK_LAYOUT_DISPATCH_OPTIONS: DispatchIntentOptions<DockBlockState> = {
    history: DOCK_HISTORY_CHANNEL,
    metadata: { domain: 'dock' },
};

export const DOCK_LAYOUT_TRANSIENT_DISPATCH_OPTIONS: DispatchIntentOptions<DockBlockState> = {
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
    { key: 'colorMode', label: 'Color Mode', type: 'string' },
    { key: 'themeId', label: 'Theme Id', type: 'string' },
];

function createDockFixture(): DockState {
    const preview = createPanelNode('panel-preview', 'Preview');
    const catalog = createPanelNode('panel-catalog', 'Component Catalog');
    const shortcuts = createPanelNode('panel-shortcuts', 'Shortcuts');
    const notes = createPanelNode('panel-notes', 'Notes');
    const settings = createPanelNode('panel-settings', 'Settings');

    const leftGroup = createGroupNode('group-left', [catalog.id, notes.id], catalog.id);
    const centerGroup = createGroupNode('group-center', [preview.id, settings.id], preview.id);
    const bottomGroup = createGroupNode('group-bottom', [shortcuts.id], shortcuts.id);
    const centerSplit = createSplitNode('split-center', 'col', [centerGroup.id, bottomGroup.id], [0.7, 0.3]);
    const rootSplit = createSplitNode('split-root', 'row', [leftGroup.id, centerSplit.id], [0.34, 0.66]);

    return createDockState({
        rootId: rootSplit.id,
        floatRootId: 'float-root-main',
        nodes: {
            [preview.id]: preview,
            [catalog.id]: catalog,
            [shortcuts.id]: shortcuts,
            [notes.id]: notes,
            [settings.id]: settings,
            [leftGroup.id]: leftGroup,
            [centerGroup.id]: centerGroup,
            [bottomGroup.id]: bottomGroup,
            [centerSplit.id]: centerSplit,
            [rootSplit.id]: rootSplit,
        },
    });
}

export function createPreviewDockFixture(): DockState {
    const preview = createPanelNode('panel-preview', 'Preview');
    const settings = createPanelNode('panel-settings', 'Settings');
    const leftGroup = createGroupNode('group-preview-left', [preview.id], preview.id);
    const rightGroup = createGroupNode('group-preview-right', [settings.id], settings.id);
    const split = createSplitNode('split-preview-root', 'row', [leftGroup.id, rightGroup.id], [0.66, 0.34]);

    return createDockState({
        rootId: split.id,
        floatRootId: 'float-root-preview',
        nodes: {
            [preview.id]: preview,
            [settings.id]: settings,
            [leftGroup.id]: leftGroup,
            [rightGroup.id]: rightGroup,
            [split.id]: split,
        },
    });
}

function nextThemeId(current: DockThemeId): DockThemeId {
    const index = dockThemeIds.indexOf(current);
    return dockThemeIds[(index + 1) % dockThemeIds.length] ?? 'base';
}

function panelCount(state: Readonly<DockBlockState>) {
    return Object.values(state.dock.nodes).filter((node) => node.kind === 'panel').length;
}

export function createDockStore(
    dockFixture?: DockState,
    options: DockStoreOptions = {},
): GraphiteRuntime<DockBlockState> {
    const store = createGraphStore<DockBlockState>({
        initialState: {
            dock: dockFixture ?? createDockFixture(),
            ui: {
                activeGroupId: options.activeGroupId ?? 'group-center',
                colorMode: options.initialColorMode ?? 'dark',
                settingsPanelSection: options.settingsPanelSection ?? 'general',
                settingsPanelOpenRequestId: 0,
                shortcutsEnabled: options.shortcutsEnabled ?? true,
                showOverlay: options.showOverlay ?? true,
                showOverlayLabels: options.showOverlayLabels ?? true,
                themeId: options.initialThemeId ?? 'base',
            },
        },
        eventMode: 'when-observed',
        maxCommits: 2000,
    });

    registerDockIntents(store, {
        path: ['dock'],
        intentPrefix: 'dock',
    });

    store.registerIntent(UI_INTENTS.setActiveGroup, (payload: { groupId?: string }) => ({
        ui: {
            activeGroupId: $set(payload.groupId ?? ''),
        },
    }));

    store.registerIntent(UI_INTENTS.setShortcutsEnabled, (payload: { enabled?: boolean }) => ({
        ui: {
            shortcutsEnabled: $set(Boolean(payload.enabled)),
        },
    }));

    store.registerIntent(UI_INTENTS.setSettingsPanelSection, (payload: { section?: DockSettingsPanelSection }) => ({
        ui: {
            settingsPanelSection: $set(payload.section ?? 'general'),
        },
    }));

    store.registerIntent(
        UI_INTENTS.openSettings,
        (payload: { section?: DockSettingsPanelSection }, context: IntentCompilerContext<DockBlockState>) => ({
            ui: {
                settingsPanelSection: $set(payload.section ?? 'general'),
                settingsPanelOpenRequestId: $set(context.state.ui.settingsPanelOpenRequestId + 1),
            },
        }),
    );

    store.registerIntent(UI_INTENTS.setOverlayVisible, (payload: { visible?: boolean }) => ({
        ui: {
            showOverlay: $set(Boolean(payload.visible)),
        },
    }));

    store.registerIntent(UI_INTENTS.setOverlayLabelsVisible, (payload: { visible?: boolean }) => ({
        ui: {
            showOverlayLabels: $set(Boolean(payload.visible)),
        },
    }));

    store.registerIntent(UI_INTENTS.setColorMode, (payload: { mode?: ColorMode }) => ({
        ui: {
            colorMode: $set(payload.mode === 'light' ? 'light' : 'dark'),
        },
    }));

    store.registerIntent(UI_INTENTS.setThemeId, (payload: { themeId?: DockThemeId }) => ({
        ui: {
            themeId: $set(dockThemeIds.includes(payload.themeId as DockThemeId) ? (payload.themeId as DockThemeId) : 'base'),
        },
    }));

    store.registerIntent(UI_INTENTS.nextTheme, (_payload, context: IntentCompilerContext<DockBlockState>) => ({
        ui: {
            themeId: $set(nextThemeId(context.state.ui.themeId)),
        },
    }));

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
                groupId: state.ui.activeGroupId,
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
                const active = getActivePanelRef(state.dock, state.ui.activeGroupId);
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
        {
            id: 'dock.toggle-mode',
            intent: UI_INTENTS.setColorMode,
            title: 'Toggle Color Mode',
            description: 'Switch between light and dark modes.',
            category: 'Theme',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                mode: state.ui.colorMode === 'dark' ? 'light' : 'dark',
            }),
        },
        {
            id: 'dock.next-theme',
            intent: UI_INTENTS.nextTheme,
            title: 'Next Theme',
            description: 'Cycle between base, aquatic, and neumorph themes.',
            category: 'Theme',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
        },
        {
            id: 'dock.open-settings',
            intent: UI_INTENTS.openSettings,
            title: 'Open Settings',
            description: 'Focus the dock settings panel.',
            category: 'UI',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: { section: 'general' as const },
        },
    ];

    if (!includeDebug) {
        return entries;
    }

    entries.push(
        {
            id: 'dock.toggle-overlay',
            intent: UI_INTENTS.setOverlayVisible,
            title: 'Toggle Overlay',
            description: 'Show or hide drop target guides.',
            category: 'Debug',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                visible: !state.ui.showOverlay,
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
    );

    return entries;
}

export function createDefaultShortcutBindings(): GraphiteShortcutBinding[] {
    return [
        createShortcutBinding('dock.add-panel', 'alt+shift+n'),
        createShortcutBinding('dock.remove-active-panel', 'alt+shift+w'),
        createShortcutBinding('dock.undo-layout', 'mod+z'),
        createShortcutBinding('dock.redo-layout', 'mod+shift+z'),
        createShortcutBinding('dock.toggle-mode', 'alt+shift+t'),
        createShortcutBinding('dock.next-theme', 'alt+shift+p'),
        createShortcutBinding('dock.open-settings', 'alt+,'),
        createShortcutBinding('dock.toggle-overlay', 'alt+shift+o'),
    ].map((binding) => ({
        ...binding,
        enabled: true,
        preventDefault: true,
    }));
}

export function toDockInteractionEnvelope(
    intent: DockInteractionIntent | null,
): DockIntentEnvelope | null {
    if (!intent) {
        return null;
    }

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
