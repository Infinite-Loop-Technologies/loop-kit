'use client';

import { useMemo } from 'react';
import { $set, createGraphStore, type GraphState, type GraphiteRuntime } from '@loop-kit/graphite';

import type { GraphiteIntentRegistryEntry } from './graphite-intent-registry';
import {
    createShortcutBinding,
    useGraphiteShortcutBindings,
    type GraphiteShortcutBinding,
} from './graphite-shortcut-manager';
import type { QueryBuilderField } from './graphite-query-builder';

export type DynamicPanelsWorkspaceId = 'workbench' | 'sidebar';
export type DynamicPanelsTabMode = 'horizontal' | 'compact' | 'vertical';

export type PanelCommandIntent =
    | 'panels/new-tab'
    | 'panels/close-tab'
    | 'panels/close-group'
    | 'panels/split-right'
    | 'panels/split-down'
    | 'panels/cycle-group-next'
    | 'panels/cycle-group-previous'
    | 'panels/save-layout'
    | 'panels/restore-layout'
    | 'panels/undo-layout'
    | 'panels/redo-layout'
    | 'panels/cycle-tab-mode';

export interface DynamicPanelsState extends GraphState {
    ui: {
        activeWorkspace: DynamicPanelsWorkspaceId;
        defaultTabMode: DynamicPanelsTabMode;
        shortcutsEnabled: boolean;
        showShortcutManager: boolean;
        groupTabModes: Record<string, DynamicPanelsTabMode>;
    };
    layouts: Record<DynamicPanelsWorkspaceId, unknown | null>;
    savedLayouts: Record<DynamicPanelsWorkspaceId, unknown | null>;
    panelCounts: Record<DynamicPanelsWorkspaceId, number>;
}

const PANEL_COMMANDS: PanelCommandIntent[] = [
    'panels/new-tab',
    'panels/close-tab',
    'panels/close-group',
    'panels/split-right',
    'panels/split-down',
    'panels/cycle-group-next',
    'panels/cycle-group-previous',
    'panels/save-layout',
    'panels/restore-layout',
    'panels/undo-layout',
    'panels/redo-layout',
    'panels/cycle-tab-mode',
];

function nextTabMode(mode: DynamicPanelsTabMode): DynamicPanelsTabMode {
    if (mode === 'horizontal') return 'compact';
    if (mode === 'compact') return 'vertical';
    return 'horizontal';
}

export function createDynamicPanelsState(): DynamicPanelsState {
    return {
        ui: {
            activeWorkspace: 'workbench',
            defaultTabMode: 'horizontal',
            shortcutsEnabled: true,
            showShortcutManager: false,
            groupTabModes: {},
        },
        layouts: {
            workbench: null,
            sidebar: null,
        },
        savedLayouts: {
            workbench: null,
            sidebar: null,
        },
        panelCounts: {
            workbench: 0,
            sidebar: 0,
        },
    };
}

export function createDynamicPanelsStore(): GraphiteRuntime<DynamicPanelsState> {
    const store = createGraphStore<DynamicPanelsState>({
        initialState: createDynamicPanelsState(),
        eventMode: 'when-observed',
        maxCommits: 1200,
    });

    store.registerIntent(
        'panels/ui/set-active-workspace',
        (payload: { workspace?: DynamicPanelsWorkspaceId }) => {
            if (!payload.workspace) return null;
            return {
                ui: {
                    activeWorkspace: $set(payload.workspace),
                },
            };
        },
    );

    store.registerIntent(
        'panels/ui/set-default-tab-mode',
        (payload: { mode?: DynamicPanelsTabMode }) => {
            if (!payload.mode) return null;
            return {
                ui: {
                    defaultTabMode: $set(payload.mode),
                },
            };
        },
    );

    store.registerIntent(
        'panels/ui/cycle-group-tab-mode',
        (payload: { groupId?: string }, { state }) => {
            const groupId = payload.groupId?.trim();
            if (!groupId) return null;
            const current =
                state.ui.groupTabModes[groupId] ?? state.ui.defaultTabMode;
            return {
                ui: {
                    groupTabModes: {
                        [groupId]: $set(nextTabMode(current)),
                    },
                },
            };
        },
    );

    store.registerIntent(
        'panels/ui/set-shortcuts-enabled',
        (payload: { enabled?: boolean }) => ({
            ui: {
                shortcutsEnabled: $set(Boolean(payload.enabled)),
            },
        }),
    );

    store.registerIntent(
        'panels/ui/set-shortcut-manager-visible',
        (payload: { visible?: boolean }) => ({
            ui: {
                showShortcutManager: $set(Boolean(payload.visible)),
            },
        }),
    );

    for (const intentName of PANEL_COMMANDS) {
        store.registerIntent(intentName, () => ({}));
    }

    return store;
}

