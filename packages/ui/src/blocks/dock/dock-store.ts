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
import { ThemeModeSchema, type ThemeMode } from '../../theme';
import { DEFAULT_UI_SKIN_ID } from '../../skins';

import type { GraphiteIntentEnvelope } from '../systems/graphite-dnd';
import type { GraphiteIntentRegistryEntry } from '../systems/graphite-intent-registry';
import {
    createShortcutBinding,
    type GraphiteShortcutBinding,
} from '../systems/graphite-shortcut-manager';
import type { QueryBuilderField } from '../systems/graphite-query-builder';
import { getActivePanelRef } from './dock-helpers';
import {
    createDockSkins,
    parseUiSkinDraft,
    setSkinTokenValue,
    validateUiSkinEntry,
    type DockSkinMap,
} from './theme-state';

export type DockSkinState = {
    mode: ThemeMode;
    skinId: string;
    skins: DockSkinMap;
    validationMessage: string | null;
};

export type DockSettingsPanelSection = 'general' | 'overlay' | 'shortcuts';
export const SETTINGS_PANEL_ID = 'panel-settings';
export const SETTINGS_PANEL_TITLE = 'Workspace Settings';

export type DockBlockState = GraphState & {
    dock: DockState;
    skin: DockSkinState;
    ui: {
        activeGroupId: string;
        shortcutsEnabled: boolean;
        settingsPanelSection: DockSettingsPanelSection;
        settingsPanelOpenRequestId: number;
        showOverlay: boolean;
        showOverlayLabels: boolean;
    };
};

export const DOCK_HISTORY_CHANNEL = 'dock';
export const DOCK_INTENTS = createDockIntentNames('dock');
export const UI_INTENTS = {
    setActiveGroup: 'dock/ui/set-active-group',
    setShortcutsEnabled: 'dock/ui/set-shortcuts-enabled',
    setSettingsPanelSection: 'dock/ui/set-settings-panel-section',
    requestOpenSettingsPanel: 'dock/ui/request-open-settings-panel',
    setOverlayVisible: 'dock/ui/set-overlay-visible',
    setOverlayLabelsVisible: 'dock/ui/set-overlay-labels-visible',
    setSkinMode: 'dock/skin/set-mode',
    setSkinId: 'dock/skin/set-id',
    setSkinToken: 'dock/skin/set-token',
    importSkin: 'dock/skin/import',
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
    { key: 'skinMode', label: 'Skin Mode', type: 'string' },
    { key: 'skinId', label: 'Skin', type: 'string' },
];

function createDockFixture(): DockState {
    const componentCatalog = createPanelNode('panel-component-catalog', 'Component Catalog');
    const preview = createPanelNode('panel-preview', 'Live Preview');
    const themeManager = createPanelNode('panel-theme-manager', 'Skin Manager');
    const tokenEditor = createPanelNode('panel-token-editor', 'Token Editor');
    const shortcuts = createPanelNode('panel-shortcuts', 'Shortcut Status');
    const settings = createPanelNode(SETTINGS_PANEL_ID, SETTINGS_PANEL_TITLE);
    const consolePanel = createPanelNode('panel-console', 'Intent Console');

    const leftGroup = createGroupNode(
        'group-left',
        [componentCatalog.id, consolePanel.id],
        componentCatalog.id,
    );
    const centerGroup = createGroupNode(
        'group-center',
        [preview.id, themeManager.id],
        preview.id,
    );
    const rightGroup = createGroupNode('group-right', [tokenEditor.id], tokenEditor.id);
    const bottomGroup = createGroupNode(
        'group-bottom',
        [shortcuts.id, settings.id],
        shortcuts.id,
    );

    const centerSplit = createSplitNode(
        'split-center',
        'col',
        [centerGroup.id, bottomGroup.id],
        [0.7, 0.3],
    );
    const rootSplit = createSplitNode(
        'split-root',
        'row',
        [leftGroup.id, centerSplit.id, rightGroup.id],
        [0.24, 0.48, 0.28],
    );

    return createDockState({
        rootId: rootSplit.id,
        floatRootId: 'float-root-main',
        nodes: {
            [componentCatalog.id]: componentCatalog,
            [preview.id]: preview,
            [themeManager.id]: themeManager,
            [tokenEditor.id]: tokenEditor,
            [shortcuts.id]: shortcuts,
            [settings.id]: settings,
            [consolePanel.id]: consolePanel,
            [leftGroup.id]: leftGroup,
            [centerGroup.id]: centerGroup,
            [rightGroup.id]: rightGroup,
            [bottomGroup.id]: bottomGroup,
            [centerSplit.id]: centerSplit,
            [rootSplit.id]: rootSplit,
        },
    });
}

