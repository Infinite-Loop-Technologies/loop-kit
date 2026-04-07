'use client';

import * as React from 'react';

import { DockProvider, DockStage } from '@loop-kit/loom-pack-dock';
import { LoomProvider } from '@loop-kit/loom-react';
import { baseReactTheme } from '@loop-kit/loom-theme-base-react';

import { createForgeDockInitialState, useForgeDockRegistry } from '../lib/forge-dock';
import { forgeReactTheme } from '../lib/forge-theme';

export function ForgeWorkspace() {
    const initialState = React.useMemo(() => createForgeDockInitialState(), []);
    const registry = useForgeDockRegistry();

    return (
        <LoomProvider colorMode='dark' themes={[baseReactTheme, forgeReactTheme]}>
            <DockProvider initialState={initialState} registry={registry}>
                <DockStage />
            </DockProvider>
        </LoomProvider>
    );
}
