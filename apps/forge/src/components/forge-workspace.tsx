'use client';

import * as React from 'react';

import { DockProvider, DockStage } from '@loop-kit/loom-pack-dock';
import { LoomProvider } from '@loop-kit/loom-react';
import { baseReactTheme } from '@loop-kit/loom-theme-base-react';

import { createForgeDockInitialState, ForgeDockBindings, useForgeDockRegistry } from '../lib/forge-dock';
import { forgeReactTheme } from '../lib/forge-theme';
type ForgeWorkspaceRecord = { [key: string]: any };

export function ForgeWorkspace({ workspace }: { workspace: ForgeWorkspaceRecord }) {
    const initialState = React.useMemo(
        () =>
            createForgeDockInitialState({
                commandPaletteOpen: workspace.commandPaletteDefaultOpen,
                inspectorDock: workspace.inspectorDock === 'left' ? 'left' : 'right',
                sidePeekOpen: workspace.sidePeekDefaultOpen,
                workspaceMode: 'focus',
            }),
        [
            workspace.commandPaletteDefaultOpen,
            workspace.inspectorDock,
            workspace.sidePeekDefaultOpen,
        ],
    );
    const registry = useForgeDockRegistry();
    const colorMode = workspace.colorMode === 'light' ? 'light' : 'dark';

    return (
        <LoomProvider colorMode={colorMode} themes={[baseReactTheme, forgeReactTheme]}>
            <DockProvider initialState={initialState} registry={registry}>
                <ForgeDockBindings>
                    <DockStage />
                </ForgeDockBindings>
            </DockProvider>
        </LoomProvider>
    );
}
