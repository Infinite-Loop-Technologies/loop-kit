'use client';

import { DocsPage, NormalDocsPage } from '@/components/docs/docs-page';
import useToggle from '@/hooks/use-toggle';
import { JsonInspector } from '@/registry/new-york/blocks/code-editor/components/json-inspector';
import { Doc } from 'zod/v4/core';

export default function State() {
    return (
        <NormalDocsPage
            header='State'
            subtitle='Playing with state management libraries'>
            <JsonInspector
                value={{
                    foo: 'bar',
                    count: 42,
                    nested: { a: 1, b: [1, 2, 3] },
                }}
                className='h-64 w-full border rounded-md'
            />
        </NormalDocsPage>
    );
}
