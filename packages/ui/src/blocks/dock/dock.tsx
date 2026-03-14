'use client';

import * as React from 'react';
import { GraphiteProvider, useQuery } from '@loop-kit/graphite/react';
import { UiProvider } from '../../skins';

import { DockWorkbench, type DockWorkbenchMode } from './dock-workbench';
import {
    createDockStore,
    createPreviewDockFixture,
    type DockBlockState,
} from './dock-store';

type DockWorkspaceDemoProps = {
    mode?: DockWorkbenchMode;
};

function DockThemeBridge({ children }: { children: React.ReactNode }) {
    const mode = useQuery<DockBlockState, DockBlockState['skin']['mode']>(
        (state) => state.skin.mode,
    );
    const skinId = useQuery<DockBlockState, DockBlockState['skin']['skinId']>(
        (state) => state.skin.skinId,
    );
    const skins = useQuery<DockBlockState, DockBlockState['skin']['skins']>(
        (state) => state.skin.skins,
    );
    const activeSkin = skins[skinId];
    const fallbackSkin = Object.values(skins)[0];
    const skin = activeSkin ?? fallbackSkin;

    if (!skin) {
        return <>{children}</>;
    }

    return (
        <UiProvider skin={skin} mode={mode}>
            {children}
        </UiProvider>
    );
}

export function DockWorkspaceDemo({ mode = 'full' }: DockWorkspaceDemoProps) {
    const store = React.useMemo(
        () =>
            mode === 'preview'
                ? createDockStore(createPreviewDockFixture())
                : createDockStore(),
        [mode],
    );

    return (
        <GraphiteProvider store={store}>
            <DockThemeBridge>
                <DockWorkbench mode={mode} />
            </DockThemeBridge>
        </GraphiteProvider>
    );
}

export function DockWorkspaceBlock(props: { mode?: DockWorkbenchMode; className?: string }) {
    return <DockWorkbench {...props} />;
}

export { DockWorkbench as DockWorkbenchBlock };
export { DockWorkspaceDemo as DockWorkbenchDemo };

export default function DockBlockPage() {
    return <DockWorkspaceDemo mode='full' />;
}
