'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
    clearAdminSession,
    requireAdmin,
    setAdminSession,
    validateAdminCredentials,
} from '@/lib/docs/auth';
import { deleteDocPage, upsertDocPage } from '@/lib/docs/store';

function toString(value: FormDataEntryValue | null) {
    return typeof value === 'string' ? value : '';
}

function toInt(value: FormDataEntryValue | null) {
    const num = Number(toString(value));
    return Number.isFinite(num) ? num : 0;
}

function boolFromCheckbox(value: FormDataEntryValue | null) {
    return toString(value) === 'on';
}

function goToError(message: string) {
    redirect(`/docs/admin?error=${encodeURIComponent(message)}`);
}

function toSafeRedirectPath(value: string) {
    const trimmed = value.trim();
    if (!trimmed.startsWith('/')) return null;
    if (trimmed.startsWith('//')) return null;
    if (trimmed.includes('://')) return null;
    if (!trimmed.startsWith('/docs/')) return null;
    return trimmed;
}

function appendQueryParam(url: string, key: string, value: string) {
    const hashIndex = url.indexOf('#');
    const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
    const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
    const joiner = base.includes('?') ? '&' : '?';
    return `${base}${joiner}${encodeURIComponent(key)}=${encodeURIComponent(value)}${hash}`;
}

export async function loginAdminAction(formData: FormData) {
    const username = toString(formData.get('username')).trim();
    const password = toString(formData.get('password'));

    if (!validateAdminCredentials(username, password)) {
        goToError('Invalid username or password.');
    }

    await setAdminSession();
    redirect('/docs/admin');
}

export async function logoutAdminAction() {
    await clearAdminSession();
    redirect('/docs/admin');
}

export async function saveDocPageAction(formData: FormData) {
    try {
        const { saved, redirectTo } = await saveDocPageFromForm(formData);

        if (redirectTo) {
            redirect(appendQueryParam(redirectTo, 'saved', '1'));
        }
        redirect(`/docs/admin?slug=${saved.slug}&saved=1`);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to save page.';
        goToError(message);
    }
}

export type InlineDocSaveState = {
    status: 'idle' | 'success' | 'error';
    message: string;
    savedPage?: {
        slug: string;
        updatedAt: string;
    };
};

export async function saveDocPageInlineAction(
    _previousState: InlineDocSaveState,
    formData: FormData
): Promise<InlineDocSaveState> {
    try {
        const { saved } = await saveDocPageFromForm(formData);
        return {
            status: 'success',
            message: 'Page saved.',
            savedPage: {
                slug: saved.slug,
                updatedAt: saved.updatedAt,
            },
        };
    } catch (error) {
        return {
            status: 'error',
            message:
                error instanceof Error ? error.message : 'Failed to save page.',
        };
    }
}

async function saveDocPageFromForm(formData: FormData) {
    await requireAdmin();

    const originalSlug = toString(formData.get('originalSlug'));
    const slug = toString(formData.get('slug'));
    const title = toString(formData.get('title'));
    const description = toString(formData.get('description'));
    const section = toString(formData.get('section'));
    const badgeLabel = toString(formData.get('badgeLabel'));
    const body = toString(formData.get('body'));
    const order = toInt(formData.get('order'));
    const published = boolFromCheckbox(formData.get('published'));
    const fullWidth = boolFromCheckbox(formData.get('fullWidth'));
    const redirectTo = toSafeRedirectPath(toString(formData.get('redirectTo')));

    const saved = await upsertDocPage({
        originalSlug: originalSlug || undefined,
        slug,
        title,
        description,
        section,
        badgeLabel,
        body,
        order,
        published,
        fullWidth,
    });

    revalidatePath('/docs');
    revalidatePath(`/docs/${saved.slug}`);
    if (originalSlug && originalSlug !== saved.slug) {
        revalidatePath(`/docs/${originalSlug}`);
    }
    revalidatePath('/docs/admin');

    return {
        saved,
        redirectTo,
    };
}

export async function deleteDocPageAction(formData: FormData) {
    try {
        await requireAdmin();
    } catch {
        goToError('Not authorized.');
    }

    const slug = toString(formData.get('slug'));
    if (!slug) {
        goToError('No page selected.');
    }

    await deleteDocPage(slug);
    revalidatePath('/docs');
    revalidatePath(`/docs/${slug}`);
    revalidatePath('/docs/admin');
    redirect('/docs/admin?deleted=1');
}
