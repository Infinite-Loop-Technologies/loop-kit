import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isAdminAuthenticated } from '@/lib/docs/auth';
import { getDocsNavigation } from '@/lib/docs/store';

export default async function DocsHomePage() {
    const [sections, isAdmin] = await Promise.all([
        getDocsNavigation(),
        isAdminAuthenticated(),
    ]);

    return (
        <div className='mx-auto w-full max-w-4xl space-y-6'>
            <div className='space-y-3'>
                <h1 className='text-3xl font-semibold tracking-tight'>
                    loop-kit documentation
                </h1>
                <p className='text-muted-foreground'>
                    Pages are now managed by a docs CMS layer. Use the sidebar to
                    navigate, or open admin to edit content.
                </p>
                <div className='flex items-center gap-2'>
                    <Button asChild size='sm'>
                        <Link href='/docs/admin'>
                            {isAdmin ? 'Open admin panel' : 'Admin login'}
                        </Link>
                    </Button>
                    <Badge variant='secondary'>
                        {sections.reduce(
                            (count, section) => count + section.pages.length,
                            0
                        )}{' '}
                        published pages
                    </Badge>
                </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
                {sections.map((section) => (
                    <Card key={section.name}>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                {section.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            {section.pages.map((page) => (
                                <Link
                                    key={page.slug}
                                    href={`/docs/${page.slug}`}
                                    className='block rounded-md border px-3 py-2 hover:bg-muted'>
                                    <p className='font-medium'>{page.title}</p>
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
