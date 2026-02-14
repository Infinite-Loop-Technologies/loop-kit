import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/docs/markdown';
import { isAdminAuthenticated } from '@/lib/docs/auth';
import { getRegistryItemByName } from '@/lib/docs/registry';
import { getDocPageBySlug } from '@/lib/docs/store';
import { cn } from '@/lib/utils';
import { RegistryLiveDemo } from './registry-live-demo';

type PageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getDocPageBySlug(slug);
    if (!page) return {};

    return {
        title: `${page.title} | loop/cn docs`,
        description: page.description || undefined,
    };
}

export default async function DocPage({ params }: PageProps) {
    const { slug } = await params;
    const isAdmin = await isAdminAuthenticated();
    const page = await getDocPageBySlug(slug, {
        includeDrafts: isAdmin,
    });
    if (!page || (!page.published && !isAdmin)) {
        notFound();
    }

    const registryItem = await getRegistryItemByName(page.registryItem);
    const isLargeDemo = page.demoSize === 'large';

    return (
        <article className='mx-auto w-full max-w-4xl space-y-6'>
            <header className='space-y-3'>
                <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant='secondary'>{page.section}</Badge>
                    {!page.published ? (
                        <Badge variant='destructive'>Draft</Badge>
                    ) : null}
                    {registryItem ? (
                        <Badge variant='outline'>
                            Registry: {registryItem.title ?? registryItem.name}
                        </Badge>
                    ) : null}
                </div>
                <h1 className='text-3xl font-semibold tracking-tight'>
                    {page.title}
                </h1>
                {page.description ? (
                    <p className='text-muted-foreground'>{page.description}</p>
                ) : null}
                <div className='flex flex-wrap items-center gap-2'>
                    {registryItem ? (
                        <Button variant='outline' size='sm' asChild>
                            <Link href={`/r/${registryItem.name}.json`}>
                                View registry item JSON
                            </Link>
                        </Button>
                    ) : null}
                    {isAdmin ? (
                        <Button size='sm' asChild>
                            <Link href={`/docs/admin?slug=${page.slug}`}>
                                Edit this page
                            </Link>
                        </Button>
                    ) : null}
                </div>
                {registryItem ? (
                    <pre className='w-fit rounded-md border bg-muted px-3 py-2 text-xs'>
                        <code>
                            pnpm dlx shadcn@latest add @loop-cn/
                            {registryItem.name}
                        </code>
                    </pre>
                ) : null}
            </header>

            <Markdown content={page.body} />

            {registryItem ? (
                <section
                    className={cn(
                        'space-y-2',
                        isLargeDemo &&
                            'relative left-1/2 w-[min(96vw,1200px)] -translate-x-1/2'
                    )}>
                    <h2 className='text-lg font-medium'>Live Demo</h2>
                    <RegistryLiveDemo
                        itemName={registryItem.name}
                        size={page.demoSize}
                    />
                </section>
            ) : null}
        </article>
    );
}
