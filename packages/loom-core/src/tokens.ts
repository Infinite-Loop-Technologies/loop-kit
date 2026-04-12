import { z } from 'zod';

export const ColorModeSchema = z.enum(['light', 'dark']);

export const LoomColorTokensSchema = z.object({
    text: z.object({
        default: z.string(),
        muted: z.string(),
        inverse: z.string(),
    }),
    surface: z.object({
        default: z.string(),
        raised: z.string(),
        sunken: z.string(),
        overlay: z.string(),
    }),
    border: z.object({
        default: z.string(),
        strong: z.string(),
        focus: z.string(),
    }),
    accent: z.object({
        default: z.string(),
        text: z.string(),
    }),
    status: z.object({
        success: z.string(),
        warning: z.string(),
        danger: z.string(),
        info: z.string(),
    }),
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
    family: z.object({
        body: z.string(),
        heading: z.string(),
        mono: z.string(),
    }),
    size: z.object({
        sm: z.string(),
        md: z.string(),
        lg: z.string(),
        xl: z.string(),
    }),
});

export const LoomShadowTokensSchema = z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
});

export const LoomMotionTokensSchema = z.object({
    duration: z.object({
        fast: z.string(),
        normal: z.string(),
        slow: z.string(),
    }),
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function mergeDeep<T extends Record<string, unknown>>(
    base: T,
    patch?: DeepPartial<T> | null,
): T {
    if (!patch) {
        return structuredClone(base);
    }

    const next: Record<string, unknown> = structuredClone(base);

    for (const [key, patchValue] of Object.entries(patch)) {
        if (patchValue === undefined) {
            continue;
        }

        const baseValue = next[key];
        if (isPlainObject(baseValue) && isPlainObject(patchValue)) {
            next[key] = mergeDeep(baseValue, patchValue);
            continue;
        }

        next[key] = patchValue;
    }

    return next as T;
}

export function mergeTokens(base: LoomTokens, patch?: LoomTokenPatch | null): LoomTokens {
    return LoomTokensSchema.parse(mergeDeep(base, patch));
}

export function composeTokens(
    ...layers: ReadonlyArray<LoomTokenPatch | LoomTokens | null | undefined>
): LoomTokens {
    let next: Record<string, unknown> = {};

    for (const layer of layers) {
        if (!layer) {
            continue;
        }
        next = mergeDeep(next, layer as DeepPartial<Record<string, unknown>>);
    }

    return LoomTokensSchema.parse(next);
}

function flattenTokenEntries(
    value: Record<string, unknown>,
    path: string[],
    entries: Array<[`--${string}`, string]>,
) {
    for (const [key, nested] of Object.entries(value)) {
        const nextPath = [...path, key];
        if (isPlainObject(nested)) {
            flattenTokenEntries(nested, nextPath, entries);
            continue;
        }
        if (nested === undefined || nested === null) {
            continue;
        }
        entries.push([`--loom-${nextPath.join('-')}`, String(nested)]);
    }
}

export function tokensToCssVariables(tokens: LoomTokens): Record<`--${string}`, string> {
    const entries: Array<[`--${string}`, string]> = [];
    flattenTokenEntries(tokens as Record<string, unknown>, [], entries);
    return Object.fromEntries(entries) as Record<`--${string}`, string>;
}
