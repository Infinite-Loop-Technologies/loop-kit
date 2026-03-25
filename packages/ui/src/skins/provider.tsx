import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';

import { compileThemeToCssVars } from '../theme/compile';
import { ThemeModeSchema, type ThemeMode } from '../theme/schema';
import {
    createSkinAssetResolver,
    createSkinIconRegistry,
    resolveUiSkin,
    type UiSkinRegistry,
} from './registry';
import type { ResolvedUiSkin, UiSkinDefinition } from './schema';
import type { IconRegistry } from '../icons/types';

export type UiProviderProps = PropsWithChildren<{
    skin: UiSkinDefinition | ResolvedUiSkin;
    mode?: ThemeMode;
    target?: HTMLElement | null;
    registry?: UiSkinRegistry;
    iconRegistry?: IconRegistry;
}>;

type UiContextValue = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    activeSkin: ResolvedUiSkin;
    activeTheme: ResolvedUiSkin['themes']['light'] | ResolvedUiSkin['themes']['dark'];
    assetResolver: ReturnType<typeof createSkinAssetResolver>;
    iconRegistry: ReturnType<typeof createSkinIconRegistry>;
};

const UiContext = createContext<UiContextValue | undefined>(undefined);

function resolveProviderSkin(
    skin: UiSkinDefinition | ResolvedUiSkin,
    registry?: UiSkinRegistry,
): ResolvedUiSkin {
    const source = registry?.resolved() ?? {};
    return resolveUiSkin(skin, {
        ...source,
        [skin.id]: skin,
    });
}

export function UiProvider({
    children,
    skin,
    mode,
    target,
    registry,
    iconRegistry: sourceIconRegistry,
}: UiProviderProps) {
    const resolvedSkin = useMemo(
        () => resolveProviderSkin(skin, registry),
        [registry, skin],
    );

    const [currentMode, setCurrentMode] = useState<ThemeMode>(() => {
        const selected = mode ?? resolvedSkin.themes.dark.mode;
        return ThemeModeSchema.parse(selected);
    });

    useEffect(() => {
        if (!mode) {
            return;
        }
        setCurrentMode(ThemeModeSchema.parse(mode));
    }, [mode]);

    const activeTheme = useMemo(
        () => (currentMode === 'dark' ? resolvedSkin.themes.dark : resolvedSkin.themes.light),
        [currentMode, resolvedSkin],
    );

    const assetResolver = useMemo(
        () => createSkinAssetResolver(resolvedSkin),
        [resolvedSkin],
    );
    const iconRegistry = useMemo(
        () => createSkinIconRegistry(resolvedSkin, sourceIconRegistry),
        [resolvedSkin, sourceIconRegistry],
    );

    useEffect(() => {
        const root =
            target ?? (typeof document === 'undefined' ? null : document.documentElement);
        if (!root) {
            return;
        }

        const compiled = compileThemeToCssVars(activeTheme);
        for (const [name, value] of Object.entries(compiled.vars)) {
            root.style.setProperty(name, value);
        }

        root.setAttribute('data-loop-skin', resolvedSkin.id);
        root.setAttribute('data-loop-theme', activeTheme.id);
        root.setAttribute('data-loop-mode', currentMode);
    }, [activeTheme, currentMode, resolvedSkin.id, target]);

    const contextValue = useMemo<UiContextValue>(
        () => ({
            mode: currentMode,
            setMode: (nextMode) => setCurrentMode(ThemeModeSchema.parse(nextMode)),
            activeSkin: resolvedSkin,
            activeTheme,
            assetResolver,
            iconRegistry,
        }),
        [activeTheme, assetResolver, currentMode, iconRegistry, resolvedSkin],
    );

    return <UiContext.Provider value={contextValue}>{children}</UiContext.Provider>;
}

export function useUiProviderState(): UiContextValue {
    const context = useContext(UiContext);
    if (!context) {
        throw new Error('useUiProviderState must be used within a UiProvider.');
    }
    return context;
}

export function useOptionalUiProviderState(): UiContextValue | undefined {
    return useContext(UiContext);
}
