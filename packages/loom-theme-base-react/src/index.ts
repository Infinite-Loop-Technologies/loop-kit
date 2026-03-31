import { createFallbackTokens, defineRecipe, type LoomTokens } from '@loop-kit/loom-core';
import { defaultLoomImplementationMap, type LoomReactThemeLayer } from '@loop-kit/loom-react';

function toneValue(tokens: LoomTokens, tone: string | undefined) {
    switch (tone) {
        case 'accent':
            return tokens.color.accent;
        case 'success':
            return tokens.color.success;
        case 'warning':
            return tokens.color.warning;
        case 'danger':
            return tokens.color.danger;
        case 'info':
            return tokens.color.info;
        case 'muted':
            return tokens.color.textMuted;
        default:
            return tokens.color.text;
    }
}

function kindValue(tokens: LoomTokens, tone: string | undefined, kind: string | undefined) {
    const accent = tone === 'neutral' || !tone ? tokens.color.accent : toneValue(tokens, tone);
    if (kind === 'ghost') {
        return {
            background: 'transparent',
            borderColor: 'transparent',
            color: accent,
        };
    }
    if (kind === 'outline') {
        return {
            background: 'transparent',
            borderColor: accent,
            color: accent,
        };
    }
    if (kind === 'soft') {
        return {
            background: tokens.color.surfaceSunken,
            borderColor: tokens.color.border,
            color: toneValue(tokens, tone),
        };
    }
    return {
        background: accent,
        borderColor: accent,
        color: tokens.color.accentText,
    };
}

