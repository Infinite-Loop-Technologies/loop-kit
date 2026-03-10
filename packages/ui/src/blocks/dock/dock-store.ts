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

import type { GraphiteIntentEnvelope } from '../systems/graphite-dnd';
import type { GraphiteIntentRegistryEntry } from '../systems/graphite-intent-registry';
import {
    createShortcutBinding,
    type GraphiteShortcutBinding,
} from '../systems/graphite-shortcut-manager';
import type { QueryBuilderField } from '../systems/graphite-query-builder';
import { getActivePanelRef } from './dock-helpers';
import {
    createDockThemePresets,
    setThemeTokenValue,
    validateThemeSetEntry,
    type DockThemePresetMap,
} from './theme-state';

export type DockThemeState = {
    mode: ThemeMode;
    presetId: string;
    presets: DockThemePresetMap;
    validationMessage: string | null;
};

export type DockSettingsPanelSection = 'general' | 'overlay' | 'shortcuts';
export const SETTINGS_PANEL_ID = 'panel-settings';
export const SETTINGS_PANEL_TITLE = 'Workspace Settings';

export type DockBlockState = GraphState & {
    dock: DockState;
    theme: DockThemeState;
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
    setThemeMode: 'dock/theme/set-mode',
    setThemePreset: 'dock/theme/set-preset',
    setThemeToken: 'dock/theme/set-token',
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
    { key: 'themeMode', label: 'Theme Mode', type: 'string' },
    { key: 'themePreset', label: 'Theme Preset', type: 'string' },
];

const DEFAULT_THEME_PRESET_ID = 'graphite';

function createDockFixture(): DockState {
    const componentCatalog = createPanelNode('panel-component-catalog', 'Component Catalog');
    const preview = createPanelNode('panel-preview', 'Live Preview');
    const themeManager = createPanelNode('panel-theme-manager', 'Theme Manager');
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

function createInitialThemeState(): DockThemeState {
    const presets = createDockThemePresets();
    const presetId = presets[DEFAULT_THEME_PRESET_ID]
        ? DEFAULT_THEME_PRESET_ID
        : Object.keys(presets)[0]!;
    const mode: ThemeMode = 'dark';
    const validationMessage = validateThemeSetEntry(presets[presetId], mode);

    return {
        mode,
        presetId,
        presets,
        validationMessage,
    };
}

function panelCount(state: Readonly<DockBlockState>) {
    return Object.values(state.dock.nodes).filter((node) => node.kind === 'panel')
        .length;
}

function nextPresetId(state: Readonly<DockBlockState>): string {
    const ids = Object.keys(state.theme.presets);
    if (ids.length <= 0) {
        return state.theme.presetId;
    }
    const currentIndex = Math.max(0, ids.indexOf(state.theme.presetId));
    return ids[(currentIndex + 1) % ids.length]!;
}

export function createDockStore(
    dockFixture: DockState = createDockFixture(),
): GraphiteRuntime<DockBlockState> {
    const store = createGraphStore<DockBlockState>({
        initialState: {
            dock: dockFixture,
            theme: createInitialThemeState(),
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
        UI_INTENTS.setThemeMode,
        (
            payload: { mode?: ThemeMode },
            context: IntentCompilerContext<DockBlockState>,
        ) => {
            const mode = ThemeModeSchema.safeParse(payload.mode);
            if (!mode.success) {
                return null;
            }

            const preset = context.state.theme.presets[context.state.theme.presetId];
            if (!preset) {
                return null;
            }

            return {
                theme: {
                    mode: $set(mode.data),
                    validationMessage: $set(validateThemeSetEntry(preset, mode.data)),
                },
            };
        },
    );

    store.registerIntent(
        UI_INTENTS.setThemePreset,
        (
            payload: { presetId?: string },
            context: IntentCompilerContext<DockBlockState>,
        ) => {
            const nextPresetIdValue = payload.presetId;
            if (!nextPresetIdValue || !context.state.theme.presets[nextPresetIdValue]) {
                return null;
            }

            const nextPreset = context.state.theme.presets[nextPresetIdValue];
            return {
                theme: {
                    presetId: $set(nextPresetIdValue),
                    validationMessage: $set(
                        validateThemeSetEntry(nextPreset, context.state.theme.mode),
                    ),
                },
            };
        },
    );

    store.registerIntent(
        UI_INTENTS.setThemeToken,
        (
            payload: { path?: string; value?: string },
            context: IntentCompilerContext<DockBlockState>,
        ) => {
            const path = payload.path?.trim();
            if (!path || typeof payload.value !== 'string') {
                return null;
            }

            const state = context.state.theme;
            const preset = state.presets[state.presetId];
            if (!preset) {
                return null;
            }

            const mode = state.mode;
            const activeTheme = mode === 'dark' ? preset.themes.dark : preset.themes.light;
            const updatedTheme = setThemeTokenValue(activeTheme, path, payload.value);
            if (!updatedTheme) {
                return {
                    theme: {
                        validationMessage: $set(`Invalid token path: ${path}`),
                    },
                };
            }

            const nextPreset = {
                ...preset,
                themes: {
                    ...preset.themes,
                    [mode]: updatedTheme,
                },
            };
            const nextPresets = {
                ...state.presets,
                [preset.id]: nextPreset,
            };
            return {
                theme: {
                    presets: $set(nextPresets),
                    validationMessage: $set(validateThemeSetEntry(nextPreset, mode)),
                },
            };
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
            id: 'theme.toggle-mode',
            intent: UI_INTENTS.setThemeMode,
            title: 'Toggle Theme Mode',
            description: 'Switch between light and dark modes.',
            category: 'Theme',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                mode: state.theme.mode === 'dark' ? 'light' : 'dark',
            }),
        },
        {
            id: 'theme.next-preset',
            intent: UI_INTENTS.setThemePreset,
            title: 'Next Theme Preset',
            description: 'Cycle to the next theme preset.',
            category: 'Theme',
            dispatchOptions: DOCK_UI_DISPATCH_OPTIONS,
            payload: (state: Readonly<DockBlockState>) => ({
                presetId: nextPresetId(state),
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
        createShortcutBinding('theme.toggle-mode', 'alt+shift+t'),
        createShortcutBinding('theme.next-preset', 'alt+shift+p'),
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
