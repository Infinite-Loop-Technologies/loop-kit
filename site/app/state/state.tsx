'use client';

import { JsonInspector } from '@/registry/new-york/blocks/code-editor/components/json-inspector';

export default function State() {
    return (
        <>
            <JsonInspector
                value={{
                    foo: 'bar',
                    count: 42,
                    nested: { a: 1, b: [1, 2, 3] },
                }}
                className='h-64 w-full border rounded-md'
            />
        </>
    );
}
