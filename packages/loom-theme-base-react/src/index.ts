import {
    ArrowLeft,
    ArrowRight,
    Blocks,
    Calendar,
    Check,
    ChevronDown,
    ChevronRight,
    Clock3,
    Eye,
    File,
    FileText,
    Folder,
    FolderOpen,
    Github,
    Globe,
    Hexagon,
    Info,
    Kanban,
    List,
    Lock,
    MessageSquare,
    Minus,
    MoreHorizontal,
    PanelLeft,
    PanelRight,
    Pin,
    Plus,
    RefreshCw,
    Search,
    Settings,
    Star,
    Table,
    TriangleAlert,
    Type,
    User,
    X,
    Zap,
} from 'lucide-react';

import { defineRecipe, type LoomTokens } from '@loop-kit/loom-core';
import {
    defaultLoomImplementationMap,
    defineIconSet,
    type LoomIconComponent,
    type LoomReactThemeLayer,
} from '@loop-kit/loom-react';

function toneValue(tokens: LoomTokens, tone: string | undefined) {
    switch (tone) {
        case 'accent':
            return tokens.color.accent.default;
        case 'success':
            return tokens.color.status.success;
        case 'warning':
            return tokens.color.status.warning;
        case 'danger':
            return tokens.color.status.danger;
        case 'info':
            return tokens.color.status.info;
        case 'muted':
            return tokens.color.text.muted;
        default:
            return tokens.color.text.default;
    }
}

function kindValue(tokens: LoomTokens, tone: string | undefined, kind: string | undefined) {
    const accent =
        tone === 'neutral' || !tone ? tokens.color.accent.default : toneValue(tokens, tone);
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
            background: tokens.color.surface.sunken,
            borderColor: tokens.color.border.default,
            color: toneValue(tokens, tone),
        };
    }
    return {
        background: accent,
        borderColor: accent,
        color: tokens.color.accent.text,
    };
}

function createBaseTokens(mode: 'light' | 'dark'): LoomTokens {
    if (mode === 'dark') {
        return {
            color: {
                text: {
                    default: 'oklch(0.93 0.01 255)',
                    muted: 'oklch(0.72 0.02 255)',
                    inverse: 'oklch(0.16 0.01 255)',
                },
                surface: {
                    default: 'oklch(0.19 0.008 255)',
                    raised: 'oklch(0.23 0.008 255)',
                    sunken: 'oklch(0.16 0.008 255)',
                    overlay: 'oklch(0.28 0.01 255 / 0.86)',
                },
                border: {
                    default: 'oklch(0.32 0.01 255)',
                    strong: 'oklch(0.48 0.02 255)',
                    focus: 'oklch(0.76 0.14 235)',
                },
                accent: {
                    default: 'oklch(0.72 0.15 235)',
                    text: 'oklch(0.17 0.01 255)',
                },
                status: {
                    success: 'oklch(0.74 0.13 150)',
                    warning: 'oklch(0.82 0.16 80)',
                    danger: 'oklch(0.72 0.18 28)',
                    info: 'oklch(0.76 0.11 230)',
                },
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
                family: {
                    body: '"Aptos", system-ui, sans-serif',
                    heading: '"Fraunces", "Aptos Display", serif',
                    mono: '"JetBrains Mono", monospace',
                },
                size: {
                    sm: '0.875rem',
                    md: '1rem',
                    lg: '1.125rem',
                    xl: '1.5rem',
                },
            },
            shadow: {
                sm: '0 1px 2px rgb(2 6 23 / 0.3)',
                md: '0 14px 36px rgb(2 6 23 / 0.42)',
                lg: '0 24px 68px rgb(2 6 23 / 0.52)',
            },
            motion: {
                duration: {
                    fast: '120ms',
                    normal: '180ms',
                    slow: '280ms',
                },
            },
        };
    }

    return {
        color: {
            text: {
                default: 'oklch(0.23 0.02 255)',
                muted: 'oklch(0.5 0.02 255)',
                inverse: 'oklch(0.98 0.004 255)',
            },
            surface: {
                default: 'oklch(0.985 0.003 255)',
                raised: 'oklch(0.995 0.002 255)',
                sunken: 'oklch(0.94 0.005 255)',
                overlay: 'oklch(0.92 0.01 255 / 0.84)',
            },
            border: {
                default: 'oklch(0.86 0.01 255)',
                strong: 'oklch(0.7 0.02 255)',
                focus: 'oklch(0.74 0.15 235)',
            },
            accent: {
                default: 'oklch(0.62 0.15 235)',
                text: 'oklch(0.98 0.004 255)',
            },
            status: {
                success: 'oklch(0.68 0.14 150)',
                warning: 'oklch(0.78 0.16 80)',
                danger: 'oklch(0.67 0.18 28)',
                info: 'oklch(0.72 0.12 230)',
            },
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
            family: {
                body: '"Aptos", system-ui, sans-serif',
                heading: '"Fraunces", "Aptos Display", serif',
                mono: '"JetBrains Mono", monospace',
            },
            size: {
                sm: '0.875rem',
                md: '1rem',
                lg: '1.125rem',
                xl: '1.5rem',
            },
        },
        shadow: {
            sm: '0 1px 2px rgb(15 23 42 / 0.08)',
            md: '0 12px 30px rgb(15 23 42 / 0.12)',
            lg: '0 20px 60px rgb(15 23 42 / 0.16)',
        },
        motion: {
            duration: {
                fast: '120ms',
                normal: '180ms',
                slow: '280ms',
            },
        },
    };
}

