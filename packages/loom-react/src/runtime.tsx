import * as React from 'react';

import {
    getBlueprint,
    resolveBlueprintVariants,
    resolveThemeLayers,
    tokensToCssVariables,
    type ColorMode,
    type LoomThemeLayer,
    type LoomTokens,
    type PrimitiveKey,
    type PrimitiveState,
    type Recipe,
    type ResolvedLoomTheme,
    type ResolvedStyles,
    type ResolvedVariantValues,
} from '@loop-kit/loom-core';

export type LoomPrimitiveImplementationProps<TProps extends object> = TProps & {
    blueprintKey: PrimitiveKey;
    colorMode: ColorMode;
    state: PrimitiveState;
    styles: ResolvedStyles;
    tokens: LoomTokens;
    variants: ResolvedVariantValues;
};

export type LoomPrimitiveImplementation<
    TProps extends object = Record<string, unknown>,
> = React.ComponentType<LoomPrimitiveImplementationProps<TProps>>;

export type LoomImplementationMap = Partial<
    Record<PrimitiveKey, LoomPrimitiveImplementation<object>>
>;

export type LoomReactThemeLayer = LoomThemeLayer & {
    implementations?: LoomImplementationMap;
};

export type ResolvedLoomReactTheme = ResolvedLoomTheme & {
    implementations: LoomImplementationMap;
};

function resolveReactThemeLayers(
    layers: readonly LoomReactThemeLayer[],
    colorMode: ColorMode,
): ResolvedLoomReactTheme {
    const resolved = resolveThemeLayers(layers, colorMode);
    const implementations: LoomImplementationMap = {};

    for (const layer of layers) {
        Object.assign(implementations, layer.implementations ?? {});
    }

    return {
        ...resolved,
        implementations,
    };
}

type LoomContextValue = {
    colorMode: ColorMode;
    setColorMode: (mode: ColorMode) => void;
    theme: ResolvedLoomReactTheme;
};

const LoomContext = React.createContext<LoomContextValue | null>(null);

export type LoomProviderProps = {
    children: React.ReactNode;
    className?: string;
    colorMode?: ColorMode;
    defaultColorMode?: ColorMode;
    style?: React.CSSProperties;
    themes: readonly LoomReactThemeLayer[];
};

export function LoomProvider({
    children,
    className,
    colorMode,
    defaultColorMode = 'dark',
    style,
    themes,
}: LoomProviderProps) {
    const [internalMode, setInternalMode] = React.useState<ColorMode>(defaultColorMode);
    const activeMode = colorMode ?? internalMode;
    const theme = React.useMemo(() => resolveReactThemeLayers(themes, activeMode), [activeMode, themes]);
    const cssVars = React.useMemo(() => tokensToCssVariables(theme.tokens), [theme.tokens]);

    const value = React.useMemo<LoomContextValue>(
        () => ({
            colorMode: activeMode,
            setColorMode: setInternalMode,
            theme,
        }),
        [activeMode, theme],
    );

    return (
        <LoomContext.Provider value={value}>
            <div
                className={className}
                data-loom-color-mode={activeMode}
                data-loom-theme={theme.layers.join(' ')}
                style={{
                    ...cssVars,
                    color: theme.tokens.color.text,
                    fontFamily: theme.tokens.font.bodyFamily,
                    ...style,
                }}>
                {children}
            </div>
        </LoomContext.Provider>
    );
}

export function useLoom() {
    const value = React.useContext(LoomContext);
    if (!value) {
        throw new Error('LoomProvider is required before using Loom primitives.');
    }
    return value;
}

export function useLoomTokens() {
    return useLoom().theme.tokens;
}

export function useLoomColorMode() {
    const { colorMode, setColorMode } = useLoom();
    return {
        colorMode,
        setColorMode,
    };
}

export function useLoomPrimitive<TProps extends object>(
    key: PrimitiveKey,
    props: TProps,
    state: PrimitiveState,
) {
    const { colorMode, theme } = useLoom();
    const blueprint = getBlueprint(key);
    const variants = React.useMemo(
        () => resolveBlueprintVariants(blueprint, props as Record<string, unknown>),
        [blueprint, props],
    );
    const recipe = theme.recipes[key] as Recipe | undefined;
    const styles = React.useMemo(
        () => recipe?.({ tokens: theme.tokens, variants, state }) ?? {},
        [recipe, state, theme.tokens, variants],
    );
    const Implementation = theme.implementations[key] as
        | LoomPrimitiveImplementation<TProps>
        | undefined;

    return {
        blueprint,
        colorMode,
        Implementation,
        styles,
        tokens: theme.tokens,
        variants,
    };
}
