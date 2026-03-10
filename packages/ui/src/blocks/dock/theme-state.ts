import {
    ThemeSchema,
    defaultDarkTheme,
    defaultLightTheme,
    type ThemeDefinition,
    type ThemeMode,
} from '../../theme';
import { TokenSchema, type Tokens } from '../../tokens';
import type { DesignTokenEntry } from '../token-editor';

export type DockThemePreset = {
    id: string;
    label: string;
    description?: string;
    source?: string;
    tags?: string[];
    themes: {
        light: ThemeDefinition;
        dark: ThemeDefinition;
    };
};

export type DockThemePresetMap = Record<string, DockThemePreset>;

function cloneTheme(theme: ThemeDefinition): ThemeDefinition {
    return structuredClone(theme);
}

function patchTokens(base: Tokens, patch: Partial<Tokens>): Tokens {
    return {
        ...base,
        ...patch,
        colors: {
            ...base.colors,
            ...(patch.colors ?? {}),
        },
        radius: {
            ...base.radius,
            ...(patch.radius ?? {}),
        },
        spacing: {
            ...base.spacing,
            ...(patch.spacing ?? {}),
        },
        typography: {
            ...base.typography,
            ...(patch.typography ?? {}),
        },
        elevation: {
            ...base.elevation,
            ...(patch.elevation ?? {}),
        },
        fx: {
            ...base.fx,
            ...(patch.fx ?? {}),
        },
    };
}

function createThemeDefinition(
    id: string,
    mode: ThemeMode,
    baseTheme: ThemeDefinition,
    tokenPatch: Partial<Tokens>,
): ThemeDefinition {
    return ThemeSchema.parse({
        ...cloneTheme(baseTheme),
        id,
        mode,
        tokens: patchTokens(baseTheme.tokens, tokenPatch),
    });
}