export const baseReactTheme: LoomReactThemeLayer = {
    id: 'loom-base',
    label: 'Loom Base',
    description:
        'Base theme layer with the standard semantic token surface, default recipes, and default primitive implementations.',
    modes: {
        light: {
            tokens: createFallbackTokens(),
        },
        dark: {
            tokens: {
                color: {
                    text: 'oklch(0.93 0.01 255)',
                    textMuted: 'oklch(0.72 0.02 255)',
                    textInverse: 'oklch(0.16 0.01 255)',
                    surface: 'oklch(0.19 0.008 255)',
                    surfaceRaised: 'oklch(0.23 0.008 255)',
                    surfaceSunken: 'oklch(0.16 0.008 255)',
                    surfaceOverlay: 'oklch(0.28 0.01 255 / 0.86)',
                    border: 'oklch(0.32 0.01 255)',
                    borderStrong: 'oklch(0.48 0.02 255)',
                    accent: 'oklch(0.72 0.15 235)',
                    accentText: 'oklch(0.17 0.01 255)',
                    success: 'oklch(0.74 0.13 150)',
                    warning: 'oklch(0.82 0.16 80)',
                    danger: 'oklch(0.72 0.18 28)',
                    info: 'oklch(0.76 0.11 230)',
                    focusRing: 'oklch(0.76 0.14 235)',
                },
                shadow: {
                    sm: '0 1px 2px rgb(2 6 23 / 0.3)',
                    md: '0 14px 36px rgb(2 6 23 / 0.42)',
                    lg: '0 24px 68px rgb(2 6 23 / 0.52)',
                },
            },
        },
    },
    implementations: defaultLoomImplementationMap,
    recipes: {
        box: defineRecipe(() => ({
            root: {},
        })),
        surface: defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    background:
                        variants.emphasis === 'strong'
                            ? tokens.color.surfaceRaised
                            : tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    color: toneValue(tokens, variants.tone),
                    boxShadow: tokens.shadow.sm,
                },
            },
        })),
        panel: defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    background:
                        variants.emphasis === 'strong'
                            ? tokens.color.surfaceRaised
                            : variants.emphasis === 'subtle'
                              ? tokens.color.surfaceSunken
                              : tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.lg,
                    boxShadow: tokens.shadow.md,
                    color: tokens.color.text,
                    padding:
                        variants.density === 'compact'
                            ? tokens.space[3]
                            : variants.density === 'roomy'
                              ? tokens.space[5]
                              : tokens.space[4],
                },
            },
        })),
        'scroll-area': defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    background: tokens.color.surfaceSunken,
                    borderRadius: tokens.radius.md,
                },
            },
        })),
        separator: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    background: tokens.color.border,
                },
            },
        })),
        stack: defineRecipe(() => ({ root: {} })),
        inline: defineRecipe(() => ({ root: {} })),
        grid: defineRecipe(() => ({ root: {} })),
        text: defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    color: toneValue(tokens, variants.tone),
                    fontSize:
                        variants.size === 'sm'
                            ? tokens.font.sizeSm
                            : variants.size === 'lg'
                              ? tokens.font.sizeLg
                              : variants.size === 'xl'
                                ? tokens.font.sizeXl
                                : tokens.font.sizeMd,
                    fontWeight: variants.emphasis === 'strong' ? 650 : 430,
                    lineHeight: 1.6,
                    margin: 0,
                },
            },
        })),
        heading: defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    color: toneValue(tokens, variants.tone),
                    fontFamily: tokens.font.headingFamily,
                    fontSize:
                        variants.size === 'sm'
                            ? tokens.font.sizeMd
                            : variants.size === 'md'
                              ? tokens.font.sizeLg
                              : variants.size === 'xl'
                                ? 'clamp(2rem, 4vw, 3.5rem)'
                                : tokens.font.sizeXl,
                    fontWeight: 650,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.05,
                    margin: 0,
                },
            },
        })),
        link: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    color: tokens.color.accent,
                    textDecoration: 'underline',
                    textDecorationThickness: '0.12em',
                },
            },
        })),
        code: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    background: tokens.color.surfaceSunken,
                    borderRadius: tokens.radius.sm,
                    color: tokens.color.text,
                    fontFamily: tokens.font.monoFamily,
                    padding: `${tokens.space[1]} ${tokens.space[2]}`,
                },
            },
        })),
        button: defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    ...kindValue(tokens, variants.tone, variants.kind),
                    alignItems: 'center',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderRadius: tokens.radius.md,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    fontFamily: tokens.font.bodyFamily,
                    fontSize:
                        variants.size === 'sm'
                            ? tokens.font.sizeSm
                            : variants.size === 'lg'
                              ? tokens.font.sizeLg
                              : tokens.font.sizeMd,
                    fontWeight: 600,
                    gap: tokens.space[2],
                    justifyContent: 'center',
                    minHeight:
                        variants.size === 'sm'
                            ? '2rem'
                            : variants.size === 'lg'
                              ? '3rem'
                              : '2.5rem',
                    padding:
                        variants.size === 'sm'
                            ? `0 ${tokens.space[3]}`
                            : variants.size === 'lg'
                              ? `0 ${tokens.space[5]}`
                              : `0 ${tokens.space[4]}`,
                    transition: `transform ${tokens.motion.fast} ease, background ${tokens.motion.fast} ease`,
                },
            },
        })),
        'icon-button': defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    ...kindValue(tokens, variants.tone, variants.kind),
                    alignItems: 'center',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderRadius: tokens.radius.md,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    height:
                        variants.size === 'sm'
                            ? '2rem'
                            : variants.size === 'lg'
                              ? '3rem'
                              : '2.5rem',
                    justifyContent: 'center',
                    width:
                        variants.size === 'sm'
                            ? '2rem'
                            : variants.size === 'lg'
                              ? '3rem'
                              : '2.5rem',
                },
            },
        })),
        input: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    background: tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    display: 'flex',
                    gap: tokens.space[2],
                    padding: `${tokens.space[2]} ${tokens.space[3]}`,
                },
            },
            field: {
                style: {
                    background: 'transparent',
                    border: 'none',
                    color: tokens.color.text,
                    flex: 1,
                    fontFamily: tokens.font.bodyFamily,
                    fontSize: tokens.font.sizeMd,
                    outline: 'none',
                },
            },
        })),
        'text-area': defineRecipe(({ tokens }) => ({
            field: {
                style: {
                    background: tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text,
                    fontFamily: tokens.font.bodyFamily,
                    fontSize: tokens.font.sizeMd,
                    minHeight: '7rem',
                    padding: tokens.space[3],
                },
            },
        })),
        checkbox: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    color: tokens.color.text,
                    display: 'inline-flex',
                    gap: tokens.space[2],
                },
            },
            control: {
                style: {
                    accentColor: tokens.color.accent,
                },
            },
        })),
        switch: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    display: 'inline-flex',
                    gap: tokens.space[2],
                },
            },
            track: {
                style: {
                    background: tokens.color.surfaceSunken,
                    borderRadius: '999px',
                    height: '1.5rem',
                    padding: '0.125rem',
                    width: '2.75rem',
                },
            },
            thumb: {
                style: {
                    background: tokens.color.accent,
                    borderRadius: '999px',
                    boxShadow: tokens.shadow.sm,
                    display: 'block',
                    height: '1.25rem',
                    width: '1.25rem',
                },
            },
        })),
        select: defineRecipe(({ tokens }) => ({
            trigger: {
                style: {
                    background: tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text,
                    fontFamily: tokens.font.bodyFamily,
                    fontSize: tokens.font.sizeMd,
                    minHeight: '2.5rem',
                    padding: `0 ${tokens.space[3]}`,
                },
            },
        })),
        badge: defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    background: variants.kind === 'outline' ? 'transparent' : tokens.color.surfaceSunken,
                    border: `1px solid ${variants.kind === 'outline' ? toneValue(tokens, variants.tone) : tokens.color.border}`,
                    borderRadius: '999px',
                    color: toneValue(tokens, variants.tone),
                    display: 'inline-flex',
                    fontSize: tokens.font.sizeSm,
                    fontWeight: 600,
                    padding: `${tokens.space[1]} ${tokens.space[2]}`,
                },
            },
        })),
        dialog: defineRecipe(({ tokens }) => ({
            overlay: {
                style: {
                    backdropFilter: 'blur(10px)',
                    background: 'rgb(15 23 42 / 0.42)',
                    inset: 0,
                    position: 'fixed',
                },
            },
            content: {
                style: {
                    background: tokens.color.surfaceRaised,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.lg,
                    boxShadow: tokens.shadow.lg,
                    left: '50%',
                    maxWidth: '36rem',
                    padding: tokens.space[4],
                    position: 'fixed',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(calc(100vw - 2rem), 36rem)',
                },
            },
            body: {
                style: {
                    marginTop: tokens.space[3],
                },
            },
            footer: {
                style: {
                    marginTop: tokens.space[4],
                },
            },
        })),
        menu: defineRecipe(({ tokens }) => ({
            content: {
                style: {
                    background: tokens.color.surfaceRaised,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    boxShadow: tokens.shadow.md,
                    padding: tokens.space[2],
                },
            },
            item: {
                style: {
                    borderRadius: tokens.radius.sm,
                    cursor: 'pointer',
                    display: 'block',
                    padding: `${tokens.space[2]} ${tokens.space[3]}`,
                },
            },
        })),
        tabs: defineRecipe(({ tokens }) => ({
            list: {
                style: {
                    display: 'inline-flex',
                    gap: tokens.space[2],
                    marginBottom: tokens.space[3],
                },
            },
            trigger: {
                style: {
                    background: tokens.color.surfaceSunken,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text,
                    cursor: 'pointer',
                    padding: `${tokens.space[2]} ${tokens.space[3]}`,
                },
            },
            content: {
                style: {
                    background: tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.md,
                    padding: tokens.space[4],
                },
            },
        })),
        table: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    borderCollapse: 'collapse',
                    width: '100%',
                },
            },
            head: {
                style: {
                    background: tokens.color.surfaceSunken,
                },
            },
            cell: {
                style: {
                    borderBottom: `1px solid ${tokens.color.border}`,
                    padding: `${tokens.space[2]} ${tokens.space[3]}`,
                    textAlign: 'left',
                },
            },
        })),
    },
};
