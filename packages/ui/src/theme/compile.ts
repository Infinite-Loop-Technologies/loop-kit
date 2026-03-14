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
        '--card': colors.card,
        '--card-foreground': colors.cardForeground,
        '--popover': colors.popover,
        '--popover-foreground': colors.popoverForeground,
        '--primary': colors.primary,
        '--primary-foreground': colors.primaryForeground,
        '--secondary': colors.secondary,
        '--secondary-foreground': colors.secondaryForeground,
        '--muted': colors.muted,
        '--muted-foreground': colors.mutedForeground,
        '--accent': colors.accent,
        '--accent-foreground': colors.accentForeground,
        '--destructive': colors.destructive,
        '--destructive-foreground': colors.destructiveForeground,
        '--border': colors.border,
        '--input': colors.input,
        '--ring': colors.ring,
        '--sidebar': colors.sidebar,
        '--sidebar-foreground': colors.sidebarForeground,
        '--sidebar-accent': colors.sidebarAccent,
        '--sidebar-accent-foreground': colors.sidebarAccentForeground,
        '--sidebar-border': colors.sidebarBorder,
        '--sidebar-ring': colors.sidebarRing,
        '--loop-colors-surface': colors.card,
        '--loop-colors-surfaceForeground': colors.cardForeground,
        '--loop-colors-danger': colors.destructive,
        '--loop-colors-dangerForeground': colors.destructiveForeground,
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
