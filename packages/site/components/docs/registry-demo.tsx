'use client';

import dynamic from 'next/dynamic';

const BlockEditorDemo = dynamic(
    () => import('@/registry/new-york/blocks/block-editor/page'),
    { ssr: false }
);
const CodeEditorDemo = dynamic(
    () => import('@/registry/new-york/blocks/code-editor/page'),
    { ssr: false }
);
const DockviewDemo = dynamic(() => import('@/registry/new-york/blocks/dockview/dockview'), {
    ssr: false,
});
const DndDemo = dynamic(
    () => import('@/registry/new-york/blocks/drag-and-drop/page'),
    { ssr: false }
);
const PhysicsDemo = dynamic(() => import('@/registry/new-york/blocks/physics/page'), {
    ssr: false,
});
const GameDemo = dynamic(() => import('@/registry/new-york/blocks/game/page'), {
    ssr: false,
});
const JazzDemo = dynamic(() => import('@/registry/jazz/jazz-demo-1'), {
    ssr: false,
});

const registryDemos = {
    'block-editor': BlockEditorDemo,
    'code-editor': CodeEditorDemo,
    dockview: DockviewDemo,
    'drag-and-drop': DndDemo,
    physics: PhysicsDemo,
    game: GameDemo,
    'jazz-demo-1': JazzDemo,
} as const;

type RegistryDemoProps = {
    itemName?: string | null;
};

export function RegistryDemo({ itemName }: RegistryDemoProps) {
    if (!itemName) return null;
    const Demo = registryDemos[itemName as keyof typeof registryDemos];
    if (!Demo) return null;

    return (
        <div className='overflow-hidden rounded-xl border bg-card'>
            <div className='max-h-[68vh] overflow-auto p-3'>
                <Demo />
            </div>
        </div>
    );
}
