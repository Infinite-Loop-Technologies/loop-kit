import { createAssetResolver, defaultAssetRegistry, type AssetResolver } from '../assets';
import { createIconRegistry, defaultIconRegistry } from '../icons';
import type { IconRegistry } from '../icons/types';
import {
    ResolvedUiSkinSchema,
    UiSkinDefinitionSchema,
    type ResolvedUiSkin,
    type UiSkinAssets,
    type UiSkinDefinition,
} from './schema';

export type UiSkinRegistry = {
    get: (id: string) => UiSkinDefinition | ResolvedUiSkin | undefined;
    resolve: (id: string) => ResolvedUiSkin | undefined;
    ids: () => string[];
    resolved: () => Record<string, ResolvedUiSkin>;
};

function humanizeSkinId(id: string): string {
    return id
        .split(/[-_/]/g)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function mergeSkinAssets(
    base?: UiSkinAssets,
    override?: UiSkinAssets,
): UiSkinAssets {
    return {
        assets: {
            ...(base?.assets ?? {}),
            ...(override?.assets ?? {}),
        },
        textures: {
            ...(base?.textures ?? {}),
            ...(override?.textures ?? {}),
        },
    };
}

function uniqueTags(input: readonly string[]): string[] {
    return Array.from(new Set(input.filter((value) => value.trim().length > 0)));
}

export function resolveUiSkin(
    skin: UiSkinDefinition | ResolvedUiSkin,
    registry: Record<string, UiSkinDefinition | ResolvedUiSkin> = {},
    lineage: string[] = [],
): ResolvedUiSkin {
    const parsed = UiSkinDefinitionSchema.parse(skin);
    if (lineage.includes(parsed.id)) {
        throw new Error(`Circular skin inheritance detected for ${parsed.id}.`);
    }

    const parent =
        parsed.extends && registry[parsed.extends]
            ? resolveUiSkin(registry[parsed.extends]!, registry, [...lineage, parsed.id])
            : undefined;

    return ResolvedUiSkinSchema.parse({
        id: parsed.id,
        label: parsed.label ?? humanizeSkinId(parsed.id),
        description: parsed.description ?? parent?.description,
        source: parsed.source ?? parent?.source,
        tags: uniqueTags([...(parent?.tags ?? []), ...(parsed.tags ?? [])]),
        themes: {
            light: parsed.themes.light ?? parent?.themes.light,
            dark: parsed.themes.dark ?? parent?.themes.dark,
        },
        assets: mergeSkinAssets(parent?.assets, parsed.assets),
        iconAliases: {
            ...(parent?.iconAliases ?? {}),
            ...(parsed.iconAliases ?? {}),
        },
        metadata: {
            ...(parent?.metadata ?? {}),
            ...(parsed.metadata ?? {}),
        },
    });
}

export function resolveUiSkinMap(
    skins: Record<string, UiSkinDefinition | ResolvedUiSkin>,
): Record<string, ResolvedUiSkin> {
    const resolved: Record<string, ResolvedUiSkin> = {};
    for (const id of Object.keys(skins)) {
        resolved[id] = resolveUiSkin(skins[id]!, skins);
    }
    return resolved;
}

export function createUiSkinRegistry(input: {
    skins: Record<string, UiSkinDefinition | ResolvedUiSkin>;
}): UiSkinRegistry {
    const entries = { ...input.skins };

    return {
        get(id) {
            return entries[id];
        },
        resolve(id) {
            const entry = entries[id];
            return entry ? resolveUiSkin(entry, entries) : undefined;
        },
        ids() {
            return Object.keys(entries);
        },
        resolved() {
            return resolveUiSkinMap(entries);
        },
    };
}

export function createSkinAssetResolver(
    skin: ResolvedUiSkin,
): AssetResolver {
    return createAssetResolver({
        assets: {
            ...defaultAssetRegistry.assets,
            ...skin.assets.assets,
        },
        textures: {
            ...defaultAssetRegistry.textures,
            ...skin.assets.textures,
        },
    });
}

export function createSkinIconRegistry(
    skin: ResolvedUiSkin,
    sourceRegistry: IconRegistry = defaultIconRegistry,
): IconRegistry {
    const icons = Object.fromEntries(
        sourceRegistry
            .ids()
            .map((iconId) => {
                const targetId = skin.iconAliases[iconId] ?? iconId;
                const component =
                    sourceRegistry.get(targetId) ??
                    sourceRegistry.get(iconId) ??
                    defaultIconRegistry.get(targetId) ??
                    defaultIconRegistry.get(iconId);
                return component ? [iconId, component] : null;
            })
            .filter(
                (
                    entry,
                ): entry is [string, NonNullable<ReturnType<IconRegistry['get']>>] =>
                    entry !== null,
            ),
    );

    return createIconRegistry({ icons });
}
