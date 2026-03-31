import type { PrimitiveKey } from './blueprints';
import type { Recipe } from './recipes';
import {
    ColorModeSchema,
    createFallbackTokens,
    mergeTokens,
    type ColorMode,
    type LoomTokenPatch,
    type LoomTokens,
} from './tokens';

export type LoomThemeModeDefinition = {
    tokens?: LoomTokenPatch;
};

export type LoomThemeLayer = {
    id: string;
    label?: string;
    description?: string;
    modes: Record<ColorMode, LoomThemeModeDefinition>;
    recipes?: Partial<Record<PrimitiveKey, Recipe>>;
};

export type ResolvedLoomTheme = {
    id: string;
    label?: string;
    colorMode: ColorMode;
    tokens: LoomTokens;
    recipes: Partial<Record<PrimitiveKey, Recipe>>;
    layers: string[];
};

export function resolveThemeLayers(
    layers: readonly LoomThemeLayer[],
    colorMode: ColorMode,
    fallback = createFallbackTokens(),
): ResolvedLoomTheme {
    const mode = ColorModeSchema.parse(colorMode);
    let tokens = structuredClone(fallback);
    const recipes: Partial<Record<PrimitiveKey, Recipe>> = {};
    const layerIds: string[] = [];

    for (const layer of layers) {
        tokens = mergeTokens(tokens, layer.modes[mode]?.tokens);
        Object.assign(recipes, layer.recipes ?? {});
        layerIds.push(layer.id);
    }

    return {
        id: layerIds.join('+') || 'loom-theme',
        label: layers[layers.length - 1]?.label ?? layers[0]?.label,
        colorMode: mode,
        tokens,
        recipes,
        layers: layerIds,
    };
}
