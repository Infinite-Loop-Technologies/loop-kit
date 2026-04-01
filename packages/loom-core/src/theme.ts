import type { PrimitiveKey } from './blueprints';
import type { Recipe } from './recipes';
import {
    ColorModeSchema,
    composeTokens,
    type ColorMode,
    type LoomTokenPatch,
    type LoomTokens,
} from './tokens';

export type LoomThemeModeDefinition = {
    tokens?: LoomTokenPatch | LoomTokens;
};

/**
 * Theme layers carry inert token values and recipe overrides.
 * They do not render DOM and they do not define framework-specific assets.
 */
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
): ResolvedLoomTheme {
    const mode = ColorModeSchema.parse(colorMode);
    const recipes: Partial<Record<PrimitiveKey, Recipe>> = {};
    const layerIds: string[] = [];
    const tokenLayers: Array<LoomTokenPatch | LoomTokens> = [];

    for (const layer of layers) {
        const modeDefinition = layer.modes[mode];
        if (modeDefinition?.tokens) {
            tokenLayers.push(modeDefinition.tokens);
        }
        Object.assign(recipes, layer.recipes ?? {});
        layerIds.push(layer.id);
    }

    return {
        id: layerIds.join('+') || 'loom-theme',
        label: layers[layers.length - 1]?.label ?? layers[0]?.label,
        colorMode: mode,
        tokens: composeTokens(...tokenLayers),
        recipes,
        layers: layerIds,
    };
}
