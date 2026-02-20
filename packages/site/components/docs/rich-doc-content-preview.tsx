'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { parseDocsContent } from '@/lib/docs/embeds';
import type { RegistryItemMeta } from '@/lib/docs/types';
import { Button } from '@/components/ui/button';
import { LivePlayground } from '@/components/docs/live-playground';
import { Markdown } from '@/components/docs/markdown';
import { RegistryLiveDemo } from '@/components/docs/registry-live-demo';

type RichDocContentPreviewProps = {
    content: string;
    registryItems: RegistryItemMeta[];
};

export function RichDocContentPreview({
    content,
    registryItems,
}: RichDocContentPreviewProps) {
    const segments = useMemo(() => parseDocsContent(content), [content]);
    const registryItemMap = useMemo(
        () => new Map(registryItems.map((item) => [item.name, item])),
        [registryItems]
    );

    return (
        <div className='space-y-6'>
            {segments.map((segment, index) => {
                if (segment.type === 'markdown') {
                    if (!segment.content.trim()) return null;
                    return (
                        <Markdown
                            key={`preview-markdown-${index}`}
                            content={segment.content}
                        />
                    );
                }

                if (segment.type === 'playground') {
                    return (
                        <section
                            key={`preview-playground-${index}`}
                            className='space-y-2'>
                            <h2 className='text-lg font-medium'>
                                {segment.title ?? 'Live Playground'}
                            </h2>
                            <LivePlayground
                                preset={segment.preset}
                                height={segment.height}
                            />
                        </section>
                    );
                }

                if (segment.type === 'registry-item-link') {
                    const item = registryItemMap.get(segment.itemName);
                    return (
                        <section
                            key={`preview-registry-item-link-${index}`}
                            className='space-y-2'>
                            <h2 className='text-lg font-medium'>
                                {segment.title ??
                                    item?.title ??
                                    segment.itemName}
                            </h2>
                            <div className='rounded-xl border bg-card/60 p-3 space-y-3'>
                                <p className='text-sm text-muted-foreground'>
                                    {item?.description ??
                                        'Preview mode shows a simplified registry card.'}
                                </p>
                                <div>
                                    <Button variant='outline' size='sm' asChild>
                                        <Link href={`/r/${segment.itemName}.json`}>
                                            View registry item JSON
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </section>
                    );
                }

                return (
                    <section key={`preview-demo-${index}`} className='space-y-2'>
                        <h2 className='text-lg font-medium'>
                            {segment.title ?? `${segment.itemName} demo`}
                        </h2>
                        <RegistryLiveDemo
                            itemName={segment.itemName}
                            size={segment.size ?? 'default'}
                            mode={segment.mode}
                        />
                    </section>
                );
            })}
        </div>
    );
}