function withLucide(Component: LoomIconComponent): LoomIconComponent {
    return Component;
}

const baseIconSet = defineIconSet({
    arrowLeft: withLucide(ArrowLeft),
    arrowRight: withLucide(ArrowRight),
    blocks: withLucide(Blocks),
    calendar: withLucide(Calendar),
    close: withLucide(X),
    check: withLucide(Check),
    chevronDown: withLucide(ChevronDown),
    chevronRight: withLucide(ChevronRight),
    clock: withLucide(Clock3),
    eye: withLucide(Eye),
    file: withLucide(File),
    fileText: withLucide(FileText),
    folder: withLucide(Folder),
    folderOpen: withLucide(FolderOpen),
    github: withLucide(Github),
    globe: withLucide(Globe),
    hexagon: withLucide(Hexagon),
    search: withLucide(Search),
    settings: withLucide(Settings),
    warning: withLucide(TriangleAlert),
    info: withLucide(Info),
    kanban: withLucide(Kanban),
    list: withLucide(List),
    lock: withLucide(Lock),
    messageSquare: withLucide(MessageSquare),
    moreHorizontal: withLucide(MoreHorizontal),
    pin: withLucide(Pin),
    plus: withLucide(Plus),
    minus: withLucide(Minus),
    panelLeft: withLucide(PanelLeft),
    panelRight: withLucide(PanelRight),
    refresh: withLucide(RefreshCw),
    star: withLucide(Star),
    table: withLucide(Table),
    type: withLucide(Type),
    user: withLucide(User),
    zap: withLucide(Zap),
});

/**
 * Base theme owns the default visual foundation: tokens, recipes, icons, and
 * the default React primitive implementation map.
 */
