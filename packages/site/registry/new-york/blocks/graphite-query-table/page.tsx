'use client';

import dynamic from 'next/dynamic';

const Page = dynamic(() => import('./components/graphite-query-table'), {
  ssr: false,
  loading: () => <div className='skeleton'>Loading Graphite Query Table...</div>,
});

export default Page;
