'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

const DnD = dynamic(() => import('./components/dnd'), {
    ssr: false,
    loading: () => <div style={{ height: 240 }}>Loading...</div>,
});

export default function () {
    return <DnD />;
}
