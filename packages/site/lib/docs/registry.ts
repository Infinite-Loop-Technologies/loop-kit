import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { RegistryItemMeta } from '@/lib/docs/types';

type RegistryManifest = {
    items?: Array<{
        name?: string;
        type?: string;
        title?: string;
        description?: string;
    }>;
};

const REGISTRY_MANIFEST_PATH = path.join(process.cwd(), 'registry.json');
const REGISTRY_BLOCKS_PATH = path.join(
    process.cwd(),
    'registry',
    'new-york',
    'blocks'
);

function stripBom(value: string) {
    if (value.charCodeAt(0) === 0xfeff) {
        return value.slice(1);
    }
    return value;
}

function dedupeAndSort(items: RegistryItemMeta[]) {
    const map = new Map<string, RegistryItemMeta>();
    for (const item of items) {
        if (!item.name) continue;
        map.set(item.name, item);
    }

    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function readFromManifest(): Promise<RegistryItemMeta[]> {
    const raw = stripBom(await fs.readFile(REGISTRY_MANIFEST_PATH, 'utf8'));
    const parsed = JSON.parse(raw) as RegistryManifest;
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    return items
        .map((item) => ({
            name: item.name?.trim() ?? '',
            type: item.type?.trim() ?? 'registry:component',
            title: item.title?.trim() || undefined,
            description: item.description?.trim() || undefined,
        }))
        .filter((item) => Boolean(item.name));
}

async function readFromBlocksFallback(): Promise<RegistryItemMeta[]> {
    const dirs = await fs.readdir(REGISTRY_BLOCKS_PATH, { withFileTypes: true });
    return dirs
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({
            name: entry.name,
            type: 'registry:block',
            title: entry.name
                .split('-')
                .map((part) => part[0]?.toUpperCase() + part.slice(1))
                .join(' '),
        }));
}

export async function readRegistryItems() {
    try {
        const items = await readFromManifest();
        return dedupeAndSort(items);
    } catch {
        try {
            const fallback = await readFromBlocksFallback();
            return dedupeAndSort(fallback);
        } catch {
            return [];
        }
    }
}

export async function getRegistryItemByName(name?: string | null) {
    if (!name) return null;
    const items = await readRegistryItems();
    return items.find((item) => item.name === name) ?? null;
}
