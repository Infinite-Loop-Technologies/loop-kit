import { ThemeSchema, type ThemeDefinition, type ThemeMode } from '../../theme';
import {
    ResolvedUiSkinSchema,
    UiSkinDefinitionSchema,
    defaultUiSkins,
    resolveUiSkin,
    type ResolvedUiSkin,
} from '../../skins';
import { TokenSchema } from '../../tokens';
import type { DesignTokenEntry } from '../token-editor';

export type DockSkinMap = Record<string, ResolvedUiSkin>;

export function createDockSkins(): DockSkinMap {
    return structuredClone(defaultUiSkins) as DockSkinMap;
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

export function setSkinTokenValue(
    skin: ResolvedUiSkin,
    mode: ThemeMode,
    path: string,
    value: string,
): ResolvedUiSkin | null {
    const activeTheme = mode === 'dark' ? skin.themes.dark : skin.themes.light;
    const updatedTheme = setThemeTokenValue(activeTheme, path, value);
    if (!updatedTheme) {
        return null;
    }

    return ResolvedUiSkinSchema.parse({
        ...skin,
        themes: {
            ...skin.themes,
            [mode]: updatedTheme,
        },
    });
}

export function validateUiSkinEntry(
    skin: ResolvedUiSkin,
    mode: ThemeMode,
): string | null {
    const theme = mode === 'dark' ? skin.themes.dark : skin.themes.light;
    const tokens = TokenSchema.safeParse(theme.tokens);
    if (!tokens.success) {
        return tokens.error.issues[0]?.message ?? 'Token schema validation failed.';
    }

    const validatedTheme = ThemeSchema.safeParse(theme);
    if (!validatedTheme.success) {
        return validatedTheme.error.issues[0]?.message ?? 'Theme schema validation failed.';
    }

    const validatedSkin = ResolvedUiSkinSchema.safeParse(skin);
    if (!validatedSkin.success) {
        return validatedSkin.error.issues[0]?.message ?? 'Skin schema validation failed.';
    }

    return null;
}

export function serializeUiSkin(skin: ResolvedUiSkin): string {
    return JSON.stringify(ResolvedUiSkinSchema.parse(skin), null, 2);
}

export function parseUiSkinDraft(
    input: string,
    registry: DockSkinMap,
): ResolvedUiSkin {
    const raw = JSON.parse(input) as unknown;
    const parsed = UiSkinDefinitionSchema.parse(raw);

    return resolveUiSkin(parsed, {
        ...registry,
        [parsed.id]: parsed,
    });
}