export function createPreviewDockFixture(): DockState {
    const preview = createPanelNode('panel-preview', 'Live Preview');
    const tokens = createPanelNode('panel-token-editor', 'Token Editor');
    const leftGroup = createGroupNode('group-preview-left', [preview.id], preview.id);
    const rightGroup = createGroupNode('group-preview-right', [tokens.id], tokens.id);
    const split = createSplitNode(
        'split-preview-root',
        'row',
        [leftGroup.id, rightGroup.id],
        [0.6, 0.4],
    );

    return createDockState({
        rootId: split.id,
        floatRootId: 'float-root-preview',
        nodes: {
            [preview.id]: preview,
            [tokens.id]: tokens,
            [leftGroup.id]: leftGroup,
            [rightGroup.id]: rightGroup,
            [split.id]: split,
        },
    });
}

function createInitialSkinState(): DockSkinState {
    const skins = createDockSkins();
    const skinId = skins[DEFAULT_UI_SKIN_ID]
        ? DEFAULT_UI_SKIN_ID
        : Object.keys(skins)[0]!;
    const mode: ThemeMode = 'dark';
    const validationMessage = validateUiSkinEntry(skins[skinId]!, mode);

    return {
        mode,
        skinId,
        skins,
        validationMessage,
    };
}

function panelCount(state: Readonly<DockBlockState>) {
    return Object.values(state.dock.nodes).filter((node) => node.kind === 'panel')
        .length;
}

function nextSkinId(state: Readonly<DockBlockState>): string {
    const ids = Object.keys(state.skin.skins);
    if (ids.length <= 0) {
        return state.skin.skinId;
    }
    const currentIndex = Math.max(0, ids.indexOf(state.skin.skinId));
    return ids[(currentIndex + 1) % ids.length]!;
}

