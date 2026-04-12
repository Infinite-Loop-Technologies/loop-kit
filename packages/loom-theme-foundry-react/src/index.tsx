import type { LoomReactThemeLayer } from '@loop-kit/loom-react';

function foundryPanelBackground(emphasis: string | undefined) {
    if (emphasis === 'strong') {
        return 'linear-gradient(180deg, rgba(28, 28, 30, 0.98) 0%, rgba(22, 22, 23, 0.98) 100%)';
    }
    if (emphasis === 'subtle') {
        return 'rgba(21, 21, 23, 0.94)';
    }
    return 'rgba(22, 22, 23, 0.96)';
}

function badgeStyles(tone: string | undefined, kind: string | undefined) {
    if (tone === 'accent') {
        return {
            background: 'rgba(167, 139, 250, 0.12)',
            borderColor: 'rgba(167, 139, 250, 0.18)',
            color: '#c4b5fd',
        };
    }

    if (tone === 'info') {
        return {
            background: 'rgba(108, 192, 255, 0.1)',
            borderColor: 'rgba(108, 192, 255, 0.2)',
            color: '#89d2ff',
        };
    }

    if (tone === 'success') {
        return {
            background: 'rgba(40, 192, 139, 0.12)',
            borderColor: 'rgba(40, 192, 139, 0.22)',
            color: '#7de0b7',
        };
    }

    if (kind === 'outline') {
        return {
            background: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            color: '#d0d4db',
        };
    }

    return {
        background: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        color: '#c9ccd2',
    };
}

