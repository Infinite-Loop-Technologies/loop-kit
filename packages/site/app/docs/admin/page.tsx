import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isAdminAuthenticated } from '@/lib/docs/auth';
import { readRegistryItems } from '@/lib/docs/registry';
import { listDocPages } from '@/lib/docs/store';
import {
    deleteDocPageAction,
    loginAdminAction,
    logoutAdminAction,
    saveDocPageAction,
} from '@/app/docs/admin/actions';

type SearchParams = Record<string, string | string[] | undefined>;

function pickString(
    searchParams: SearchParams,
    key: string,
    fallback = ''
): string {
    const value = searchParams[key];
    if (typeof value === 'string') return value;
    return fallback;
}

export default async function DocsAdminPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const error = pickString(params, 'error');
    const saved = pickString(params, 'saved') === '1';
    const deleted = pickString(params, 'deleted') === '1';

    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
        return (
            <div className='mx-auto w-full max-w-md py-10'>
                <Card>
                    <CardHeader>
                        <CardTitle>Docs Admin Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <p className='mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                                {error}
                            </p>
                        ) : null}
                        <form action={loginAdminAction} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='username'>Username</Label>
                                <Input
                                    id='username'
                                    name='username'
                                    autoComplete='username'
                                    required
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='password'>Password</Label>
                                <Input
                                    id='password'
                                    name='password'
                                    type='password'
                                    autoComplete='current-password'
                                    required
                                />
                            </div>
                            <Button type='submit' className='w-full'>
                                Sign in
                            </Button>
                            <p className='text-xs text-muted-foreground'>
                                Configure credentials with
                                <code className='mx-1'>DOCS_ADMIN_USERNAME</code>
                                and
                                <code className='mx-1'>DOCS_ADMIN_PASSWORD</code>.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const [pages, registryItems] = await Promise.all([
        listDocPages({ includeDrafts: true }),
        readRegistryItems(),
    ]);

    const selectedSlug = pickString(params, 'slug', '');
    const selected = pages.find((page) => page.slug === selectedSlug) ?? null;
    const selectedRegistry = selected?.registryItem ?? '';

    return (
        <div className='grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]'>
            <Card className='h-fit'>
                <CardHeader className='space-y-3'>
                    <CardTitle className='text-base'>Pages</CardTitle>
                    <div className='flex gap-2'>
                        <Button asChild size='sm' variant='secondary'>
                            <Link href='/docs/admin?new=1'>New</Link>
                        </Button>
                        <form action={logoutAdminAction}>
                            <Button type='submit' size='sm' variant='outline'>
                                Logout
                            </Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent className='space-y-2'>
                    {pages.length === 0 ? (
                        <p className='text-sm text-muted-foreground'>
                            No docs pages yet.
                        </p>
                    ) : (
                        pages.map((page) => (
                            <Link
                                key={page.slug}
                                href={`/docs/admin?slug=${page.slug}`}
                                className={`block rounded-md border px-3 py-2 text-sm ${
                                    page.slug === selectedSlug
                                        ? 'border-primary bg-primary/5'
                                        : 'hover:bg-muted'
                                }`}>
                                <p className='font-medium'>{page.title}</p>
                                <p className='text-xs text-muted-foreground'>
                                    /docs/{page.slug}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                    {page.published ? 'Published' : 'Draft'}
                                </p>
                            </Link>
                        ))
                    )}
                </CardContent>
            </Card>

            <Card key={selected?.slug ?? 'new'}>
                <CardHeader>
                    <CardTitle>{selected ? 'Edit Page' : 'Create Page'}</CardTitle>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <p className='mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                            {error}
                        </p>
                    ) : null}
                    {saved ? (
                        <p className='mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400'>
                            Page saved.
                        </p>
                    ) : null}
                    {deleted ? (
                        <p className='mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400'>
                            Page deleted.
                        </p>
                    ) : null}

                    <form
                        key={selected?.slug ?? 'new-form'}
                        action={saveDocPageAction}
                        className='space-y-4'>
                        <input
                            type='hidden'
                            name='originalSlug'
                            value={selected?.slug ?? ''}
                        />

                        <div className='grid gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='title'>Title</Label>
                                <Input
                                    id='title'
                                    name='title'
                                    required
                                    defaultValue={selected?.title ?? ''}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='slug'>Slug</Label>
                                <Input
                                    id='slug'
                                    name='slug'
                                    required
                                    defaultValue={selected?.slug ?? ''}
                                    placeholder='my-page'
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='description'>Description</Label>
                            <Input
                                id='description'
                                name='description'
                                defaultValue={selected?.description ?? ''}
                            />
                        </div>

                        <div className='grid gap-4 md:grid-cols-3'>
                            <div className='space-y-2'>
                                <Label htmlFor='section'>Section</Label>
                                <Input
                                    id='section'
                                    name='section'
                                    defaultValue={selected?.section ?? 'General'}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='order'>Order</Label>
                                <Input
                                    id='order'
                                    name='order'
                                    type='number'
                                    defaultValue={selected?.order ?? 0}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='registryItem'>
                                    Linked registry item
                                </Label>
                                <select
                                    id='registryItem'
                                    name='registryItem'
                                    defaultValue={selectedRegistry}
                                    className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-hidden'>
                                    <option value=''>None</option>
                                    {registryItems.map((item) => (
                                        <option key={item.name} value={item.name}>
                                            {item.title ?? item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='body'>Markdown</Label>
                            <Textarea
                                id='body'
                                name='body'
                                rows={18}
                                defaultValue={selected?.body ?? ''}
                            />
                        </div>

                        <label className='inline-flex items-center gap-2 text-sm'>
                            <input
                                type='checkbox'
                                name='published'
                                defaultChecked={selected?.published ?? true}
                            />
                            Published
                        </label>

                        <div className='flex flex-wrap gap-2'>
                            <Button type='submit'>Save page</Button>
                            {selected ? (
                                <Button asChild variant='outline'>
                                    <Link href={`/docs/${selected.slug}`}>
                                        View page
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    </form>

                    {selected ? (
                        <form action={deleteDocPageAction} className='mt-6'>
                            <input type='hidden' name='slug' value={selected.slug} />
                            <Button type='submit' variant='destructive'>
                                Delete page
                            </Button>
                        </form>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
