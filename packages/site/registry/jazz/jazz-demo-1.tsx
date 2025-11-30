'use client';
import { JazzReactProvider } from 'jazz-tools/react';
import { JazzInspector } from 'jazz-tools/inspector';

export default function JazzDemo1() {
    return (
        <>
            <JazzReactProvider
                sync={{
                    peer: `wss://cloud.jazz.tools/?key=${process.env.NEXT_PUBLIC_JAZZ_API_KEY}`,
                    when: 'always',
                }}
                // ...AccountSchema, storage, etc.
            >
                {/* dev-only is common so it never ships to prod */}
                {/* {process.env.DEV && <JazzInspector position='bottom right' />} */}
                <JazzInspector position='bottom right' />
                <h1>hi hi hi hi</h1>
            </JazzReactProvider>
        </>
    );
}
