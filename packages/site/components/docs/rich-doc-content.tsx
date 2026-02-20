import { parseDocsContent } from '@/lib/docs/embeds';
import { Markdown } from '@/components/docs/markdown';
import { RegistryLiveDemoLazy } from '@/components/docs/registry-live-demo-lazy';
import { LivePlaygroundLazy } from '@/components/docs/live-playground-lazy';
import { RegistryItemLinkCard } from '@/components/docs/registry-item-link-card';

type RichDocContentProps = {
    content: string;
};

export function RichDocContent({ content }: RichDocContentProps) {
    const segments = parseDocsContent(content);

    return (
        <div className='space-y-6'>
            {segments.map((segment, index) => {
                if (segment.type === 'markdown') {
                    if (!segment.content.trim()) return null;
                    return (
                        <Markdown
                            key={`markdown-${index}`}
                            content={segment.content}
                        />
                    );
                }

                if (segment.type === 'playground') {
                    return (
                        <section
                            key={`playground-${index}`}
                            className='space-y-2'>
                            <h2 className='text-lg font-medium'>
                                {segment.title ?? 'Live Playground'}
                            </h2>
                            <LivePlaygroundLazy
                                preset={segment.preset}
                                height={segment.height}
                            />
                        </section>
                    );
                }

                if (segment.type === 'registry-item-link') {
                    return (
                        <RegistryItemLinkCard
                            key={`registry-item-link-${index}`}
                            itemName={segment.itemName}
                            title={segment.title}
                        />
                    );
                }

                return (
                    <section key={`demo-${index}`} className='space-y-2'>
                        <h2 className='text-lg font-medium'>
                            {segment.title ?? `${segment.itemName} demo`}
                        </h2>
                        <RegistryLiveDemoLazy
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
