'use client';

import dynamic from 'next/dynamic';

import type { SupportedPlaygroundPreset } from '@/lib/docs/embeds';

const LivePlayground = dynamic(
    () =>
        import('@/components/docs/live-playground').then(
            (module) => module.LivePlayground
        ),
    {
        ssr: false,
        loading: () => (
            <div className='h-[460px] w-full animate-pulse rounded-xl border bg-muted/40' />
        ),
    }
);

type LivePlaygroundLazyProps = {
    preset: SupportedPlaygroundPreset;
    height?: number;
};

export function LivePlaygroundLazy(props: LivePlaygroundLazyProps) {
    return <LivePlayground {...props} />;
}
