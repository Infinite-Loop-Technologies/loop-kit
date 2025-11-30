'use client';
import dynamic from 'next/dynamic';

const Page = dynamic(() => import('./components/game'), {
    ssr: false,
    loading: () => <div className='skeleton'>Loading</div>,
});
export default Page;
