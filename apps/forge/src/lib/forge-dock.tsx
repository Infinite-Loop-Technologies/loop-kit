'use client';

import * as React from 'react';

import { type DockV2State } from '@loop-kit/dock';

import { createForgePanelRegistry } from '../components/forge-panel-components';
import { createForgeDockState } from './forge-dock-model';

export function createForgeDockInitialState(): DockV2State {
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