export function createDynamicPanelsIntentRegistry(): GraphiteIntentRegistryEntry<DynamicPanelsState>[] {
    return [
        {
            id: 'panels.new-tab',
            intent: 'panels/new-tab',
            title: 'New Tab',
            description: 'Create a new tab in the active workspace.',
            category: 'Panels',
            keywords: ['add', 'panel', 'tab'],
        },
        {
            id: 'panels.split-right',
            intent: 'panels/split-right',
            title: 'Split Right',
            description: 'Split active panel to the right.',
            category: 'Panels',
        },
        {
            id: 'panels.close-tab',
            intent: 'panels/close-tab',
            title: 'Close Tab',
            description: 'Close the active tab in the active workspace.',
            category: 'Panels',
        },
        {
            id: 'panels.close-group',
            intent: 'panels/close-group',
            title: 'Close Group',
            description: 'Close the active group in the active workspace.',
            category: 'Panels',
        },
        {
            id: 'panels.split-down',
            intent: 'panels/split-down',
            title: 'Split Down',
            description: 'Split active panel below.',
            category: 'Panels',
        },
        {
            id: 'panels.cycle-group-next',
            intent: 'panels/cycle-group-next',
            title: 'Next Group',
            description: 'Cycle focus to the next group.',
            category: 'Navigation',
        },
        {
            id: 'panels.cycle-group-previous',
            intent: 'panels/cycle-group-previous',
            title: 'Previous Group',
            description: 'Cycle focus to the previous group.',
            category: 'Navigation',
        },
        {
            id: 'panels.undo-layout',
            intent: 'panels/undo-layout',
            title: 'Undo Layout',
            description: 'Undo layout changes in the active workspace.',
            category: 'History',
        },
        {
            id: 'panels.redo-layout',
            intent: 'panels/redo-layout',
            title: 'Redo Layout',
            description: 'Redo layout changes in the active workspace.',
            category: 'History',
        },
        {
            id: 'panels.save-layout',
            intent: 'panels/save-layout',
            title: 'Save Layout',
            description: 'Persist layout snapshot for this workspace.',
            category: 'Layout',
        },
        {
            id: 'panels.restore-layout',
            intent: 'panels/restore-layout',
            title: 'Restore Layout',
            description: 'Restore persisted layout snapshot.',
            category: 'Layout',
        },
        {
            id: 'panels.cycle-tab-mode',
            intent: 'panels/cycle-tab-mode',
            title: 'Cycle Tab Mode',
            description: 'Cycle tab presentation mode for active group.',
            category: 'Layout',
        },
    ];
}

export function createDefaultDynamicPanelsShortcutBindings() {
    return [
        createShortcutBinding('panels.new-tab', 'alt+shift+n'),
        createShortcutBinding('panels.close-tab', 'alt+shift+w'),
        createShortcutBinding('panels.close-group', 'alt+shift+g'),
        createShortcutBinding('panels.split-right', 'alt+shift+]'),
        createShortcutBinding('panels.split-down', 'alt+shift+/'),
        createShortcutBinding('panels.cycle-group-next', 'shift+tab'),
        createShortcutBinding(
            'panels.cycle-group-previous',
            'ctrl+shift+tab',
        ),
        createShortcutBinding('panels.undo-layout', 'alt+shift+z'),
        createShortcutBinding('panels.redo-layout', 'alt+shift+y'),
        createShortcutBinding('panels.save-layout', 'alt+shift+s'),
        createShortcutBinding('panels.restore-layout', 'alt+shift+r'),
        createShortcutBinding('panels.cycle-tab-mode', 'alt+shift+m'),
    ].map((binding) => ({
        ...binding,
        enabled: true,
        preventDefault: true,
    })) satisfies GraphiteShortcutBinding[];
}

export const DYNAMIC_PANELS_SHORTCUT_CONTEXT_FIELDS: QueryBuilderField[] = [
    {
        key: 'activeWorkspace',
        label: 'Active Workspace',
        type: 'string',
    },
    {
        key: 'panelCount',
        label: 'Panel Count',
        type: 'number',
    },
    {
        key: 'hasLayout',
        label: 'Has Layout',
        type: 'boolean',
    },
    {
        key: 'isSidebarWorkspace',
        label: 'Sidebar Workspace',
        type: 'boolean',
    },
    {
        key: 'defaultTabMode',
        label: 'Default Tab Mode',
        type: 'string',
    },
];

export function useDynamicPanelsShortcutSystem(
    intents: readonly GraphiteIntentRegistryEntry<DynamicPanelsState>[],
    bindings: readonly GraphiteShortcutBinding[],
    enabled: boolean,
) {
    const contextSelector = useMemo(
        () => (state: Readonly<DynamicPanelsState>) => {
            const activeWorkspace = state.ui.activeWorkspace;
            const panelCount = state.panelCounts[activeWorkspace] ?? 0;
            return {
                activeWorkspace,
                panelCount,
                hasLayout: Boolean(state.layouts[activeWorkspace]),
                isSidebarWorkspace: activeWorkspace === 'sidebar',
                defaultTabMode: state.ui.defaultTabMode,
            };
        },
        [],
    );

    return useGraphiteShortcutBindings<DynamicPanelsState>({
        intents,
        bindings,
        contextSelector,
        enabled,
        allowInEditable: true,
    });
}
