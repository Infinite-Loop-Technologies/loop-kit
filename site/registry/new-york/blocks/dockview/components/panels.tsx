'use client';
import { LayoutPanelLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    GroupOverlays,
    GroupTabStrip,
    Panels,
    usePanelsSelect,
} from './dockview';
import { JsonInspector } from '../../code-editor/components/json-inspector';
import { NormalDocsPage } from '@/components/docs/docs-page';

export default function Page() {
    return (
        <Panels
            className='rounded-md border'
            seed={[{ id: 'welcome', title: 'asdf', component: 'default' }]}>
            <MyPanelSystem />
        </Panels>
    );
}

function MyPanelSystem() {
    const drag = usePanelsSelect((s) => ({
        dragging: s.dragging,
        source: s.dragSource,
        target: s.dragTarget,
        mods: s.dragModifiers,
    }));

    return (
        <NormalDocsPage header={'Panel System'}>
            <div className='w-full h-300 relative'>
                <JsonInspector
                    value={drag}
                    className='h-64 rounded-md border'
                />
            </div>
            <GroupOverlays>
                {(g) => {
                    const isTarget =
                        drag.dragging && drag.target?.groupId === g.id;

                    return (
                        <div className='relative h-full w-full'>
                            {/* Top tab-strip across this group */}
                            <div className='absolute left-0 right-0 top-0'>
                                <GroupTabStrip groupId={g.id} />
                            </div>

                            {isTarget && (
                                <div className='w-full h-full bg-white-200'>
                                    {/* <DropGuides
                                        position={dragTarget.position}
                                        index={dragTarget.index}
                                    /> */}
                                </div>
                            )}
                        </div>
                    );
                }}
            </GroupOverlays>
        </NormalDocsPage>
    );
}