export const foundryReactTheme: LoomReactThemeLayer = {
    id: 'loom-foundry',
    label: 'Foundry',
    description: 'Dense dark control-plane theme with crisp borders and restrained blue accents.',
    modes: {
        light: {
            tokens: {
                color: {
                    accent: {
                        default: '#2d7ff9',
                        text: '#f8fbff',
                    },
                    border: {
                        default: 'rgba(17, 24, 39, 0.1)',
                        strong: 'rgba(17, 24, 39, 0.18)',
                        focus: '#2d7ff9',
                    },
                    surface: {
                        default: '#fcfcfd',
                        raised: '#ffffff',
                        sunken: '#f4f5f7',
                        overlay: 'rgba(252, 252, 253, 0.92)',
                    },
                    text: {
                        default: '#111418',
                        muted: '#667085',
                        inverse: '#f8fbff',
                    },
                },
                font: {
                    family: {
                        body: 'var(--font-forge-sans), system-ui, sans-serif',
                        heading: 'var(--font-forge-sans), system-ui, sans-serif',
                        mono: 'var(--font-forge-mono), monospace',
                    },
                },
                radius: {
                    sm: '4px',
                    md: '6px',
                    lg: '8px',
                },
                shadow: {
                    sm: '0 1px 2px rgba(17, 24, 39, 0.05)',
                    md: '0 12px 32px rgba(17, 24, 39, 0.08)',
                    lg: '0 24px 60px rgba(17, 24, 39, 0.12)',
                },
            },
        },
        dark: {
            tokens: {
                color: {
                    accent: {
                        default: '#6cc0ff',
                        text: '#0b1b23',
                    },
                    border: {
                        default: 'rgba(255, 255, 255, 0.08)',
                        strong: 'rgba(255, 255, 255, 0.14)',
                        focus: '#6cc0ff',
                    },
                    surface: {
                        default: '#161617',
                        raised: '#1c1c1e',
                        sunken: '#111214',
                        overlay: 'rgba(22, 22, 23, 0.95)',
                    },
                    text: {
                        default: '#e6e6e6',
                        muted: '#9a9a9a',
                        inverse: '#0f1115',
                    },
                    status: {
                        success: '#28c08b',
                        warning: '#ffb86b',
                        danger: '#ff6b6b',
                        info: '#6cc0ff',
                    },
                },
                font: {
                    family: {
                        body: 'var(--font-forge-sans), system-ui, sans-serif',
                        heading: 'var(--font-forge-sans), system-ui, sans-serif',
                        mono: 'var(--font-forge-mono), monospace',
                    },
                    size: {
                        sm: '0.8125rem',
                        md: '0.875rem',
                        lg: '1rem',
                        xl: '1.5rem',
                    },
                },
                radius: {
                    sm: '4px',
                    md: '6px',
                    lg: '8px',
                },
                shadow: {
                    sm: '0 1px 2px rgba(0, 0, 0, 0.16)',
                    md: '0 18px 40px rgba(0, 0, 0, 0.28)',
                    lg: '0 32px 72px rgba(0, 0, 0, 0.45)',
                },
            },
        },
    },
    recipes: {
        surface: ({ tokens, variants }) => ({
            root: {
                style: {
                    background:
                        variants.emphasis === 'strong'
                            ? tokens.color.surface.raised
                            : tokens.color.surface.default,
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.md,
                    boxShadow: variants.emphasis === 'strong' ? tokens.shadow.md : 'none',
                    color: tokens.color.text.default,
                },
            },
        }),
        panel: ({ tokens, variants }) => ({
            root: {
                style: {
                    background: foundryPanelBackground(variants.emphasis),
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.lg,
                    boxShadow: variants.emphasis === 'strong' ? tokens.shadow.lg : tokens.shadow.sm,
                    color: tokens.color.text.default,
                    padding:
                        variants.density === 'compact'
                            ? tokens.space[3]
                            : variants.density === 'roomy'
                              ? tokens.space[5]
                              : tokens.space[4],
                },
            },
        }),
        toolbar: ({ tokens, variants }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    background:
                        variants.emphasis === 'subtle'
                            ? 'rgba(255, 255, 255, 0.035)'
                            : 'transparent',
                    border: `1px solid ${
                        variants.emphasis === 'subtle'
                            ? tokens.color.border.default
                            : 'transparent'
                    }`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text.default,
                    display: 'flex',
                    gap: variants.density === 'compact' ? tokens.space[2] : tokens.space[3],
                    minHeight: variants.density === 'compact' ? '2rem' : '2.5rem',
                    padding: variants.density === 'compact' ? `0 ${tokens.space[2]}` : `0 ${tokens.space[3]}`,
                },
            },
        }),
        breadcrumbs: ({ tokens }) => ({
            root: {
                style: {
                    color: tokens.color.text.muted,
                },
            },
            list: {
                style: {
                    alignItems: 'center',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: tokens.space[2],
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                },
            },
            item: {
                style: {
                    alignItems: 'center',
                    display: 'inline-flex',
                    gap: tokens.space[2],
                },
            },
            separator: {
                style: {
                    color: tokens.color.text.muted,
                    display: 'inline-flex',
                },
            },
            link: {
                style: {
                    color: tokens.color.text.muted,
                    textDecoration: 'none',
                },
            },
            current: {
                style: {
                    color: tokens.color.text.default,
                    fontWeight: 600,
                },
            },
        }),
        avatar: ({ tokens, variants }) => {
            const size =
                variants.size === 'sm'
                    ? '1.25rem'
                    : variants.size === 'lg'
                      ? '2.25rem'
                      : '1.75rem';
            return {
                root: {
                    style: {
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: `1px solid ${tokens.color.border.default}`,
                        borderRadius: '999px',
                        color: tokens.color.text.default,
                        display: 'inline-flex',
                        height: size,
                        justifyContent: 'center',
                        overflow: 'hidden',
                        width: size,
                    },
                },
                image: {
                    style: {
                        display: 'block',
                        height: '100%',
                        objectFit: 'cover',
                        width: '100%',
                    },
                },
                fallback: {
                    style: {
                        fontSize: variants.size === 'sm' ? '0.6875rem' : '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                    },
                },
            };
        },
        kbd: ({ tokens }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    background: 'rgba(17, 18, 20, 0.95)',
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.sm,
                    boxShadow: `inset 0 -1px 0 ${tokens.color.border.strong}`,
                    color: tokens.color.text.muted,
                    display: 'inline-flex',
                    fontFamily: tokens.font.family.mono,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    lineHeight: 1,
                    minHeight: '1.375rem',
                    padding: `0 ${tokens.space[2]}`,
                },
            },
        }),
        heading: ({ tokens, variants }) => ({
            root: {
                style: {
                    color: tokens.color.text.default,
                    fontFamily: tokens.font.family.heading,
                    fontSize:
                        variants.size === 'sm'
                            ? '1rem'
                            : variants.size === 'md'
                              ? '1.125rem'
                              : variants.size === 'xl'
                                ? '2rem'
                                : '1.375rem',
                    fontWeight: 600,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    margin: 0,
                },
            },
        }),
        text: ({ tokens, variants }) => ({
            root: {
                style: {
                    color:
                        variants.tone === 'muted'
                            ? tokens.color.text.muted
                            : tokens.color.text.default,
                    fontSize:
                        variants.size === 'sm'
                            ? '0.8125rem'
                            : variants.size === 'lg'
                              ? '1rem'
                              : variants.size === 'xl'
                                ? '1.125rem'
                                : '0.875rem',
                    fontWeight: variants.emphasis === 'strong' ? 600 : 450,
                    lineHeight: 1.55,
                    margin: 0,
                },
            },
        }),
        link: ({ tokens }) => ({
            root: {
                style: {
                    color: tokens.color.text.default,
                    textDecoration: 'none',
                },
            },
        }),
        button: ({ tokens, variants }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    background:
                        variants.kind === 'ghost'
                            ? 'transparent'
                            : variants.kind === 'outline'
                              ? 'transparent'
                              : variants.kind === 'soft'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : tokens.color.text.default,
                    border: `1px solid ${
                        variants.kind === 'outline'
                            ? tokens.color.border.strong
                            : variants.kind === 'solid'
                              ? 'transparent'
                              : tokens.color.border.default
                    }`,
                    borderRadius: tokens.radius.md,
                    color:
                        variants.kind === 'solid'
                            ? tokens.color.text.inverse
                            : variants.tone === 'muted'
                              ? tokens.color.text.muted
                              : tokens.color.text.default,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    fontSize: variants.size === 'sm' ? '0.8125rem' : '0.875rem',
                    fontWeight: 500,
                    gap: tokens.space[2],
                    justifyContent: 'flex-start',
                    minHeight: variants.size === 'sm' ? '2rem' : '2.375rem',
                    padding:
                        variants.size === 'sm'
                            ? `0 ${tokens.space[2]}`
                            : `0 ${tokens.space[3]}`,
                    transition: `background ${tokens.motion.duration.fast} ease, border-color ${tokens.motion.duration.fast} ease, color ${tokens.motion.duration.fast} ease`,
                },
            },
        }),
        'icon-button': ({ tokens, variants }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    background:
                        variants.kind === 'ghost' ? 'transparent' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${
                        variants.kind === 'ghost'
                            ? 'transparent'
                            : tokens.color.border.default
                    }`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text.muted,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    height: variants.size === 'sm' ? '2rem' : '2.25rem',
                    justifyContent: 'center',
                    width: variants.size === 'sm' ? '2rem' : '2.25rem',
                },
            },
        }),
        input: ({ tokens }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text.default,
                    display: 'flex',
                    gap: tokens.space[2],
                    minHeight: '2.375rem',
                    padding: `0 ${tokens.space[3]}`,
                },
            },
            field: {
                style: {
                    background: 'transparent',
                    border: 'none',
                    color: tokens.color.text.default,
                    flex: 1,
                    fontFamily: tokens.font.family.body,
                    fontSize: tokens.font.size.md,
                    outline: 'none',
                },
            },
        }),
        badge: ({ variants }) => ({
            root: {
                style: {
                    ...badgeStyles(variants.tone, variants.kind),
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    lineHeight: 1,
                    padding: '0.25rem 0.5rem',
                },
            },
        }),
        table: ({ tokens }) => ({
            root: {
                style: {
                    borderCollapse: 'collapse',
                    width: '100%',
                },
            },
            head: {
                style: {
                    background: 'rgba(255, 255, 255, 0.03)',
                },
            },
            cell: {
                style: {
                    borderBottom: `1px solid ${tokens.color.border.default}`,
                    color: tokens.color.text.default,
                    fontSize: '0.8125rem',
                    padding: '0.625rem 0.75rem',
                    textAlign: 'left',
                },
            },
        }),
    },
};
