import type { LoomReactThemeLayer } from '@loop-kit/loom-react';

function forgeBadgeStyles(tone: string | undefined, kind: string | undefined) {
    if (tone === 'accent') {
        return {
            background: 'rgba(116, 94, 181, 0.24)',
            borderColor: 'rgba(116, 94, 181, 0.34)',
            color: '#ddd5ff',
        };
    }

    if (tone === 'info') {
        return {
            background: 'rgba(108, 192, 255, 0.12)',
            borderColor: 'rgba(108, 192, 255, 0.2)',
            color: '#b8e2ff',
        };
    }

    if (tone === 'success') {
        return {
            background: 'rgba(40, 192, 139, 0.16)',
            borderColor: 'rgba(40, 192, 139, 0.26)',
            color: '#b6f4dc',
        };
    }

    if (kind === 'outline') {
        return {
            background: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: '#d8d8d8',
        };
    }

    return {
        background: '#202226',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        color: '#d8d8d8',
    };
}

export const forgeReactTheme: LoomReactThemeLayer = {
    id: 'forge-workspace',
    label: 'Forge Workspace',
    description: 'Design-matched workspace theme for the Forge dock demo.',
    modes: {
        light: {
            tokens: {
                color: {
                    accent: {
                        default: '#6cc0ff',
                        text: '#0b1b23',
                    },
                    border: {
                        default: 'rgba(17, 24, 39, 0.1)',
                        strong: 'rgba(17, 24, 39, 0.16)',
                        focus: '#6cc0ff',
                    },
                    surface: {
                        default: '#f6f7f9',
                        raised: '#ffffff',
                        sunken: '#eef1f5',
                        overlay: 'rgba(255, 255, 255, 0.92)',
                    },
                    text: {
                        default: '#101114',
                        muted: '#5f6673',
                        inverse: '#ffffff',
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
                        default: 'rgba(0, 0, 0, 0.15)',
                        strong: 'rgba(255, 255, 255, 0.08)',
                        focus: '#6cc0ff',
                    },
                    surface: {
                        default: '#151517',
                        raised: '#161617',
                        sunken: '#141416',
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
                        xl: '2.125rem',
                    },
                },
                radius: {
                    sm: '4px',
                    md: '6px',
                    lg: '8px',
                },
                shadow: {
                    sm: '0 1px 2px rgba(0, 0, 0, 0.14)',
                    md: '0 18px 40px rgba(0, 0, 0, 0.3)',
                    lg: '0 24px 60px rgba(0, 0, 0, 0.55)',
                },
            },
        },
    },
    recipes: {
        surface: ({ tokens, variants }) => ({
            root: {
                style: {
                    background:
                        variants.emphasis === 'subtle'
                            ? '#141416'
                            : tokens.color.surface.raised,
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text.default,
                },
            },
        }),
        panel: ({ tokens, variants }) => ({
            root: {
                style: {
                    background:
                        variants.emphasis === 'strong'
                            ? tokens.color.surface.raised
                            : tokens.color.surface.default,
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.lg,
                    boxShadow: variants.emphasis === 'strong' ? tokens.shadow?.md : 'none',
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
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 0,
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
                        background: '#202226',
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
                    },
                },
            };
        },
        kbd: ({ tokens }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    background: '#141416',
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.sm,
                    color: tokens.color.text.muted,
                    display: 'inline-flex',
                    fontFamily: tokens.font.family.mono,
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    lineHeight: 1,
                    minHeight: '1.25rem',
                    padding: '0 0.375rem',
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
                                ? '2.125rem'
                                : '1.375rem',
                    fontWeight: 600,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.08,
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
                    fontWeight: variants.emphasis === 'strong' ? 600 : 400,
                    lineHeight: 1.5,
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
                        variants.kind === 'soft'
                            ? '#202226'
                            : variants.kind === 'solid'
                              ? tokens.color.accent.default
                              : 'transparent',
                    border: `1px solid ${
                        variants.kind === 'outline'
                            ? tokens.color.border.default
                            : variants.kind === 'soft'
                              ? tokens.color.border.default
                              : 'transparent'
                    }`,
                    borderRadius: tokens.radius.md,
                    color:
                        variants.kind === 'solid'
                            ? tokens.color.accent.text
                            : variants.tone === 'muted'
                              ? tokens.color.text.muted
                              : tokens.color.text.default,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    fontFamily: tokens.font.family.body,
                    fontSize: variants.size === 'sm' ? '0.8125rem' : '0.875rem',
                    fontWeight: 500,
                    gap: tokens.space[2],
                    justifyContent: 'flex-start',
                    minHeight: variants.size === 'sm' ? '2rem' : '2.25rem',
                    padding: variants.size === 'sm' ? '0 0.625rem' : `0 ${tokens.space[3]}`,
                    transition: `background ${tokens.motion.duration.fast} ease, color ${tokens.motion.duration.fast} ease, border-color ${tokens.motion.duration.fast} ease`,
                },
            },
        }),
        'icon-button': ({ tokens, variants }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    background: variants.kind === 'soft' ? '#202226' : 'transparent',
                    border: `1px solid ${
                        variants.kind === 'soft' ? tokens.color.border.default : 'transparent'
                    }`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text.muted,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    height: variants.size === 'sm' ? '1.875rem' : '2.25rem',
                    justifyContent: 'center',
                    width: variants.size === 'sm' ? '1.875rem' : '2.25rem',
                },
            },
        }),
        badge: ({ variants }) => ({
            root: {
                style: {
                    ...forgeBadgeStyles(variants.tone, variants.kind),
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    lineHeight: 1,
                    padding: '0.1875rem 0.5rem',
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
                    background: '#0f0f10',
                    color: tokens.color.text.muted,
                },
            },
            cell: {
                style: {
                    borderBottom: `1px solid ${tokens.color.border.default}`,
                    color: tokens.color.text.default,
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    padding: '0.625rem 0.75rem',
                    textAlign: 'left',
                },
            },
        }),
    },
};
