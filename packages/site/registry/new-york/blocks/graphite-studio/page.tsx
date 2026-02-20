'use client';
import dynamic from 'next/dynamic';

const Page = dynamic(() => import('./components/graphite-studio'), {
  ssr: false,
  loading: () => <div className='skeleton'>Loading Graphite Studio...</div>,
});

export default Page;