export function createDockThemePresets(): DockThemePresetMap {
    const baseLight = cloneTheme(defaultLightTheme);
    const baseDark = cloneTheme(defaultDarkTheme);

    const graphiteLight = createThemeDefinition('graphite-light', 'light', defaultLightTheme, {
        colors: {
            background: 'oklch(0.97 0.01 260)',
            foreground: 'oklch(0.28 0.03 260)',
            surface: 'oklch(0.99 0.005 260)',
            surfaceForeground: 'oklch(0.28 0.03 260)',
            border: 'oklch(0.86 0.01 260)',
            accent: 'oklch(0.58 0.15 230)',
            accentForeground: 'oklch(0.99 0.01 235)',
            muted: 'oklch(0.93 0.01 260)',
            mutedForeground: 'oklch(0.46 0.03 260)',
            danger: 'oklch(0.62 0.2 28)',
            dangerForeground: 'oklch(0.98 0.01 28)',
        },
        radius: {
            sm: '0.2rem',
            md: '0.35rem',
            lg: '0.55rem',
            xl: '0.9rem',
            pill: '999px',
        },
        typography: {
            familySans: '"IBM Plex Sans", "Inter", sans-serif',
            familyMono: '"JetBrains Mono", "Fira Code", monospace',
            sizeSm: '0.75rem',
            sizeMd: '0.875rem',
            sizeLg: '1rem',
            weightNormal: '410',
            weightMedium: '560',
            weightBold: '680',
            lineHeight: '1.5',
        },
        fx: {
            panelTexture: 'asset://texture/panel/noise-01',
            panelOverlayOpacity: '0.22',
            glassBlur: '10px',
        },
    });

    const graphiteDark = createThemeDefinition('graphite-dark', 'dark', defaultDarkTheme, {
        colors: {
            background: 'oklch(0.17 0.01 250)',
            foreground: 'oklch(0.9 0.015 250)',
            surface: 'oklch(0.22 0.012 250)',
            surfaceForeground: 'oklch(0.93 0.02 250)',
            border: 'oklch(0.33 0.01 250)',
            accent: 'oklch(0.74 0.14 225)',
            accentForeground: 'oklch(0.2 0.02 230)',
            muted: 'oklch(0.26 0.01 250)',
            mutedForeground: 'oklch(0.7 0.02 250)',
            danger: 'oklch(0.66 0.2 28)',
            dangerForeground: 'oklch(0.2 0.02 28)',
        },
        radius: {
            sm: '0.2rem',
            md: '0.35rem',
            lg: '0.55rem',
            xl: '0.9rem',
            pill: '999px',
        },
        typography: {
            familySans: '"IBM Plex Sans", "Inter", sans-serif',
            familyMono: '"JetBrains Mono", "Fira Code", monospace',
            sizeSm: '0.75rem',
            sizeMd: '0.875rem',
            sizeLg: '1rem',
            weightNormal: '410',
            weightMedium: '560',
            weightBold: '680',
            lineHeight: '1.5',
        },
        fx: {
            panelTexture: 'asset://texture/panel/noise-02',
            panelOverlayOpacity: '0.28',
            glassBlur: '12px',
        },
    });

    const sunsetLight = createThemeDefinition('sunset-light', 'light', defaultLightTheme, {
        colors: {
            background: 'oklch(0.97 0.03 75)',
            foreground: 'oklch(0.34 0.06 42)',
            surface: 'oklch(0.99 0.02 88)',
            surfaceForeground: 'oklch(0.36 0.06 44)',
            border: 'oklch(0.86 0.06 70)',
            accent: 'oklch(0.69 0.2 34)',
            accentForeground: 'oklch(0.98 0.01 85)',
            muted: 'oklch(0.92 0.03 70)',
            mutedForeground: 'oklch(0.5 0.08 40)',
            danger: 'oklch(0.62 0.24 26)',
            dangerForeground: 'oklch(0.98 0.01 26)',
        },
        radius: {
            sm: '0.35rem',
            md: '0.65rem',
            lg: '1rem',
            xl: '1.4rem',
            pill: '999px',
        },
        typography: {
            familySans: '"Sora", "Avenir Next", sans-serif',
            familyMono: '"IBM Plex Mono", monospace',
            sizeSm: '0.76rem',
            sizeMd: '0.92rem',
            sizeLg: '1.08rem',
            weightNormal: '430',
            weightMedium: '600',
            weightBold: '720',
            lineHeight: '1.45',
        },
        elevation: {
            level1: '0 3px 12px oklch(0.55 0.07 45 / 0.14)',
            level2: '0 8px 24px oklch(0.45 0.09 35 / 0.18)',
            level3: '0 14px 42px oklch(0.4 0.11 30 / 0.24)',
        },
        fx: {
            panelTexture: 'asset://texture/panel/mesh-01',
            panelOverlayOpacity: '0.2',
            glassBlur: '6px',
        },
    });

    const sunsetDark = createThemeDefinition('sunset-dark', 'dark', defaultDarkTheme, {
        colors: {
            background: 'oklch(0.2 0.03 18)',
            foreground: 'oklch(0.92 0.03 80)',
            surface: 'oklch(0.24 0.03 20)',
            surfaceForeground: 'oklch(0.93 0.03 78)',
            border: 'oklch(0.38 0.04 26)',
            accent: 'oklch(0.75 0.2 42)',
            accentForeground: 'oklch(0.24 0.03 22)',
            muted: 'oklch(0.28 0.03 22)',
            mutedForeground: 'oklch(0.72 0.04 66)',
            danger: 'oklch(0.68 0.22 28)',
            dangerForeground: 'oklch(0.24 0.03 26)',
        },
        radius: {
            sm: '0.35rem',
            md: '0.65rem',
            lg: '1rem',
            xl: '1.4rem',
            pill: '999px',
        },
        typography: {
            familySans: '"Sora", "Avenir Next", sans-serif',
            familyMono: '"IBM Plex Mono", monospace',
            sizeSm: '0.76rem',
            sizeMd: '0.92rem',
            sizeLg: '1.08rem',
            weightNormal: '430',
            weightMedium: '600',
            weightBold: '720',
            lineHeight: '1.45',
        },
        elevation: {
            level1: '0 2px 8px oklch(0.1 0.02 24 / 0.4)',
            level2: '0 8px 22px oklch(0.08 0.02 22 / 0.5)',
            level3: '0 14px 36px oklch(0.06 0.02 20 / 0.56)',
        },
        fx: {
            panelTexture: 'asset://texture/panel/noise-03',
            panelOverlayOpacity: '0.34',
            glassBlur: '12px',
        },
    });

    return {
        classic: {
            id: 'classic',
            label: 'Classic',
            description: 'Baseline Loop tokens.',
            source: '@loop-kit/ui/theme/defaultThemeSet',
            tags: ['default', 'stable'],
            themes: {
                light: baseLight,
                dark: baseDark,
            },
        },
        graphite: {
            id: 'graphite',
            label: 'Graphite',
            description: 'High-contrast productivity skin tuned for dense workspaces.',
            source: 'ui-demo',
            tags: ['graphite', 'dock', 'dense'],
            themes: {
                light: graphiteLight,
                dark: graphiteDark,
            },
        },
        sunset: {
            id: 'sunset',
            label: 'Sunset',
            description: 'Warm rounded reskin with stronger depth and motion contrast.',
            source: 'ui-demo',
            tags: ['reskin', 'warm'],
            themes: {
                light: sunsetLight,
                dark: sunsetDark,
            },
        },
    };
}

