import type { IconComponent, IconId, IconRegistry } from './types';

export function createIconRegistry(input: { icons: Record<IconId, IconComponent> }): IconRegistry {
    const entries = { ...input.icons };

    return {
        get: (id) => entries[id],
        has: (id) => id in entries,
        ids: () => Object.keys(entries),
    };
}
