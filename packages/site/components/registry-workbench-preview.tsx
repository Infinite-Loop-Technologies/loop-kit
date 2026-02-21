'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { DockWorkbenchDemo } from '@/registry/new-york/blocks/dock/components/dock';

export default function RegistryWorkbenchPreview() {
    return (
        <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                <Badge variant='outline'>Dock workbench</Badge>
                <Badge variant='outline'>dnd-kit guides</Badge>
                <span>Interactive preview powered by the same dock block.</span>
            </div>
            <DockWorkbenchDemo mode='preview' />
        </div>
    );
}
