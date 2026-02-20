import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RichDocContent } from '@/components/docs/rich-doc-content';
import { isAdminAuthenticated } from '@/lib/docs/auth';
import { getDocPageBySlug } from '@/lib/docs/store';

type PageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickString(
    searchParams: Record<string, string | string[] | undefined>,
    key: string
) {
    const value = searchParams[key];
    return typeof value === 'string' ? value : '';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getDocPageBySlug(slug);
    if (!page) return {};

    return {
        title: `${page.title} | loop/cn docs`,
        description: page.description || undefined,
    };
}

export default async function DocPage({ params, searchParams }: PageProps) {
    const [{ slug }, query] = await Promise.all([params, searchParams]);
    const isAdmin = await isAdminAuthenticated();
    const page = await getDocPageBySlug(slug, {
        includeDrafts: isAdmin,
    });
    if (!page || (!page.published && !isAdmin)) {
        notFound();
    }

    const saved = pickString(query, 'saved') === '1';
    const widthClass = page.fullWidth ? 'max-w-none' : 'max-w-4xl';
    const renderedContent = <RichDocContent content={page.body} />;
    let pageContent = renderedContent;

    if (isAdmin) {
        const [{ DocInlineEditor }, { readRegistryItems }] = await Promise.all([
            import('@/components/docs/doc-inline-editor'),
            import('@/lib/docs/registry'),
        ]);
        const registryItems = await readRegistryItems();

        pageContent = (
            <DocInlineEditor
                page={page}
                registryItems={registryItems}
                saved={saved}>
                {renderedContent}
            </DocInlineEditor>
        );
    }

    return (
        <article className={`mx-auto w-full ${widthClass} space-y-6`}>
            <header className='space-y-3'>
                <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant='secondary'>{page.section}</Badge>
                    {!page.published ? (
                        <Badge variant='destructive'>Draft</Badge>
                    ) : null}
                    {page.badgeLabel ? (
                        <Badge variant='outline'>
                            {page.badgeLabel}
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
                    {isAdmin ? (
                        <Button size='sm' asChild>
                            <Link href='#inline-editor'>
                                Edit inline
                            </Link>
                        </Button>
                    ) : null}
                </div>
            </header>

            {pageContent}
        </article>
    );
}
