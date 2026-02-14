import { promises as fs } from 'node:fs';
import path from 'node:path';

import type {
    DocNavPage,
    DocNavSection,
    DocPage,
    DocsStore,
    UpsertDocPageInput,
} from '@/lib/docs/types';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');
const DOCS_STORE_PATH = path.join(DOCS_DIR, 'pages.json');

function nowIso() {
    return new Date().toISOString();
}

function toSafeString(value: unknown) {
    return typeof value === 'string' ? value : '';
}

export function toSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function normalizePage(raw: Partial<DocPage>, index: number): DocPage {
    const slug = toSlug(toSafeString(raw.slug));
    const title = toSafeString(raw.title).trim() || `Untitled ${index + 1}`;
    const description = toSafeString(raw.description).trim();
    const section = toSafeString(raw.section).trim() || 'General';
    const rawOrder =
        typeof raw.order === 'number' ? raw.order : Number(raw.order);
    const order = Number.isFinite(rawOrder) ? Number(rawOrder) : 0;
    const body = toSafeString(raw.body);
    const published = raw.published !== false;
    const registryItem = toSafeString(raw.registryItem).trim() || undefined;
    const createdAt = toSafeString(raw.createdAt) || nowIso();
    const updatedAt = toSafeString(raw.updatedAt) || createdAt;

    if (!slug) {
        throw new Error(`Invalid docs page slug for "${title}".`);
    }

    return {
        slug,
        title,
        description,
        section,
        order,
        body,
        published,
        registryItem,
        createdAt,
        updatedAt,
    };
}

function sortPages(pages: DocPage[]) {
    return [...pages].sort((a, b) => {
        const sectionCmp = a.section.localeCompare(b.section);
        if (sectionCmp !== 0) return sectionCmp;
        if (a.order !== b.order) return a.order - b.order;
        return a.title.localeCompare(b.title);
    });
}

async function ensureStoreExists() {
    await fs.mkdir(DOCS_DIR, { recursive: true });

    try {
        await fs.access(DOCS_STORE_PATH);
    } catch {
        const fallback: DocsStore = { pages: [] };
        await fs.writeFile(
            DOCS_STORE_PATH,
            JSON.stringify(fallback, null, 2),
            'utf8'
        );
    }
}

async function readStore(): Promise<DocsStore> {
    await ensureStoreExists();

    const content = await fs.readFile(DOCS_STORE_PATH, 'utf8');
    let parsed: Partial<DocsStore>;
    try {
        parsed = JSON.parse(content) as Partial<DocsStore>;
    } catch {
        parsed = { pages: [] };
    }
    const rawPages = Array.isArray(parsed.pages) ? parsed.pages : [];
    const pages = rawPages.map((page, index) => normalizePage(page, index));
    return { pages: sortPages(pages) };
}

async function writeStore(store: DocsStore) {
    await ensureStoreExists();
    const payload: DocsStore = { pages: sortPages(store.pages) };
    await fs.writeFile(DOCS_STORE_PATH, JSON.stringify(payload, null, 2), 'utf8');
}

export async function listDocPages(options?: { includeDrafts?: boolean }) {
    const includeDrafts = options?.includeDrafts ?? false;
    const store = await readStore();
    if (includeDrafts) return store.pages;
    return store.pages.filter((page) => page.published);
}

export async function getDocPageBySlug(
    slug: string,
    options?: { includeDrafts?: boolean }
) {
    const includeDrafts = options?.includeDrafts ?? false;
    const targetSlug = toSlug(slug);
    if (!targetSlug) return null;
    const pages = await listDocPages({ includeDrafts });
    return pages.find((page) => page.slug === targetSlug) ?? null;
}

export async function getDocsNavigation() {
    const pages = await listDocPages({ includeDrafts: false });
    const groups = new Map<string, DocNavPage[]>();

    for (const page of pages) {
        const section = page.section || 'General';
        const list = groups.get(section) ?? [];
        list.push({
            slug: page.slug,
            title: page.title,
            description: page.description,
            registryItem: page.registryItem,
            updatedAt: page.updatedAt,
        });
        groups.set(section, list);
    }

    const sections: DocNavSection[] = [...groups.entries()]
        .map(([name, sectionPages]) => ({
            name,
            pages: sectionPages,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return sections;
}

export async function upsertDocPage(input: UpsertDocPageInput) {
    const store = await readStore();
    const slug = toSlug(input.slug || input.title);
    const originalSlug = toSlug(input.originalSlug ?? input.slug);

    if (!slug) {
        throw new Error('A docs page needs a slug.');
    }

    if (!input.title?.trim()) {
        throw new Error('A docs page needs a title.');
    }

    const duplicate = store.pages.find(
        (page) => page.slug === slug && page.slug !== originalSlug
    );
    if (duplicate) {
        throw new Error(`Slug "${slug}" already exists.`);
    }

    const now = nowIso();
    const existingIndex = store.pages.findIndex(
        (page) => page.slug === originalSlug
    );

    const nextPage: DocPage = {
        slug,
        title: input.title.trim(),
        description: input.description?.trim() ?? '',
        section: input.section?.trim() || 'General',
        order: Number.isFinite(input.order) ? Number(input.order) : 0,
        body: input.body ?? '',
        published: input.published ?? false,
        registryItem: input.registryItem?.trim() || undefined,
        createdAt:
            existingIndex >= 0 ? store.pages[existingIndex].createdAt : now,
        updatedAt: now,
    };

    if (existingIndex >= 0) {
        store.pages.splice(existingIndex, 1, nextPage);
    } else {
        store.pages.push(nextPage);
    }

    await writeStore(store);
    return nextPage;
}

export async function deleteDocPage(slug: string) {
    const targetSlug = toSlug(slug);
    if (!targetSlug) return false;

    const store = await readStore();
    const nextPages = store.pages.filter((page) => page.slug !== targetSlug);
    const didDelete = nextPages.length !== store.pages.length;

    if (!didDelete) return false;

    await writeStore({ pages: nextPages });
    return true;
}
