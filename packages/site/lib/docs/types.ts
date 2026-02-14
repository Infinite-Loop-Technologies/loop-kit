export type RegistryItemMeta = {
    name: string;
    type: string;
    title?: string;
    description?: string;
};

export type DocDemoSize = 'default' | 'large';

export type DocPage = {
    slug: string;
    title: string;
    description: string;
    section: string;
    order: number;
    body: string;
    published: boolean;
    registryItem?: string;
    demoSize: DocDemoSize;
    createdAt: string;
    updatedAt: string;
};

export type DocsStore = {
    pages: DocPage[];
};

export type UpsertDocPageInput = {
    originalSlug?: string;
    slug: string;
    title: string;
    description?: string;
    section?: string;
    order?: number;
    body?: string;
    published?: boolean;
    registryItem?: string;
    demoSize?: DocDemoSize;
};

export type DocNavPage = Pick<
    DocPage,
    'slug' | 'title' | 'description' | 'registryItem' | 'updatedAt'
>;

export type DocNavSection = {
    name: string;
    pages: DocNavPage[];
};
