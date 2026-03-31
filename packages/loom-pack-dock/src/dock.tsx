'use client';

import * as React from 'react';
import type { GraphiteRuntime } from '@loop-kit/graphite';
import { GraphiteProvider, useQuery } from '@loop-kit/graphite-react';
import type { ColorMode } from '@loop-kit/loom-core';
import { InteractionProvider } from '@loop-kit/loom-interactions';
import { LoomProvider, type LoomReactThemeLayer } from '@loop-kit/loom-react';
import { aquaticReactTheme } from '@loop-kit/loom-theme-aquatic-react';
import { baseReactTheme } from '@loop-kit/loom-theme-base-react';
import { neumorphReactTheme } from '@loop-kit/loom-theme-neumorph-react';

import { DockWorkbench, type DockWorkbenchMode } from './dock-workbench';
import {
    createDockStore,
    createPreviewDockFixture,
    type DockBlockState,
    type DockStoreOptions,
} from './store';

type DockWorkspaceDemoProps = {
    className?: string;
    initialColorMode?: ColorMode;
    initialThemeId?: DockStoreOptions['initialThemeId'];
    mode?: DockWorkbenchMode;
    store?: GraphiteRuntime<DockBlockState>;
};

function resolveDockThemes(
    themeId: DockBlockState['ui']['themeId'],
): LoomReactThemeLayer[] {
    switch (themeId) {
        case 'aquatic':
            return [baseReactTheme, aquaticReactTheme];
        case 'neumorph':
            return [baseReactTheme, neumorphReactTheme];
        case 'base':
        default:
            return [baseReactTheme];
    }
}

function DockLoomBridge({ children }: { children: React.ReactNode }) {
    const colorMode = useQuery<DockBlockState, DockBlockState['ui']['colorMode']>(
        (state) => state.ui.colorMode,
    );
    const themeId = useQuery<DockBlockState, DockBlockState['ui']['themeId']>(
        (state) => state.ui.themeId,
    );
    const themes = React.useMemo(() => resolveDockThemes(themeId), [themeId]);

    return (
        <InteractionProvider>
            <LoomProvider colorMode={colorMode} themes={themes}>
                {children}
            </LoomProvider>
        </InteractionProvider>
    );
}

export function DockWorkspaceDemo({
    className,
    initialColorMode,
    initialThemeId,
    mode = 'full',
    store,
}: DockWorkspaceDemoProps) {
    const runtime = React.useMemo(
        () =>
            store ??
            (mode === 'preview'
                ? createDockStore(createPreviewDockFixture(), {
                      initialColorMode,
                      initialThemeId,
                  })
                : createDockStore(undefined, {
                      initialColorMode,
                      initialThemeId,
                  })),
        [initialColorMode, initialThemeId, mode, store],
    );

    return (
        <GraphiteProvider store={runtime}>
            <DockLoomBridge>
                <DockWorkbench className={className} mode={mode} />
            </DockLoomBridge>
        </GraphiteProvider>
    );
}

export function DockWorkspaceBlock({
    className,
    mode = 'full',
}: {
    className?: string;
    mode?: DockWorkbenchMode;
}) {
    return <DockWorkbench className={className} mode={mode} />;
}
