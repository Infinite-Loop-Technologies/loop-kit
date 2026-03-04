import { defaultDarkTokens, defaultLightTokens } from '../tokens';
import type { ThemeDefinition } from './schema';

export const defaultLightTheme: ThemeDefinition = {
    id: 'loop-light',
    mode: 'light',
    tokens: defaultLightTokens,
};

export const defaultDarkTheme: ThemeDefinition = {
    id: 'loop-dark',
    mode: 'dark',
    tokens: defaultDarkTokens,
};

export const defaultThemeSet = {
    light: defaultLightTheme,
    dark: defaultDarkTheme,
};
