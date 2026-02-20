'use client';

import dynamic from 'next/dynamic';

import type { DocDemoSize } from '@/lib/docs/types';
import type { DemoRenderMode, SupportedDemoItem } from '@/lib/docs/embeds';

const RegistryLiveDemo = dynamic(
    () =>
        import('@/components/docs/registry-live-demo').then(
            (module) => module.RegistryLiveDemo
        ),
    {
        ssr: false,
        loading: () => (
            <div className='h-[560px] w-full animate-pulse rounded-xl border bg-muted/40' />
        ),
    }
);

type RegistryLiveDemoLazyProps = {
    itemName?: SupportedDemoItem | string | null;
    size?: DocDemoSize;
    mode?: DemoRenderMode;
    className?: string;
};

export function RegistryLiveDemoLazy(props: RegistryLiveDemoLazyProps) {
    return <RegistryLiveDemo {...props} />;
}
