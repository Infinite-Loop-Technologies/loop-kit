'use client';

import * as React from 'react';
import { GraphiteProvider } from '@loop-kit/graphite/react';

import { DockWorkbench, type DockWorkbenchMode } from './dock-workbench';
import { createDockStore, createPreviewDockFixture } from './dock-store';

type DockWorkbenchDemoProps = {
    mode?: DockWorkbenchMode;
};

export function DockWorkbenchDemo({ mode = 'full' }: DockWorkbenchDemoProps) {
    const store = React.useMemo(
        () =>
            mode === 'preview'
                ? createDockStore(createPreviewDockFixture())
                : createDockStore(),
        [mode],
    );

    return (
        <GraphiteProvider store={store}>
            <DockWorkbench mode={mode} />
        </GraphiteProvider>
    );
}

export default function DockBlockPage() {
    return <DockWorkbenchDemo mode='full' />;
}
