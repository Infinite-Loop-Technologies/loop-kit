'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { DocDemoSize } from '@/lib/docs/types';
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

function toDemoSize(value: FormDataEntryValue | null): DocDemoSize {
    return toString(value) === 'large' ? 'large' : 'default';
}

function goToError(message: string) {
    redirect(`/docs/admin?error=${encodeURIComponent(message)}`);
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
        await requireAdmin();
    } catch {
        goToError('Not authorized.');
    }

    try {
        const originalSlug = toString(formData.get('originalSlug'));
        const slug = toString(formData.get('slug'));
        const title = toString(formData.get('title'));
        const description = toString(formData.get('description'));
        const section = toString(formData.get('section'));
        const body = toString(formData.get('body'));
        const order = toInt(formData.get('order'));
        const registryItem = toString(formData.get('registryItem'));
        const demoSize = toDemoSize(formData.get('demoSize'));
        const published = boolFromCheckbox(formData.get('published'));

        const saved = await upsertDocPage({
            originalSlug: originalSlug || undefined,
            slug,
            title,
            description,
            section,
            body,
            order,
            published,
            registryItem,
            demoSize,
        });

        revalidatePath('/docs');
        revalidatePath(`/docs/${saved.slug}`);
        revalidatePath('/docs/admin');
        redirect(`/docs/admin?slug=${saved.slug}&saved=1`);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to save page.';
        goToError(message);
    }
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
