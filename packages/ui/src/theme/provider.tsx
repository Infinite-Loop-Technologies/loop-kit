import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';

import { compileThemeToCssVars } from './compile';
import {
    ThemeModeSchema,
    type ThemeDefinition,
    type ThemeMode,
} from './schema';

export type ThemeSet = {
    light: ThemeDefinition;
    dark: ThemeDefinition;
};

export type ThemeProviderProps = PropsWithChildren<{
    theme: ThemeDefinition | ThemeSet;
    mode?: ThemeMode;
    target?: HTMLElement | null;
}>;

type ThemeContextValue = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    activeTheme: ThemeDefinition;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeSet(value: ThemeDefinition | ThemeSet): value is ThemeSet {
    return 'light' in value && 'dark' in value;
}

export function ThemeProvider({
    children,
    theme,
    mode,
    target,
}: ThemeProviderProps) {
    const [currentMode, setCurrentMode] = useState<ThemeMode>(() => {
        const selected = mode ?? (isThemeSet(theme) ? 'light' : theme.mode);
        return ThemeModeSchema.parse(selected);
    });

    useEffect(() => {
        if (!mode) {
            return;
        }
        setCurrentMode(ThemeModeSchema.parse(mode));
    }, [mode]);

    const activeTheme = useMemo<ThemeDefinition>(() => {
        if (isThemeSet(theme)) {
            return currentMode === 'dark' ? theme.dark : theme.light;
        }

        return theme;
    }, [currentMode, theme]);

    useEffect(() => {
        const root = target ?? (typeof document === 'undefined' ? null : document.documentElement);
        if (!root) {
            return;
        }

        const compiled = compileThemeToCssVars(activeTheme);
        for (const [name, value] of Object.entries(compiled.vars)) {
            root.style.setProperty(name, value);
        }
        root.setAttribute('data-loop-theme', activeTheme.id);
        root.setAttribute('data-loop-mode', currentMode);
    }, [activeTheme, currentMode, target]);

    const contextValue = useMemo<ThemeContextValue>(
        () => ({
            mode: currentMode,
            setMode: (next) => setCurrentMode(ThemeModeSchema.parse(next)),
            activeTheme,
        }),
        [activeTheme, currentMode],
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useThemeProviderState(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeProviderState must be used within a ThemeProvider.');
    }
    return context;
}

export function useToggleThemeMode(): () => void {
    const { mode, setMode } = useThemeProviderState();

    return useCallback(() => {
        setMode(mode === 'dark' ? 'light' : 'dark');
    }, [mode, setMode]);
}
