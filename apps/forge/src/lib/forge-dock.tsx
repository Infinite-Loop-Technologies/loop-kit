'use client';

import * as React from 'react';

import { type DockState } from '@loop-kit/dock';
import { ScopedRegion, useRegisterActionHandler, useScopedShortcutMap } from '@loop-kit/interaction-react';
import { useDockStore } from '@loop-kit/loom-pack-dock';

import { createForgePanelRegistry } from '../components/forge-panel-components';
import { forgeActionIds } from './forge-actions';
import {
    createForgeDockState,
    forgePanelIds,
    toggleForgeCommandPalette,
    toggleForgeInspector,
    toggleForgeSettings,
    toggleForgeSidePeek,
    toggleForgeWorkspaceMode,
} from './forge-dock-model';

type ForgeDockInitialStateOptions = {
    commandPaletteOpen?: boolean;
    inspectorDock?: 'left' | 'right';
    inspectorOpen?: boolean;
    settingsOpen?: boolean;
    sidePeekOpen?: boolean;
    workspaceMode?: 'focus' | 'split';
};

export function createForgeDockInitialState(options: ForgeDockInitialStateOptions = {}): DockState {
    return createForgeDockState({
        commandPaletteOpen: options.commandPaletteOpen ?? true,
        inspectorDock: options.inspectorDock ?? 'right',
        inspectorOpen: options.inspectorOpen ?? true,
        settingsOpen: options.settingsOpen ?? false,
        sidePeekOpen: options.sidePeekOpen ?? true,
        workspaceMode: options.workspaceMode ?? 'focus',
    });
}

export function useForgeDockRegistry() {
    return React.useMemo(() => createForgePanelRegistry(), []);
}

export function ForgeDockBindings({ children }: { children: React.ReactNode }) {
    const controller = useDockStore();

    useScopedShortcutMap([
        { actionId: forgeActionIds.toggleCommandPalette, gesture: 'Mod+K' },
        { actionId: forgeActionIds.toggleSettings, gesture: 'Mod+,' },
        { actionId: forgeActionIds.toggleInspector, gesture: 'Mod+Shift+I' },
        { actionId: forgeActionIds.toggleSidePeek, gesture: 'Mod+.' },
        { actionId: forgeActionIds.toggleWorkspaceMode, gesture: 'Mod+\\' },
    ]);

    useRegisterActionHandler(forgeActionIds.toggleCommandPalette, () => {
        toggleForgeCommandPalette(controller);
        return { handled: true };
    });
    useRegisterActionHandler(forgeActionIds.toggleSettings, () => {
        toggleForgeSettings(controller);
        return { handled: true };
    });
    useRegisterActionHandler(forgeActionIds.toggleInspector, () => {
        toggleForgeInspector(controller);
        return { handled: true };
    });
    useRegisterActionHandler(forgeActionIds.toggleSidePeek, () => {
        toggleForgeSidePeek(controller);
        return { handled: true };
    });
    useRegisterActionHandler(forgeActionIds.toggleWorkspaceMode, () => {
        toggleForgeWorkspaceMode(controller);
        return { handled: true };
    });
    useRegisterActionHandler(forgeActionIds.focusMain, () => {
        controller.focusPanel(forgePanelIds.main, { history: false });
        return { handled: true };
    });
    useRegisterActionHandler(forgeActionIds.focusIssue, () => {
        controller.focusPanel(forgePanelIds.issue, { history: false });
        return { handled: true };
    });
    useRegisterActionHandler(forgeActionIds.focusBrowser, () => {
        controller.focusPanel(forgePanelIds.browser, { history: false });
        return { handled: true };
    });

    return (
        <ScopedRegion scopeId='forge-root' scopeKind='forge-root' style={{ display: 'contents' }}>
            {children}
        </ScopedRegion>
    );
}
