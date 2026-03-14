import { defaultDarkTheme, defaultLightTheme } from '../theme/default-themes';
import { ThemeSchema, type ThemeDefinition } from '../theme/schema';
import { defaultDarkTokens, defaultLightTokens, type Tokens } from '../tokens';
import { createUiSkinRegistry } from './registry';
import type { ResolvedUiSkin, UiSkinDefinition } from './schema';

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
    mode: 'light' | 'dark',
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

export const DEFAULT_UI_SKIN_ID = 'forge';

export const defaultUiSkinDefinitions: Record<string, UiSkinDefinition> = {
    classic: {
        id: 'classic',
        label: 'Classic',
        description: 'Baseline Loop tokens.',
        source: '@loop-kit/ui/theme/defaultThemeSet',
        tags: ['default', 'stable'],
        themes: {
            light: {
                id: 'classic-light',
                mode: 'light',
                tokens: defaultLightTokens,
            },
            dark: {
                id: 'classic-dark',
                mode: 'dark',
                tokens: defaultDarkTokens,
            },
        },
    },
    graphite: {
        id: 'graphite',
        label: 'Graphite',
        description: 'High-contrast productivity skin tuned for dense workspaces.',
        extends: 'classic',
        source: '@loop-kit/ui/skins/defaultUiSkinDefinitions',
        tags: ['graphite', 'dock', 'dense'],
        themes: {
            light: createThemeDefinition('graphite-light', 'light', defaultLightTheme, {
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
            }),
            dark: createThemeDefinition('graphite-dark', 'dark', defaultDarkTheme, {
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
            }),
        },
    },
    sunset: {
        id: 'sunset',
        label: 'Sunset',
        description: 'Warm rounded reskin with stronger depth and motion contrast.',
        extends: 'classic',
        source: '@loop-kit/ui/skins/defaultUiSkinDefinitions',
        tags: ['warm', 'reskin'],
        themes: {
            light: createThemeDefinition('sunset-light', 'light', defaultLightTheme, {
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
            }),
            dark: createThemeDefinition('sunset-dark', 'dark', defaultDarkTheme, {
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
            }),
        },
    },
    forge: {
        id: 'forge',
        label: 'Forge',
        description: 'Steel-blue operator skin tuned for dense multi-panel work.',
        extends: 'graphite',
        source: '@loop-kit/ui/skins/defaultUiSkinDefinitions',
        tags: ['forge', 'operator', 'dense'],
        themes: {
            light: createThemeDefinition('forge-light', 'light', defaultLightTheme, {
                colors: {
                    background: 'oklch(0.97 0.008 240)',
                    foreground: 'oklch(0.24 0.03 248)',
                    surface: 'oklch(0.995 0.004 245)',
                    surfaceForeground: 'oklch(0.24 0.03 248)',
                    border: 'oklch(0.86 0.012 245)',
                    accent: 'oklch(0.57 0.16 235)',
                    accentForeground: 'oklch(0.985 0.01 245)',
                    muted: 'oklch(0.93 0.008 245)',
                    mutedForeground: 'oklch(0.47 0.025 245)',
                    danger: 'oklch(0.63 0.19 30)',
                    dangerForeground: 'oklch(0.99 0.01 30)',
                },
                typography: {
                    familySans: '"Aptos", "IBM Plex Sans", sans-serif',
                    familyMono: '"JetBrains Mono", "Cascadia Code", monospace',
                    sizeSm: '0.78rem',
                    sizeMd: '0.9rem',
                    sizeLg: '1.04rem',
                    weightNormal: '430',
                    weightMedium: '600',
                    weightBold: '720',
                    lineHeight: '1.48',
                },
                elevation: {
                    level1: '0 8px 18px oklch(0.58 0.03 245 / 0.14)',
                    level2: '0 16px 32px oklch(0.52 0.04 245 / 0.2)',
                    level3: '0 24px 56px oklch(0.48 0.05 245 / 0.28)',
                },
                fx: {
                    panelTexture: 'asset://texture/panel/mesh-01',
                    panelOverlayOpacity: '0.16',
                    glassBlur: '18px',
                },
            }),
            dark: createThemeDefinition('forge-dark', 'dark', defaultDarkTheme, {
                colors: {
                    background: 'oklch(0.15 0.012 245)',
                    foreground: 'oklch(0.93 0.015 250)',
                    surface: 'oklch(0.19 0.013 245)',
                    surfaceForeground: 'oklch(0.94 0.015 250)',
                    border: 'oklch(0.32 0.015 245)',
                    accent: 'oklch(0.72 0.15 235)',
                    accentForeground: 'oklch(0.18 0.015 245)',
                    muted: 'oklch(0.24 0.012 245)',
                    mutedForeground: 'oklch(0.73 0.02 245)',
                    danger: 'oklch(0.67 0.19 30)',
                    dangerForeground: 'oklch(0.18 0.015 245)',
                },
                typography: {
                    familySans: '"Aptos", "IBM Plex Sans", sans-serif',
                    familyMono: '"JetBrains Mono", "Cascadia Code", monospace',
                    sizeSm: '0.78rem',
                    sizeMd: '0.9rem',
                    sizeLg: '1.04rem',
                    weightNormal: '430',
                    weightMedium: '600',
                    weightBold: '720',
                    lineHeight: '1.48',
                },
                elevation: {
                    level1: '0 10px 24px oklch(0.02 0.01 245 / 0.35)',
                    level2: '0 20px 44px oklch(0.02 0.01 245 / 0.44)',
                    level3: '0 28px 68px oklch(0.02 0.01 245 / 0.56)',
                },
                fx: {
                    panelTexture: 'asset://texture/panel/noise-03',
                    panelOverlayOpacity: '0.22',
                    glassBlur: '18px',
                },
            }),
        },
        iconAliases: {
            search: 'wrench',
            menu: 'settings2',
        },
        metadata: {
            accentIntent: 'operator',
        },
    },
    atelier: {
        id: 'atelier',
        label: 'Atelier',
        description: 'Pearlescent editorial skin with softer contrast and richer atmosphere.',
        extends: 'classic',
        source: '@loop-kit/ui/skins/defaultUiSkinDefinitions',
        tags: ['editorial', 'glamour', 'demo'],
        themes: {
            light: createThemeDefinition('atelier-light', 'light', defaultLightTheme, {
                colors: {
                    background: 'oklch(0.978 0.012 82)',
                    foreground: 'oklch(0.27 0.028 255)',
                    surface: 'oklch(0.993 0.008 90)',
                    surfaceForeground: 'oklch(0.27 0.028 255)',
                    border: 'oklch(0.88 0.02 88)',
                    accent: 'oklch(0.73 0.16 28)',
                    accentForeground: 'oklch(0.985 0.008 92)',
                    muted: 'oklch(0.94 0.015 84)',
                    mutedForeground: 'oklch(0.46 0.03 255)',
                    danger: 'oklch(0.65 0.19 24)',
                    dangerForeground: 'oklch(0.99 0.01 24)',
                },
                radius: {
                    sm: '0.45rem',
                    md: '0.8rem',
                    lg: '1.25rem',
                    xl: '1.75rem',
                    pill: '999px',
                },
                typography: {
                    familySans: '"Space Grotesk", "Aptos", sans-serif',
                    familyMono: '"IBM Plex Mono", "JetBrains Mono", monospace',
                    sizeSm: '0.79rem',
                    sizeMd: '0.95rem',
                    sizeLg: '1.12rem',
                    weightNormal: '430',
                    weightMedium: '600',
                    weightBold: '720',
                    lineHeight: '1.5',
                },
                elevation: {
                    level1: '0 8px 22px oklch(0.72 0.05 70 / 0.12)',
                    level2: '0 18px 44px oklch(0.56 0.05 38 / 0.18)',
                    level3: '0 28px 70px oklch(0.45 0.04 28 / 0.24)',
                },
                fx: {
                    panelTexture: 'asset://texture/panel/mesh-01',
                    panelOverlayOpacity: '0.1',
                    glassBlur: '22px',
                },
            }),
            dark: createThemeDefinition('atelier-dark', 'dark', defaultDarkTheme, {
                colors: {
                    background: 'oklch(0.2 0.018 252)',
                    foreground: 'oklch(0.94 0.018 90)',
                    surface: 'oklch(0.24 0.018 250)',
                    surfaceForeground: 'oklch(0.95 0.018 90)',
                    border: 'oklch(0.35 0.02 248)',
                    accent: 'oklch(0.78 0.14 30)',
                    accentForeground: 'oklch(0.22 0.018 252)',
                    muted: 'oklch(0.28 0.018 248)',
                    mutedForeground: 'oklch(0.76 0.025 92)',
                    danger: 'oklch(0.69 0.2 24)',
                    dangerForeground: 'oklch(0.21 0.018 252)',
                },
                radius: {
                    sm: '0.45rem',
                    md: '0.8rem',
                    lg: '1.25rem',
                    xl: '1.75rem',
                    pill: '999px',
                },
                typography: {
                    familySans: '"Space Grotesk", "Aptos", sans-serif',
                    familyMono: '"IBM Plex Mono", "JetBrains Mono", monospace',
                    sizeSm: '0.79rem',
                    sizeMd: '0.95rem',
                    sizeLg: '1.12rem',
                    weightNormal: '430',
                    weightMedium: '600',
                    weightBold: '720',
                    lineHeight: '1.5',
                },
                elevation: {
                    level1: '0 10px 24px oklch(0.04 0.01 250 / 0.32)',
                    level2: '0 22px 48px oklch(0.04 0.01 250 / 0.42)',
                    level3: '0 34px 82px oklch(0.04 0.01 250 / 0.52)',
                },
                fx: {
                    panelTexture: 'asset://texture/panel/noise-02',
                    panelOverlayOpacity: '0.16',
                    glassBlur: '24px',
                },
            }),
        },
        metadata: {
            accentIntent: 'editorial',
        },
    },
};

export const defaultUiSkinRegistry = createUiSkinRegistry({
    skins: defaultUiSkinDefinitions,
});

export const defaultUiSkins = defaultUiSkinRegistry.resolved();

export const defaultUiSkin = defaultUiSkins[DEFAULT_UI_SKIN_ID]!;

export function resolveDefaultUiSkin(id: string = DEFAULT_UI_SKIN_ID): ResolvedUiSkin {
    return defaultUiSkins[id] ?? defaultUiSkin;
}
