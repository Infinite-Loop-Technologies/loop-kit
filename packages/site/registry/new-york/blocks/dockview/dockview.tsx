'use client';

import dynamic from 'next/dynamic';

const Page = dynamic(() => import('./components/panels'), {
    ssr: false,
    loading: () => <div className='skeleton'>Loading editor...</div>,
});

export default Page;
