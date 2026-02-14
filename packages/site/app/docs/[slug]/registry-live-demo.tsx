'use client';

import dynamic from 'next/dynamic';

import { cn } from '@/lib/utils';
import type { DocDemoSize } from '@/lib/docs/types';

const BlockEditorDemo = dynamic(
    () => import('@/registry/new-york/blocks/block-editor/page'),
    { ssr: false },
);
const CodeEditorDemo = dynamic(
    () => import('@/registry/new-york/blocks/code-editor/page'),
    { ssr: false },
);
const DockviewDemo = dynamic(
    () => import('@/registry/new-york/blocks/dockview/dockview'),
    {
        ssr: false,
    },
);

const registryDemos = {
    'block-editor': BlockEditorDemo,
    'code-editor': CodeEditorDemo,
    dockview: DockviewDemo,
} as const;

type RegistryLiveDemoProps = {
    itemName?: string | null;
    size?: DocDemoSize;
};

export function RegistryLiveDemo({
    itemName,
    size = 'default',
}: RegistryLiveDemoProps) {
    if (!itemName) return null;
    const Demo = registryDemos[itemName as keyof typeof registryDemos];
    if (!Demo) return null;

    return (
        <div className='overflow-hidden rounded-xl border bg-card'>
            <div
                className={cn(
                    'overflow-auto p-3',
                    size === 'large'
                        ? 'max-h-[82vh] min-h-[58vh]'
                        : 'max-h-[68vh]',
                )}>
                <Demo />
            </div>
        </div>
    );
}