export function createDockStore(
    dockFixture: DockState = createDockFixture(),
): GraphiteRuntime<DockBlockState> {
    const store = createGraphStore<DockBlockState>({
        initialState: {
            dock: dockFixture,
            skin: createInitialSkinState(),
            ui: {
                activeGroupId: 'group-center',
                shortcutsEnabled: true,
                settingsPanelSection: 'general',
                settingsPanelOpenRequestId: 0,
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
        UI_INTENTS.setActiveGroup,
        (payload: { groupId?: string }) => ({
            ui: {
                activeGroupId: $set(payload.groupId ?? ''),
            },
        }),
    );

    store.registerIntent(
        UI_INTENTS.setShortcutsEnabled,
        (payload: { enabled?: boolean }) => ({
            ui: {
                shortcutsEnabled: $set(Boolean(payload.enabled)),
            },
        }),
    );

    store.registerIntent(
        UI_INTENTS.setSettingsPanelSection,
        (payload: { section?: DockSettingsPanelSection }) => ({
            ui: {
                settingsPanelSection: $set(payload.section ?? 'general'),
            },
        }),
    );

    store.registerIntent(
        UI_INTENTS.requestOpenSettingsPanel,
        (
            payload: { section?: DockSettingsPanelSection },
            context: IntentCompilerContext<DockBlockState>,
        ) => ({
            ui: {
                settingsPanelSection: $set(payload.section ?? 'general'),
                settingsPanelOpenRequestId: $set(
                    context.state.ui.settingsPanelOpenRequestId + 1,
                ),
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

    store.registerIntent(
        UI_INTENTS.setSkinMode,
        (
            payload: { mode?: ThemeMode },
            context: IntentCompilerContext<DockBlockState>,
        ) => {
            const mode = ThemeModeSchema.safeParse(payload.mode);
            if (!mode.success) {
                return null;
            }

            const skin = context.state.skin.skins[context.state.skin.skinId];
            if (!skin) {
                return null;
            }

            return {
                skin: {
                    mode: $set(mode.data),
                    validationMessage: $set(validateUiSkinEntry(skin, mode.data)),
                },
            };
        },
    );

    store.registerIntent(
        UI_INTENTS.setSkinId,
        (
            payload: { skinId?: string },
            context: IntentCompilerContext<DockBlockState>,
        ) => {
            const nextSkinIdValue = payload.skinId;
            if (!nextSkinIdValue || !context.state.skin.skins[nextSkinIdValue]) {
                return null;
            }

            const nextSkin = context.state.skin.skins[nextSkinIdValue];
            return {
                skin: {
                    skinId: $set(nextSkinIdValue),
                    validationMessage: $set(
                        validateUiSkinEntry(nextSkin, context.state.skin.mode),
                    ),
                },
            };
        },
    );

    store.registerIntent(
        UI_INTENTS.setSkinToken,
        (
            payload: { path?: string; value?: string },
            context: IntentCompilerContext<DockBlockState>,
        ) => {
            const path = payload.path?.trim();
            if (!path || typeof payload.value !== 'string') {
                return null;
            }

            const state = context.state.skin;
            const skin = state.skins[state.skinId];
            if (!skin) {
                return null;
            }

            const nextSkin = setSkinTokenValue(skin, state.mode, path, payload.value);
            if (!nextSkin) {
                return {
                    skin: {
                        validationMessage: $set(`Invalid token path: ${path}`),
                    },
                };
            }

            const nextSkins = {
                ...state.skins,
                [skin.id]: nextSkin,
            };

            return {
                skin: {
                    skins: $set(nextSkins),
                    validationMessage: $set(validateUiSkinEntry(nextSkin, state.mode)),
                },
            };
        },
    );

    store.registerIntent(
        UI_INTENTS.importSkin,
        (
            payload: { skinText?: string },
            context: IntentCompilerContext<DockBlockState>,
        ) => {
            const raw = payload.skinText?.trim();
            if (!raw) {
                return null;
            }

            try {
                const importedSkin = parseUiSkinDraft(raw, context.state.skin.skins);
                const nextSkins = {
                    ...context.state.skin.skins,
                    [importedSkin.id]: importedSkin,
                };

                return {
                    skin: {
                        skins: $set(nextSkins),
                        skinId: $set(importedSkin.id),
                        validationMessage: $set(
                            validateUiSkinEntry(importedSkin, context.state.skin.mode),
                        ),
                    },
                };
            } catch (error) {
                return {
                    skin: {
                        validationMessage: $set(String(error)),
                    },
                };
            }
        },
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
            id: 'skin.toggle-mode',
            intent: UI_INTENTS.setSkinMode,
            title: 'Toggle Skin Mode',
            description: 'Switch between light and dark modes.',
            category: 'Skin',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                mode: state.skin.mode === 'dark' ? 'light' : 'dark',
            }),
        },
        {
            id: 'skin.next',
            intent: UI_INTENTS.setSkinId,
            title: 'Next Skin',
            description: 'Cycle to the next shared skin.',
            category: 'Skin',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                skinId: nextSkinId(state),
            }),
        },
        {
            id: 'ui.open-settings-panel',
            intent: UI_INTENTS.requestOpenSettingsPanel,
            title: 'Open Settings Panel',
            description: 'Focus dock settings and shortcut configuration panel.',
            category: 'UI',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                section: state.ui.settingsPanelSection,
            }),
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
    );

    return entries;
}

export function createDefaultShortcutBindings(): GraphiteShortcutBinding[] {
    return [
        createShortcutBinding('dock.add-panel', 'alt+shift+n'),
        createShortcutBinding('dock.remove-active-panel', 'alt+shift+w'),
        createShortcutBinding('dock.undo-layout', 'mod+z'),
        createShortcutBinding('dock.redo-layout', 'mod+shift+z'),
        createShortcutBinding('skin.toggle-mode', 'alt+shift+t'),
        createShortcutBinding('skin.next', 'alt+shift+p'),
        createShortcutBinding('ui.open-settings-panel', 'alt+,'),
        createShortcutBinding('dock.toggle-overlay', 'alt+shift+o'),
        createShortcutBinding('dock.toggle-overlay-labels', 'alt+shift+l'),
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
