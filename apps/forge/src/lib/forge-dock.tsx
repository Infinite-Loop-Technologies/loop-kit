'use client';

import * as React from 'react';

import { type DockState } from '@loop-kit/dock';

import { createForgePanelRegistry } from '../components/forge-panel-components';
import { createForgeDockState } from './forge-dock-model';

export function createForgeDockInitialState(): DockState {
    return createForgeDockState({
        commandPaletteOpen: true,
        inspectorDock: 'right',
        inspectorOpen: true,
        sidePeekOpen: true,
        workspaceMode: 'focus',
    });
}

export function useForgeDockRegistry() {
    return React.useMemo(() => createForgePanelRegistry(), []);
}
