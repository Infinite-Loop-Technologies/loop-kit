import { z } from 'zod';

export const ColorModeSchema = z.enum(['light', 'dark']);

export const LoomColorTokensSchema = z.object({
    text: z.string(),
    textMuted: z.string(),
    textInverse: z.string(),
    surface: z.string(),
    surfaceRaised: z.string(),
    surfaceSunken: z.string(),
    surfaceOverlay: z.string(),
    border: z.string(),
    borderStrong: z.string(),
    accent: z.string(),
    accentText: z.string(),
    success: z.string(),
    warning: z.string(),
    danger: z.string(),
    info: z.string(),
    focusRing: z.string(),
});

export const LoomSpaceTokensSchema = z.object({
    0: z.string(),
    1: z.string(),
    2: z.string(),
    3: z.string(),
    4: z.string(),
    5: z.string(),
    6: z.string(),
});

export const LoomRadiusTokensSchema = z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
});

export const LoomFontTokensSchema = z.object({
    bodyFamily: z.string(),
    headingFamily: z.string(),
    monoFamily: z.string(),
    sizeSm: z.string(),
    sizeMd: z.string(),
    sizeLg: z.string(),
    sizeXl: z.string(),
});

export const LoomShadowTokensSchema = z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
});

export const LoomMotionTokensSchema = z.object({
    fast: z.string(),
    normal: z.string(),
    slow: z.string(),
});

export const LoomTokensSchema = z.object({
    color: LoomColorTokensSchema,
    space: LoomSpaceTokensSchema,
    radius: LoomRadiusTokensSchema,
    font: LoomFontTokensSchema,
    shadow: LoomShadowTokensSchema,
    motion: LoomMotionTokensSchema,
});

export type ColorMode = z.infer<typeof ColorModeSchema>;
export type LoomTokens = z.infer<typeof LoomTokensSchema>;

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends Record<string | number | symbol, unknown>
        ? DeepPartial<T[K]>
        : T[K];
};

export type LoomTokenPatch = DeepPartial<LoomTokens>;

export function createFallbackTokens(): LoomTokens {
    return {
        color: {
            text: 'oklch(0.23 0.02 255)',
            textMuted: 'oklch(0.5 0.02 255)',
            textInverse: 'oklch(0.98 0.004 255)',
            surface: 'oklch(0.985 0.003 255)',
            surfaceRaised: 'oklch(0.995 0.002 255)',
            surfaceSunken: 'oklch(0.94 0.005 255)',
            surfaceOverlay: 'oklch(0.92 0.01 255 / 0.84)',
            border: 'oklch(0.86 0.01 255)',
            borderStrong: 'oklch(0.7 0.02 255)',
            accent: 'oklch(0.62 0.15 235)',
            accentText: 'oklch(0.98 0.004 255)',
            success: 'oklch(0.68 0.14 150)',
            warning: 'oklch(0.78 0.16 80)',
            danger: 'oklch(0.67 0.18 28)',
            info: 'oklch(0.72 0.12 230)',
            focusRing: 'oklch(0.74 0.15 235)',
        },
        space: {
            0: '0rem',
            1: '0.25rem',
            2: '0.5rem',
            3: '0.75rem',
            4: '1rem',
            5: '1.5rem',
            6: '2rem',
        },
        radius: {
            sm: '0.375rem',
            md: '0.75rem',
            lg: '1rem',
        },
        font: {
            bodyFamily: '"Aptos", system-ui, sans-serif',
            headingFamily: '"Fraunces", "Aptos Display", serif',
            monoFamily: '"JetBrains Mono", monospace',
            sizeSm: '0.875rem',
            sizeMd: '1rem',
            sizeLg: '1.125rem',
            sizeXl: '1.5rem',
        },
        shadow: {
            sm: '0 1px 2px rgb(15 23 42 / 0.08)',
            md: '0 12px 30px rgb(15 23 42 / 0.12)',
            lg: '0 20px 60px rgb(15 23 42 / 0.16)',
        },
        motion: {
            fast: '120ms',
            normal: '180ms',
            slow: '280ms',
        },
    };
}

export function mergeTokens(base: LoomTokens, patch?: LoomTokenPatch | null): LoomTokens {
    if (!patch) {
        return structuredClone(base);
    }

    return LoomTokensSchema.parse({
        color: {
            ...base.color,
            ...(patch.color ?? {}),
        },
        space: {
            ...base.space,
            ...(patch.space ?? {}),
        },
        radius: {
            ...base.radius,
            ...(patch.radius ?? {}),
        },
        font: {
            ...base.font,
            ...(patch.font ?? {}),
        },
        shadow: {
            ...base.shadow,
            ...(patch.shadow ?? {}),
        },
        motion: {
            ...base.motion,
            ...(patch.motion ?? {}),
        },
    });
}

export function tokensToCssVariables(tokens: LoomTokens): Record<`--${string}`, string> {
    const entries: Array<[`--${string}`, string]> = [];

    for (const [groupKey, groupValue] of Object.entries(tokens) as Array<[keyof LoomTokens, Record<string, string>]>) {
        for (const [key, value] of Object.entries(groupValue)) {
            entries.push([`--loom-${String(groupKey)}-${key}`, value]);
        }
    }

    return Object.fromEntries(entries) as Record<`--${string}`, string>;
}