function flattenTokenTree(
    value: unknown,
    prefix: string[],
    entries: DesignTokenEntry[],
): void {
    if (typeof value === 'string') {
        entries.push({
            path: prefix.join('.'),
            value,
            group: prefix[0] ?? 'token',
        });
        return;
    }

    if (value && typeof value === 'object') {
        for (const [key, nested] of Object.entries(value)) {
            flattenTokenTree(nested, [...prefix, key], entries);
        }
    }
}

export function listDesignTokenEntries(theme: ThemeDefinition): DesignTokenEntry[] {
    const entries: DesignTokenEntry[] = [];
    flattenTokenTree(theme.tokens, [], entries);
    return entries.sort((left, right) => left.path.localeCompare(right.path));
}

export function setThemeTokenValue(
    theme: ThemeDefinition,
    path: string,
    value: string,
): ThemeDefinition | null {
    const nextTokens = structuredClone(theme.tokens) as Record<string, unknown>;
    const segments = path.split('.').filter(Boolean);
    if (segments.length <= 0) {
        return null;
    }

    let cursor: Record<string, unknown> = nextTokens;
    for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index];
        const current = cursor[segment];
        const isLeaf = index === segments.length - 1;

        if (isLeaf) {
            if (typeof current !== 'string') {
                return null;
            }
            cursor[segment] = value;
            break;
        }

        if (!current || typeof current !== 'object') {
            return null;
        }
        cursor = current as Record<string, unknown>;
    }

    const parsedTokens = TokenSchema.safeParse(nextTokens);
    if (!parsedTokens.success) {
        return null;
    }

    const parsedTheme = ThemeSchema.safeParse({
        ...theme,
        tokens: parsedTokens.data,
    });
    if (!parsedTheme.success) {
        return null;
    }

    return parsedTheme.data;
}

export function validateThemeSetEntry(
    preset: DockThemePreset,
    mode: ThemeMode,
): string | null {
    const theme = mode === 'dark' ? preset.themes.dark : preset.themes.light;
    const tokens = TokenSchema.safeParse(theme.tokens);
    if (!tokens.success) {
        return tokens.error.issues[0]?.message ?? 'Token schema validation failed.';
    }

    const validatedTheme = ThemeSchema.safeParse(theme);
    if (!validatedTheme.success) {
        return validatedTheme.error.issues[0]?.message ?? 'Theme schema validation failed.';
    }

    return null;
}
