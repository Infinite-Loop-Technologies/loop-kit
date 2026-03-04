import { ThemeSchema, type ThemeDefinition } from './schema';

type FlatVars = Record<string, string>;

function flatten(prefix: string, value: unknown, acc: FlatVars): void {
    if (typeof value === 'string') {
        acc[prefix] = value;
        return;
    }

    if (value && typeof value === 'object') {
        for (const [key, next] of Object.entries(value)) {
            flatten(`${prefix}-${key}`, next, acc);
        }
    }
}

function toLegacyVars(theme: ThemeDefinition): FlatVars {
    const { colors, radius } = theme.tokens;
    return {
        '--background': colors.background,
        '--foreground': colors.foreground,
        '--card': colors.surface,
        '--card-foreground': colors.surfaceForeground,
        '--popover': colors.surface,
        '--popover-foreground': colors.surfaceForeground,
        '--primary': colors.accent,
        '--primary-foreground': colors.accentForeground,
        '--secondary': colors.muted,
        '--secondary-foreground': colors.foreground,
        '--muted': colors.muted,
        '--muted-foreground': colors.mutedForeground,
        '--accent': colors.accent,
        '--accent-foreground': colors.accentForeground,
        '--destructive': colors.danger,
        '--destructive-foreground': colors.dangerForeground,
        '--border': colors.border,
        '--input': colors.border,
        '--ring': colors.accent,
        '--radius': radius.md,
    };
}

export function compileThemeToCssVars(input: ThemeDefinition): {
    cssText: string;
    vars: Record<string, string>;
} {
    const theme = ThemeSchema.parse(input);
    const vars: FlatVars = {};
    flatten('--loop', theme.tokens, vars);

    Object.assign(vars, toLegacyVars(theme));

    const lines = Object.keys(vars)
        .sort((a, b) => a.localeCompare(b))
        .map((name) => `  ${name}: ${vars[name]};`);

    return {
        cssText: `:root {\n${lines.join('\n')}\n}`,
        vars,
    };
}
