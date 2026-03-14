import type { Tokens } from './schema';

export type SemanticColorSeed = {
    background: string;
    foreground: string;
    border: string;
    primary: string;
    primaryForeground: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    destructiveForeground: string;
    card?: string;
    cardForeground?: string;
    popover?: string;
    popoverForeground?: string;
    secondary?: string;
    secondaryForeground?: string;
    accent?: string;
    accentForeground?: string;
    input?: string;
    ring?: string;
    sidebar?: string;
    sidebarForeground?: string;
    sidebarAccent?: string;
    sidebarAccentForeground?: string;
    sidebarBorder?: string;
    sidebarRing?: string;
};

export function createSemanticColors(
    seed: SemanticColorSeed,
): Tokens['colors'] {
    const card = seed.card ?? seed.background;
    const cardForeground = seed.cardForeground ?? seed.foreground;
    const secondary = seed.secondary ?? seed.muted;
    const secondaryForeground = seed.secondaryForeground ?? seed.foreground;
    const accent =
        seed.accent ??
        `color-mix(in oklch, ${seed.primary} 12%, ${card})`;
    const accentForeground = seed.accentForeground ?? seed.foreground;
    const sidebar = seed.sidebar ?? `color-mix(in oklch, ${seed.background} 62%, ${card} 38%)`;
    const sidebarForeground = seed.sidebarForeground ?? seed.foreground;

    return {
        background: seed.background,
        foreground: seed.foreground,
        card,
        cardForeground,
        popover: seed.popover ?? card,
        popoverForeground: seed.popoverForeground ?? cardForeground,
        primary: seed.primary,
        primaryForeground: seed.primaryForeground,
        secondary,
        secondaryForeground,
        muted: seed.muted,
        mutedForeground: seed.mutedForeground,
        accent,
        accentForeground,
        destructive: seed.destructive,
        destructiveForeground: seed.destructiveForeground,
        border: seed.border,
        input: seed.input ?? seed.border,
        ring: seed.ring ?? seed.primary,
        sidebar,
        sidebarForeground,
        sidebarAccent:
            seed.sidebarAccent ??
            `color-mix(in oklch, ${accent} 72%, ${sidebar})`,
        sidebarAccentForeground:
            seed.sidebarAccentForeground ?? sidebarForeground,
        sidebarBorder: seed.sidebarBorder ?? seed.border,
        sidebarRing: seed.sidebarRing ?? (seed.ring ?? seed.primary),
    };
}
