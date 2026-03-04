import type { Tokens } from './schema';

export const defaultLightTokens: Tokens = {
    colors: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        surface: 'oklch(1 0 0)',
        surfaceForeground: 'oklch(0.145 0 0)',
        border: 'oklch(0.92 0 0)',
        accent: 'oklch(0.205 0 0)',
        accentForeground: 'oklch(0.985 0 0)',
        muted: 'oklch(0.97 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        danger: 'oklch(0.58 0.245 27.3)',
        dangerForeground: 'oklch(0.985 0 0)',
    },
    radius: {
        sm: '0.375rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1rem',
        pill: '999px',
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        xxl: '2rem',
    },
    typography: {
        familySans: '"Segoe UI", "Inter", system-ui, sans-serif',
        familyMono: '"Cascadia Code", "Fira Code", ui-monospace, monospace',
        sizeSm: '0.875rem',
        sizeMd: '1rem',
        sizeLg: '1.25rem',
        weightNormal: '400',
        weightMedium: '500',
        weightBold: '700',
        lineHeight: '1.5',
    },
    elevation: {
        level1: '0 1px 2px color-mix(in oklch, black 12%, transparent)',
        level2: '0 8px 24px color-mix(in oklch, black 18%, transparent)',
        level3: '0 16px 44px color-mix(in oklch, black 24%, transparent)',
    },
    fx: {
        panelTexture: 'asset://texture/panel/noise-01',
        panelOverlayOpacity: '0.2',
        glassBlur: '14px',
    },
};
