import Link from 'next/link';
import { ArrowRight, BookOpenText, Layers3, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isAdminAuthenticated } from '@/lib/docs/auth';
import { getDocsNavigation } from '@/lib/docs/store';

export default async function DocsHomePage() {
    const [sections, isAdmin] = await Promise.all([
        getDocsNavigation(),
        isAdminAuthenticated(),
    ]);

    const pageCount = sections.reduce(
        (count, section) => count + section.pages.length,
        0
    );

    return (
        <div className='mx-auto w-full max-w-5xl space-y-6'>
            <Card className='border-primary/20 bg-card/65 backdrop-blur'>
                <CardHeader className='space-y-4'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='secondary'>loop/cn docs</Badge>
                        <Badge variant='outline'>{sections.length} sections</Badge>
                        <Badge variant='outline'>{pageCount} published pages</Badge>
                    </div>
                    <div className='space-y-2'>
                        <CardTitle className='text-2xl sm:text-3xl'>
                            Build with composable blocks
                        </CardTitle>
                        <CardDescription className='max-w-2xl text-sm sm:text-base'>
                            Browse block docs, inspect live demos, and move from reference to implementation quickly.
                        </CardDescription>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                        <Button asChild size='sm'>
                            <Link href='/' prefetch>
                                Back to landing
                                <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                            </Link>
                        </Button>
                        {isAdmin ? (
                            <Button asChild variant='outline' size='sm'>
                                <Link href='/docs/admin' prefetch>
                                    Open admin panel
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </CardHeader>
            </Card>

            <div className='grid gap-4 md:grid-cols-3'>
                <Card className='bg-card/65 backdrop-blur'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <BookOpenText className='h-4 w-4 text-primary' />
                            Read
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='text-sm text-muted-foreground'>
                        Explore published docs for each block and workflow pattern.
                    </CardContent>
                </Card>
                <Card className='bg-card/65 backdrop-blur'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <Sparkles className='h-4 w-4 text-primary' />
                            Run
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='text-sm text-muted-foreground'>
                        Use linked live demos to validate behavior before adoption.
                    </CardContent>
                </Card>
                <Card className='bg-card/65 backdrop-blur'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <Layers3 className='h-4 w-4 text-primary' />
                            Compose
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='text-sm text-muted-foreground'>
                        Pull registry items into your app and adapt them to your product surface.
                    </CardContent>
                </Card>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
                {sections.map((section) => (
                    <Card key={section.name} className='bg-card/65 backdrop-blur'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-base'>{section.name}</CardTitle>
                            <CardDescription>
                                {section.pages.length} page{section.pages.length === 1 ? '' : 's'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            {section.pages.map((page) => (
                                <Link
                                    key={page.slug}
                                    href={`/docs/${page.slug}`}
                                    prefetch
                                    className='group block rounded-md border px-3 py-2 transition-colors hover:bg-muted'>
                                    <div className='flex items-start justify-between gap-3'>
                                        <p className='font-medium'>{page.title}</p>
                                        <ArrowRight className='mt-0.5 h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
                                    </div>
                                    <p className='text-xs text-muted-foreground'>
                                        {page.description || `/docs/${page.slug}`}
                                    </p>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
