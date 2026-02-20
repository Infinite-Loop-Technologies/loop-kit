'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
    saveDocPageInlineAction,
    type InlineDocSaveState,
} from '@/app/docs/admin/actions';
import { MarkdownCodeEditorField } from '@/components/docs/markdown-code-editor-field';
import { RegistryDirectiveReference } from '@/components/docs/registry-directive-reference';
import { RichDocContentPreview } from '@/components/docs/rich-doc-content-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { DocPage, RegistryItemMeta } from '@/lib/docs/types';

type DocInlineEditorProps = {
    page: DocPage;
    registryItems: RegistryItemMeta[];
    saved?: boolean;
    children: ReactNode;
};

const INLINE_SAVE_IDLE_STATE: InlineDocSaveState = {
    status: 'idle',
    message: '',
};

export function DocInlineEditor({
    page,
    registryItems,
    saved = false,
    children,
}: DocInlineEditorProps) {
    const initialSaveState = useMemo<InlineDocSaveState>(
        () =>
            saved
                ? {
                      status: 'success',
                      message: 'Page saved.',
                  }
                : INLINE_SAVE_IDLE_STATE,
        [saved]
    );

    const [saveState, formAction, isPending] = useActionState(
        saveDocPageInlineAction,
        initialSaveState
    );

    const [isEditing, setIsEditing] = useState(saved);
    const [enablePreview, setEnablePreview] = useState(false);
    const [originalSlug, setOriginalSlug] = useState(page.slug);

    const [title, setTitle] = useState(page.title);
    const [slug, setSlug] = useState(page.slug);
    const [description, setDescription] = useState(page.description);
    const [section, setSection] = useState(page.section);
    const [badgeLabel, setBadgeLabel] = useState(page.badgeLabel ?? '');
    const [order, setOrder] = useState(String(page.order));
    const [body, setBody] = useState(page.body);
    const [published, setPublished] = useState(page.published);
    const [fullWidth, setFullWidth] = useState(page.fullWidth);

    const debouncedBody = useDebouncedValue(body, 250);

    useEffect(() => {
        function syncEditorFromHash() {
            if (window.location.hash === '#inline-editor') {
                setIsEditing(true);
                setEnablePreview(false);
            }
        }

        syncEditorFromHash();
        window.addEventListener('hashchange', syncEditorFromHash);
        return () => {
            window.removeEventListener('hashchange', syncEditorFromHash);
        };
    }, []);

    useEffect(() => {
        if (saveState.status !== 'success' || !saveState.savedPage) {
            return;
        }

        const nextSlug = saveState.savedPage.slug;
        setOriginalSlug(nextSlug);
        setSlug(nextSlug);

        const currentUrl = new URL(window.location.href);
        const nextPath = `/docs/${nextSlug}`;
        if (
            currentUrl.pathname !== nextPath ||
            currentUrl.hash !== '#inline-editor'
        ) {
            window.history.replaceState(
                null,
                '',
                `${nextPath}${currentUrl.search}#inline-editor`
            );
        }
    }, [saveState]);

    function openEditor() {
        setIsEditing(true);
        setEnablePreview(false);

        if (window.location.hash !== '#inline-editor') {
            window.history.replaceState(
                null,
                '',
                `${window.location.pathname}${window.location.search}#inline-editor`
            );
        }
    }

    function closeEditor() {
        setIsEditing(false);
        setEnablePreview(false);

        if (window.location.hash === '#inline-editor') {
            window.history.replaceState(
                null,
                '',
                `${window.location.pathname}${window.location.search}`
            );
        }
    }

    return (
        <section id='inline-editor' className='space-y-4'>
            {!isEditing ? (
                <>
                    {children}
                    <div className='rounded-xl border bg-card/60 p-4'>
                        <div className='flex flex-wrap items-center gap-2'>
                            <Button type='button' size='sm' onClick={openEditor}>
                                Edit inline
                            </Button>
                            <Button variant='outline' size='sm' asChild>
                                <a href={`/docs/admin?slug=${originalSlug}`}>
                                    Open full admin
                                </a>
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className='space-y-4'>
                    <div className='rounded-xl border bg-card/60 p-4'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                            <p className='text-sm font-medium'>Inline editor (admin)</p>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={closeEditor}>
                                Close editor
                            </Button>
                        </div>
                    </div>

                    <div className='rounded-xl border bg-card/60 p-4'>
                        {saveState.status === 'success' ? (
                            <p className='mb-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400'>
                                {saveState.message}
                            </p>
                        ) : null}
                        {saveState.status === 'error' ? (
                            <p className='mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive'>
                                {saveState.message}
                            </p>
                        ) : null}

                        <form action={formAction} className='space-y-4'>
                            <input
                                type='hidden'
                                name='originalSlug'
                                value={originalSlug}
                            />

                            <div className='grid gap-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label htmlFor='inline-title'>Title</Label>
                                    <Input
                                        id='inline-title'
                                        name='title'
                                        required
                                        value={title}
                                        onChange={(event) =>
                                            setTitle(event.target.value)
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='inline-slug'>Slug</Label>
                                    <Input
                                        id='inline-slug'
                                        name='slug'
                                        required
                                        value={slug}
                                        onChange={(event) =>
                                            setSlug(event.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='inline-description'>
                                    Description
                                </Label>
                                <Input
                                    id='inline-description'
                                    name='description'
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                />
                            </div>

                            <div className='grid gap-4 md:grid-cols-3'>
                                <div className='space-y-2'>
                                    <Label htmlFor='inline-section'>Section</Label>
                                    <Input
                                        id='inline-section'
                                        name='section'
                                        value={section}
                                        onChange={(event) =>
                                            setSection(event.target.value)
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='inline-badge-label'>
                                        Header badge (optional)
                                    </Label>
                                    <Input
                                        id='inline-badge-label'
                                        name='badgeLabel'
                                        value={badgeLabel}
                                        placeholder='Graphite'
                                        onChange={(event) =>
                                            setBadgeLabel(event.target.value)
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='inline-order'>Order</Label>
                                    <Input
                                        id='inline-order'
                                        name='order'
                                        type='number'
                                        value={order}
                                        onChange={(event) =>
                                            setOrder(event.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='inline-body'>Markdown + embeds</Label>
                                <p className='text-xs text-muted-foreground'>
                                    Use{' '}
                                    <code>
                                        {
                                            '{{demo item="dockview" mode="iframe" size="large"}}'
                                        }
                                    </code>{' '}
                                    <code>
                                        {'{{registry-item-link item="dockview"}}'}
                                    </code>{' '}
                                    and{' '}
                                    <code>{'{{playground preset="starter"}}'}</code>.
                                </p>
                                <MarkdownCodeEditorField
                                    id='inline-body'
                                    name='body'
                                    value={body}
                                    onValueChange={setBody}
                                    height='420px'
                                />
                                <RegistryDirectiveReference
                                    registryItems={registryItems}
                                />
                            </div>

                            <div className='flex flex-wrap items-center gap-4'>
                                <label className='inline-flex items-center gap-2 text-sm'>
                                    <input
                                        type='checkbox'
                                        name='published'
                                        checked={published}
                                        onChange={(event) =>
                                            setPublished(event.target.checked)
                                        }
                                    />
                                    Published
                                </label>
                                <label className='inline-flex items-center gap-2 text-sm'>
                                    <input
                                        type='checkbox'
                                        name='fullWidth'
                                        checked={fullWidth}
                                        onChange={(event) =>
                                            setFullWidth(event.target.checked)
                                        }
                                    />
                                    Full-width layout
                                </label>
                                <label className='inline-flex items-center gap-2 text-sm'>
                                    <input
                                        type='checkbox'
                                        checked={enablePreview}
                                        onChange={(event) =>
                                            setEnablePreview(event.target.checked)
                                        }
                                    />
                                    Enable preview
                                </label>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                <Button type='submit' disabled={isPending}>
                                    {isPending ? 'Saving...' : 'Save changes'}
                                </Button>
                                <Button variant='outline' asChild>
                                    <a href={`/docs/admin?slug=${slug}`}>
                                        Open full admin
                                    </a>
                                </Button>
                            </div>
                        </form>
                    </div>

                    {enablePreview ? (
                        <div className='rounded-xl border bg-card/40 p-4 space-y-4'>
                            <header className='space-y-3'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge variant='secondary'>
                                        {section || 'General'}
                                    </Badge>
                                    {!published ? (
                                        <Badge variant='destructive'>Draft</Badge>
                                    ) : null}
                                    {badgeLabel ? (
                                        <Badge variant='outline'>
                                            {badgeLabel}
                                        </Badge>
                                    ) : null}
                                </div>
                                <h2 className='text-3xl font-semibold tracking-tight'>
                                    {title || 'Untitled'}
                                </h2>
                                {description ? (
                                    <p className='text-muted-foreground'>
                                        {description}
                                    </p>
                                ) : null}
                            </header>

                            <div
                                className={
                                    fullWidth
                                        ? 'w-full space-y-6'
                                        : 'mx-auto w-full max-w-4xl space-y-6'
                                }>
                                <RichDocContentPreview
                                    content={debouncedBody}
                                    registryItems={registryItems}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </section>
    );
}
