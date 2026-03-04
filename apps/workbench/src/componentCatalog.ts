type ComponentFileEntry = {
    source: string;
    target: string;
};

type RawComponentManifest = {
    schemaVersion?: string;
    kind?: string;
    id?: string;
    name?: string;
    version?: string;
    description?: string;
    files?: ComponentFileEntry[];
    metadata?: Record<string, unknown>;
};

export type CatalogComponent = {
    id: string;
    name: string;
    version: string;
    description?: string;
    tags: string[];
    manifestPath: string;
    installRef: string;
    installCommand: string;
    adoptCommand: string;
    fileCount: number;
};

const manifestModules = import.meta.glob('../../../loop/components/**/loop.component.json', {
    eager: true,
});

function toTags(metadata: Record<string, unknown> | undefined): string[] {
    const raw = metadata?.tags;
    if (!Array.isArray(raw)) {
        return [];
    }

    return raw.filter((entry): entry is string => typeof entry === 'string');
}

function normalizeManifestPath(modulePath: string): string {
    return modulePath.replace(/\\/g, '/').replace(/^\.\.\//, '');
}

export const componentCatalog: CatalogComponent[] = Object.entries(manifestModules)
    .map<CatalogComponent | null>(([modulePath, value]) => {
        const raw = (value as { default?: unknown }).default ?? value;
        const manifest = raw as RawComponentManifest;
        if (manifest.kind !== 'component' || typeof manifest.id !== 'string') {
            return null;
        }

        const installRef = `local:${manifest.id}`;
        const pathLabel = normalizeManifestPath(modulePath);
        const version = typeof manifest.version === 'string' ? manifest.version : '0.0.0';
        const description = typeof manifest.description === 'string' ? manifest.description : undefined;
        return {
            id: manifest.id,
            name: typeof manifest.name === 'string' ? manifest.name : manifest.id,
            version,
            ...(description ? { description } : {}),
            tags: toTags(manifest.metadata),
            manifestPath: pathLabel,
            installRef,
            installCommand: `pnpm run loop -- add ${installRef} --to apps/my-app --cwd .`,
            adoptCommand: `pnpm run loop -- adopt ${installRef} --as ${manifest.id}-fork --cwd .`,
            fileCount: Array.isArray(manifest.files) ? manifest.files.length : 0,
        };
    })
    .filter((item): item is CatalogComponent => item !== null)
    .sort((left, right) => left.id.localeCompare(right.id));

export function filterCatalog(query: string): CatalogComponent[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
        return componentCatalog;
    }

    return componentCatalog.filter((entry) => {
        const haystack = `${entry.id} ${entry.name} ${entry.description ?? ''} ${entry.tags.join(' ')}`.toLowerCase();
        return haystack.includes(trimmed);
    });
}
