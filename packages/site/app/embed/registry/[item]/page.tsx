import { notFound } from 'next/navigation';

import { RegistryEmbedShell } from '@/components/docs/registry-embed-shell';
import { SUPPORTED_DEMO_ITEMS } from '@/lib/docs/embeds';
import type { DocDemoSize } from '@/lib/docs/types';

type PageProps = {
    params: Promise<{ item: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickString(
    searchParams: Record<string, string | string[] | undefined>,
    key: string
) {
    const value = searchParams[key];
    return typeof value === 'string' ? value : '';
}

function toDemoSize(value: string): DocDemoSize {
    return value === 'large' ? 'large' : 'default';
}

export default async function RegistryDemoEmbedPage({
    params,
    searchParams,
}: PageProps) {
    const [{ item }, query] = await Promise.all([params, searchParams]);
    const normalized = item.trim().toLowerCase();
    if (!SUPPORTED_DEMO_ITEMS.includes(normalized as (typeof SUPPORTED_DEMO_ITEMS)[number])) {
        notFound();
    }

    return (
        <RegistryEmbedShell
            itemName={normalized}
            size={toDemoSize(pickString(query, 'size'))}
            trapShortcuts={pickString(query, 'trapShortcuts') === '1'}
        />
    );
}
