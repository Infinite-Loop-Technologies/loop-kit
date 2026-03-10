'use client';

import * as React from 'react';
import { GraphiteProvider, useQuery } from '@loop-kit/graphite/react';
import { ThemeProvider } from '../../theme';

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
    const mode = useQuery<DockBlockState, DockBlockState['theme']['mode']>(
        (state) => state.theme.mode,
    );
    const presetId = useQuery<DockBlockState, DockBlockState['theme']['presetId']>(
        (state) => state.theme.presetId,
    );
    const presets = useQuery<DockBlockState, DockBlockState['theme']['presets']>(
        (state) => state.theme.presets,
    );
    const activePreset = presets[presetId];
    const fallbackPreset = Object.values(presets)[0];
    const preset = activePreset ?? fallbackPreset;

    if (!preset) {
        return <>{children}</>;
    }

    return (
        <ThemeProvider
            theme={{
                light: preset.themes.light,
                dark: preset.themes.dark,
            }}
            mode={mode}>
            {children}
        </ThemeProvider>
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
