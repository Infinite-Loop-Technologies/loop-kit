'use client';

import dynamic from 'next/dynamic';

const Page = dynamic(() => import('./components/graphite-connectors'), {
  ssr: false,
  loading: () => <div className='skeleton'>Loading Graphite Connectors...</div>,
});

export default Page;
