import { type PropsWithChildren } from 'react';

import {
    UiProvider,
    useUiProviderState,
} from '../skins';
import { type ThemeDefinition, type ThemeMode } from './schema';

export type ThemeSet = {
    light: ThemeDefinition;
    dark: ThemeDefinition;
};

export type ThemeProviderProps = PropsWithChildren<{
    theme: ThemeDefinition | ThemeSet;
    mode?: ThemeMode;
    target?: HTMLElement | null;
}>;

export type ThemeContextValue = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    activeTheme: ThemeDefinition;
};

function isThemeSet(value: ThemeDefinition | ThemeSet): value is ThemeSet {
    return 'light' in value && 'dark' in value;
}

function toThemeBackedSkin(theme: ThemeDefinition | ThemeSet) {
    if (isThemeSet(theme)) {
        return {
            id: 'theme-provider-skin',
            label: 'Theme Provider Skin',
            themes: {
                light: theme.light,
                dark: theme.dark,
            },
        };
    }

    return {
        id: `${theme.id}-skin`,
        label: theme.id,
        themes: {
            light:
                theme.mode === 'light'
                    ? theme
                    : {
                          ...theme,
                          id: `${theme.id}-light`,
                          mode: 'light' as const,
                      },
            dark:
                theme.mode === 'dark'
                    ? theme
                    : {
                          ...theme,
                          id: `${theme.id}-dark`,
                          mode: 'dark' as const,
                      },
        },
    };
}

export function ThemeProvider({
    children,
    theme,
    mode,
    target,
}: ThemeProviderProps) {
    const resolvedMode = mode ?? (isThemeSet(theme) ? 'light' : theme.mode);

    return (
        <UiProvider
            skin={toThemeBackedSkin(theme)}
            mode={resolvedMode}
            target={target}>
            {children}
        </UiProvider>
    );
}

export function useThemeProviderState(): ThemeContextValue {
    const context = useUiProviderState();
    return {
        mode: context.mode,
        setMode: context.setMode,
        activeTheme: context.activeTheme,
    };
}

export function useToggleThemeMode(): () => void {
    const { mode, setMode } = useThemeProviderState();

    return () => {
        setMode(mode === 'dark' ? 'light' : 'dark');
    };
}