export const baseReactTheme: LoomReactThemeLayer = {
    id: 'loom-base',
    label: 'Loom Base',
    description:
        'Base React theme layer with the default semantic tokens, icons, recipes, and implementation map.',
    modes: {
        light: {
            tokens: createBaseTokens('light'),
        },
        dark: {
            tokens: createBaseTokens('dark'),
        },
    },
    icons: baseIconSet,
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
                            ? tokens.color.surface.raised
                            : tokens.color.surface.default,
                    border: `1px solid ${tokens.color.border.default}`,
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
                            ? tokens.color.surface.raised
                            : variants.emphasis === 'subtle'
                              ? tokens.color.surface.sunken
                              : tokens.color.surface.default,
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.lg,
                    boxShadow: tokens.shadow.md,
                    color: tokens.color.text.default,
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
                    background: tokens.color.surface.sunken,
                    borderRadius: tokens.radius.md,
                },
            },
        })),
        separator: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    background: tokens.color.border.default,
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
                            ? tokens.font.size.sm
                            : variants.size === 'lg'
                              ? tokens.font.size.lg
                              : variants.size === 'xl'
                                ? tokens.font.size.xl
                                : tokens.font.size.md,
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
                    fontFamily: tokens.font.family.heading,
                    fontSize:
                        variants.size === 'sm'
                            ? tokens.font.size.md
                            : variants.size === 'md'
                              ? tokens.font.size.lg
                              : variants.size === 'xl'
                                ? 'clamp(2rem, 4vw, 3.5rem)'
                                : tokens.font.size.xl,
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
                    color: tokens.color.accent.default,
                    textDecoration: 'underline',
                    textDecorationThickness: '0.12em',
                },
            },
        })),
        code: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    background: tokens.color.surface.sunken,
                    borderRadius: tokens.radius.sm,
                    color: tokens.color.text.default,
                    fontFamily: tokens.font.family.mono,
                    padding: `${tokens.space[1]} ${tokens.space[2]}`,
                },
            },
        })),
        icon: defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    color: toneValue(tokens, variants.tone),
                    display: 'inline-flex',
                    justifyContent: 'center',
                    lineHeight: 1,
                },
            },
            glyph: {
                style: {
                    display: 'block',
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
                    fontFamily: tokens.font.family.body,
                    fontSize:
                        variants.size === 'sm'
                            ? tokens.font.size.sm
                            : variants.size === 'lg'
                              ? tokens.font.size.lg
                              : tokens.font.size.md,
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
                    transition: `transform ${tokens.motion.duration.fast} ease, background ${tokens.motion.duration.fast} ease`,
                },
            },
            label: {
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                },
            },
            icon: {
                style: {
                    display: 'inline-flex',
                    flexShrink: 0,
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
            icon: {
                style: {
                    display: 'inline-flex',
                },
            },
        })),
        input: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    background: tokens.color.surface.default,
                    border: `1px solid ${tokens.color.border.default}`,
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
                    color: tokens.color.text.default,
                    flex: 1,
                    fontFamily: tokens.font.family.body,
                    fontSize: tokens.font.size.md,
                    outline: 'none',
                },
            },
        })),
        'text-area': defineRecipe(({ tokens }) => ({
            field: {
                style: {
                    background: tokens.color.surface.default,
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text.default,
                    fontFamily: tokens.font.family.body,
                    fontSize: tokens.font.size.md,
                    minHeight: '7rem',
                    padding: tokens.space[3],
                },
            },
        })),
        checkbox: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    color: tokens.color.text.default,
                    display: 'inline-flex',
                    gap: tokens.space[2],
                },
            },
            control: {
                style: {
                    accentColor: tokens.color.accent.default,
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
                    background: tokens.color.surface.sunken,
                    borderRadius: '999px',
                    height: '1.5rem',
                    padding: '0.125rem',
                    width: '2.75rem',
                },
            },
            thumb: {
                style: {
                    background: tokens.color.accent.default,
                    borderRadius: '999px',
                    boxShadow: tokens.shadow.sm,
                    display: 'block',
                    height: '1.25rem',
                    width: '1.25rem',
                },
            },
        })),
        select: defineRecipe(({ tokens }) => ({
            root: {
                style: {
                    alignItems: 'center',
                    display: 'inline-grid',
                    position: 'relative',
                },
            },
            trigger: {
                style: {
                    appearance: 'none',
                    background: tokens.color.surface.default,
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text.default,
                    fontFamily: tokens.font.family.body,
                    fontSize: tokens.font.size.md,
                    minHeight: '2.5rem',
                    padding: `0 calc(${tokens.space[5]} + ${tokens.space[1]}) 0 ${tokens.space[3]}`,
                },
            },
            icon: {
                style: {
                    color: tokens.color.text.muted,
                    pointerEvents: 'none',
                    position: 'absolute',
                    right: tokens.space[3],
                },
            },
        })),
        badge: defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    background:
                        variants.kind === 'outline' ? 'transparent' : tokens.color.surface.sunken,
                    border: `1px solid ${variants.kind === 'outline' ? toneValue(tokens, variants.tone) : tokens.color.border.default}`,
                    borderRadius: '999px',
                    color: toneValue(tokens, variants.tone),
                    display: 'inline-flex',
                    fontSize: tokens.font.size.sm,
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
                    background: tokens.color.surface.raised,
                    border: `1px solid ${tokens.color.border.default}`,
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
                    background: tokens.color.surface.raised,
                    border: `1px solid ${tokens.color.border.default}`,
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
                    background: tokens.color.surface.sunken,
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: tokens.radius.md,
                    color: tokens.color.text.default,
                    cursor: 'pointer',
                    padding: `${tokens.space[2]} ${tokens.space[3]}`,
                },
            },
            content: {
                style: {
                    background: tokens.color.surface.default,
                    border: `1px solid ${tokens.color.border.default}`,
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
                    background: tokens.color.surface.sunken,
                },
            },
            cell: {
                style: {
                    borderBottom: `1px solid ${tokens.color.border.default}`,
                    padding: `${tokens.space[2]} ${tokens.space[3]}`,
                    textAlign: 'left',
                },
            },
        })),
    },
};
