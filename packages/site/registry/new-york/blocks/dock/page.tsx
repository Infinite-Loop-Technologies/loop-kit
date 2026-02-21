'use client';

import dynamic from 'next/dynamic';

const Page = dynamic(() => import('./components/dock'), {
  ssr: false,
  loading: () => <div className='skeleton'>Loading dock demo...</div>,
});

export default Page;
