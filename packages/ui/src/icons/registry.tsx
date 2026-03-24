import type { IconComponent, IconId, IconRegistry } from './types';

export function createIconRegistry(input: { icons: Record<IconId, IconComponent> }): IconRegistry {
    const entries = { ...input.icons };

    return {
        get: (id) => entries[id],
        has: (id) => id in entries,
        ids: () => Object.keys(entries),
    };
}

export function mergeIconRegistries(...registries: IconRegistry[]): IconRegistry {
    const ids = new Set<string>();
    for (const registry of registries) {
        for (const id of registry.ids()) {
            ids.add(id);
        }
    }

    return {
        get: (id) => {
            for (const registry of registries) {
                const component = registry.get(id);
                if (component) {
                    return component;
                }
            }
            return undefined;
        },
        has: (id) => registries.some((registry) => registry.has(id)),
        ids: () => Array.from(ids),
    };
}
