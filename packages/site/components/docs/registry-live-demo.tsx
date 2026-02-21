'use client';

import dynamic from 'next/dynamic';

import { cn } from '@/lib/utils';
import type { DocDemoSize } from '@/lib/docs/types';
import type { DemoRenderMode, SupportedDemoItem } from '@/lib/docs/embeds';

const BlockEditorDemo = dynamic(
    () => import('@/registry/new-york/blocks/block-editor/page'),
    { ssr: false },
);
const CodeEditorDemo = dynamic(
    () => import('@/registry/new-york/blocks/code-editor/page'),
    { ssr: false },
);
const DockDemo = dynamic(() => import('@/registry/new-york/blocks/dock/page'), {
    ssr: false,
});
const PhysicsDemo = dynamic(
    () => import('@/registry/new-york/blocks/physics/page'),
    {
        ssr: false,
    },
);
const ShadertoyDemo = dynamic(
    () => import('@/registry/new-york/blocks/shadertoy/page'),
    {
        ssr: false,
    },
);
const GraphiteStudioDemo = dynamic(
    () => import('@/registry/new-york/blocks/graphite-studio/page'),
    {
        ssr: false,
    },
);
const GraphiteConnectorsDemo = dynamic(
    () => import('@/registry/new-york/blocks/graphite-connectors/page'),
    {
        ssr: false,
    },
);
const GraphiteQueryTableDemo = dynamic(
    () => import('@/registry/new-york/blocks/graphite-query-table/page'),
    {
        ssr: false,
    },
);

const registryDemos = {
    'block-editor': BlockEditorDemo,
    'code-editor': CodeEditorDemo,
    dock: DockDemo,
    physics: PhysicsDemo,
    shadertoy: ShadertoyDemo,
    'graphite-studio': GraphiteStudioDemo,
    'graphite-connectors': GraphiteConnectorsDemo,
    'graphite-query-table': GraphiteQueryTableDemo,
} as const;

type RegistryLiveDemoProps = {
    itemName?: string | null;
    size?: DocDemoSize;
    mode?: DemoRenderMode;
    className?: string;
};

function getFrameHeight(size: DocDemoSize) {
    return size === 'large' ? 920 : 560;
}

function getInlineViewportClass(size: DocDemoSize) {
    return size === 'large'
        ? 'h-[78vh] min-h-[520px] max-h-[960px]'
        : 'h-[56vh] min-h-[360px] max-h-[680px]';
}

export function RegistryLiveDemo({
    itemName,
    size = 'default',
    mode = 'inline',
    className,
}: RegistryLiveDemoProps) {
    if (!itemName) return null;

    if (mode === 'iframe') {
        const trapShortcuts =
            itemName === 'graphite-studio' ||
            itemName === 'graphite-connectors' ||
            itemName === 'graphite-query-table';
        const frameSrc = `/embed/registry/${itemName}?size=${size}${
            trapShortcuts ? '&trapShortcuts=1' : ''
        }`;
        return (
            <div
                className={cn(
                    'overflow-hidden rounded-xl border bg-card',
                    className,
                )}>
                <iframe
                    src={frameSrc}
                    title={`${itemName} demo`}
                    className='w-full border-0'
                    style={{ height: `${getFrameHeight(size)}px` }}
                    sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-modals'
                    loading='lazy'
                />
            </div>
        );
    }

    const Demo = registryDemos[itemName as SupportedDemoItem];
    if (!Demo) return null;

    return (
        <div
            className={cn(
                'overflow-hidden rounded-xl border bg-card',
                className,
            )}>
            <div
                className={cn(
                    'overflow-auto p-3',
                    getInlineViewportClass(size),
                )}>
                <Demo />
            </div>
        </div>
    );
}
