import type { ComponentProps } from 'react';

import type { Icon } from '@loop-kit/loom-react';

export const forgeActionIds = {
    focusBrowser: 'forge.workspace.focus-browser',
    focusIssue: 'forge.workspace.focus-issue',
    focusMain: 'forge.workspace.focus-main',
    toggleCommandPalette: 'forge.command-palette.toggle',
    toggleInspector: 'forge.inspector.toggle',
    toggleSettings: 'forge.settings.toggle',
    toggleSidePeek: 'forge.side-peek.toggle',
    toggleWorkspaceMode: 'forge.workspace-mode.toggle',
} as const;

export type ForgeActionId = (typeof forgeActionIds)[keyof typeof forgeActionIds];

export type ForgeCommandItem = {
    actionId: ForgeActionId;
    description: string;
    icon: ComponentProps<typeof Icon>['name'];
    id: string;
    shortcut?: string;
    title: string;
};

export const forgeCommandItems: ForgeCommandItem[] = [
    {
        actionId: forgeActionIds.toggleCommandPalette,
        description: 'Close the palette or reopen it from anywhere in the workspace.',
        icon: 'search',
        id: 'command',
        shortcut: 'Ctrl+K',
        title: 'Toggle command palette',
    },
    {
        actionId: forgeActionIds.toggleSettings,
        description: 'Open workspace preferences and account controls.',
        icon: 'settings',
        id: 'settings',
        shortcut: 'Ctrl+,',
        title: 'Open settings',
    },
    {
        actionId: forgeActionIds.toggleInspector,
        description: 'Show or hide the inspector rail for the active workspace view.',
        icon: 'panelRight',
        id: 'inspector',
        title: 'Toggle inspector',
    },
    {
        actionId: forgeActionIds.toggleSidePeek,
        description: 'Open the side peek overlay without blocking the workspace underneath.',
        icon: 'panelRight',
        id: 'peek',
        title: 'Toggle side peek',
    },
    {
        actionId: forgeActionIds.toggleWorkspaceMode,
        description: 'Swap between a focused tabbed workspace and a split workspace demo.',
        icon: 'panelLeft',
        id: 'layout',
        title: 'Toggle split layout',
    },
    {
        actionId: forgeActionIds.focusMain,
        description: 'Focus the main outline workspace panel.',
        icon: 'fileText',
        id: 'focus-main',
        title: 'Focus outline panel',
    },
    {
        actionId: forgeActionIds.focusIssue,
        description: 'Focus the connected issue panel so it can be dragged or split.',
        icon: 'github',
        id: 'focus-issue',
        title: 'Focus connected issue panel',
    },
    {
        actionId: forgeActionIds.focusBrowser,
        description: 'Focus the reference browser panel so it can be dragged or split.',
        icon: 'globe',
        id: 'focus-browser',
        title: 'Focus reference browser panel',
    },
];
