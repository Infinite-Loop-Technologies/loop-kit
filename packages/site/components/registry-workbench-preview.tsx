'use client';

import * as React from 'react';
import {
    DockviewReact,
    type DockviewReadyEvent,
    type DockviewTheme,
    type IDockviewPanelProps,
} from 'dockview-react';

import { Badge } from '@/components/ui/badge';
import CodeEditor from '@/registry/new-york/blocks/code-editor/components/code-editor';
import OutlineEditor from '@/registry/new-york/blocks/block-editor/components/outline-editor';

import 'dockview-react/dist/styles/dockview.css';
import '@/registry/new-york/blocks/dockview/components/dv-theme.css';

type ShowcasePanelParams = {
    kind: 'code' | 'outline' | 'info';
};

const DOCKVIEW_THEME: DockviewTheme = {
    name: 'loop-kit-shadcn',
    className: 'dockview-theme-shadcn',
    gap: 8,
};

const DEMO_CODE = `import { DockviewReact } from 'dockview-react'

const panels = ['outline-editor', 'code-editor']

export function DynamicPanelsWorkbench() {
  return <DockviewReact />
}
`;

function ShowcasePanel({ params }: IDockviewPanelProps<ShowcasePanelParams>) {
    if (params?.kind === 'outline') {
        return (
            <div className='h-full overflow-auto p-3'>
                <OutlineEditor />
            </div>
        );
    }

    if (params?.kind === 'code') {
        return (
            <div className='h-full overflow-hidden'>
                <CodeEditor value={DEMO_CODE} height='100%' />
            </div>
        );
    }

    return (
        <div className='flex h-full flex-col gap-2 p-4'>
            <h3 className='text-sm font-semibold'>Panel System + Real Blocks</h3>
            <p className='text-sm text-muted-foreground'>
                This workbench is running the dynamic panels system with live registry blocks in each
                panel.
            </p>
            <div className='flex flex-wrap gap-2'>
                <Badge variant='secondary'>dynamic-panels</Badge>
                <Badge variant='secondary'>code-editor</Badge>
                <Badge variant='secondary'>block-editor</Badge>
            </div>
        </div>
    );
}

export default function RegistryWorkbenchPreview() {
    const initializedRef = React.useRef(false);

    const handleReady = React.useCallback((event: DockviewReadyEvent) => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const outlinePanel = event.api.addPanel({
            id: 'home-outline-editor',
            component: 'showcase',
            title: 'Outline Editor',
            params: { kind: 'outline' },
        });

        const codePanel = event.api.addPanel({
            id: 'home-code-editor',
            component: 'showcase',
            title: 'Code Editor',
            params: { kind: 'code' },
            position: {
                direction: 'right',
                referencePanel: outlinePanel,
            },
        });

        event.api.addPanel({
            id: 'home-panel-info',
            component: 'showcase',
            title: 'Registry Notes',
            params: { kind: 'info' },
            position: {
                direction: 'below',
                referencePanel: codePanel,
            },
        });
    }, []);

    return (
        <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                <Badge variant='outline'>Dynamic panel system</Badge>
                <span>Code editor + outline editor are mounted in real panels.</span>
            </div>
            <div className='h-[560px] overflow-hidden rounded-xl border bg-card'>
                <DockviewReact
                    className='dockview-theme-shadcn h-full w-full'
                    theme={DOCKVIEW_THEME}
                    components={{ showcase: ShowcasePanel }}
                    onReady={handleReady}
                    hideBorders
                    disableTabsOverflowList
                    scrollbars='custom'
                />
            </div>
        </div>
    );
}
