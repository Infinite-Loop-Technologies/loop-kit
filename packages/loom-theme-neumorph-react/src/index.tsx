import * as React from 'react';

import type { ButtonProps } from '@loop-kit/loom-react';
import {
    defaultLoomImplementationMap,
    defineIconSet,
    type LoomIconComponentProps,
    type LoomPrimitiveImplementation,
    type LoomReactThemeLayer,
} from '@loop-kit/loom-react';

const BaseButton = defaultLoomImplementationMap.button as LoomPrimitiveImplementation<ButtonProps>;

function NeumorphButton(props: React.ComponentProps<typeof BaseButton>) {
    return (
        <BaseButton
            {...props}
            style={{
                boxShadow:
                    '8px 8px 20px color-mix(in oklch, black 18%, transparent), -8px -8px 20px color-mix(in oklch, white 72%, transparent)',
                filter: 'saturate(0.96)',
                ...props.style,
            }}
        />
    );
}

function NeumorphSettingsIcon({
    className,
    size = 16,
    style,
    title,
}: LoomIconComponentProps) {
    return (
        <svg
            aria-hidden={title ? undefined : true}
            className={className}
            fill='none'
            height={size}
            role='img'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.75'
            style={style}
            viewBox='0 0 24 24'
            width={size}>
            {title ? <title>{title}</title> : null}
            <circle cx='12' cy='12' r='3.25' />
            <path d='M12 3.75v2.1M12 18.15v2.1M20.25 12h-2.1M5.85 12h-2.1M17.83 6.17l-1.49 1.49M7.66 16.34l-1.49 1.49M17.83 17.83l-1.49-1.49M7.66 7.66 6.17 6.17' />
        </svg>
    );
}

export const neumorphReactTheme: LoomReactThemeLayer = {
    id: 'loom-neumorph',
    label: 'Neumorph',
    description: 'Soft contour-heavy surfaces with pronounced inner and outer depth.',
    modes: {
        light: {
            tokens: {
                color: {
                    accent: {
                        default: 'oklch(0.66 0.09 250)',
                        text: 'oklch(0.98 0.01 255)',
                    },
                    border: {
                        default: 'oklch(0.9 0.01 255)',
                        strong: 'oklch(0.72 0.03 255)',
                        focus: 'oklch(0.68 0.09 250)',
                    },
                    surface: {
                        default: 'oklch(0.94 0.006 255)',
                        raised: 'oklch(0.97 0.004 255)',
                        sunken: 'oklch(0.9 0.008 255)',
                    },
                    text: {
                        default: 'oklch(0.32 0.02 255)',
                        muted: 'oklch(0.52 0.02 255)',
                    },
                },
                shadow: {
                    md: '8px 8px 20px rgb(163 177 198 / 0.38), -8px -8px 20px rgb(255 255 255 / 0.82)',
                    lg: '18px 18px 36px rgb(163 177 198 / 0.32), -18px -18px 36px rgb(255 255 255 / 0.86)',
                },
            },
        },
        dark: {
            tokens: {
                color: {
                    accent: {
                        default: 'oklch(0.76 0.08 250)',
                        text: 'oklch(0.18 0.01 250)',
                    },
                    border: {
                        default: 'oklch(0.28 0.01 250)',
                        strong: 'oklch(0.48 0.02 250)',
                        focus: 'oklch(0.8 0.08 250)',
                    },
                    surface: {
                        default: 'oklch(0.2 0.01 250)',
                        raised: 'oklch(0.24 0.01 250)',
                        sunken: 'oklch(0.16 0.01 250)',
                    },
                    text: {
                        default: 'oklch(0.93 0.01 250)',
                        muted: 'oklch(0.72 0.02 250)',
                    },
                },
                shadow: {
                    md: '8px 8px 20px rgb(7 10 16 / 0.7), -8px -8px 20px rgb(44 50 60 / 0.36)',
                    lg: '18px 18px 36px rgb(7 10 16 / 0.78), -18px -18px 36px rgb(44 50 60 / 0.42)',
                },
            },
        },
    },
    icons: defineIconSet({
        settings: NeumorphSettingsIcon,
    }),
    implementations: {
        button: NeumorphButton as LoomPrimitiveImplementation<Record<string, unknown>>,
    },
    recipes: {
        panel: ({ tokens }) => ({
            root: {
                style: {
                    background: tokens.color.surface.default,
                    border: `1px solid ${tokens.color.border.default}`,
                    boxShadow: tokens.shadow.lg,
                },
            },
        }),
        button: ({ tokens, variants }) => ({
            root: {
                style: {
                    background:
                        variants.kind === 'ghost' ? 'transparent' : tokens.color.surface.raised,
                    border: `1px solid ${tokens.color.border.default}`,
                    borderRadius: '1.25rem',
                    color: tokens.color.text.default,
                    boxShadow: tokens.shadow.md,
                },
            },
        }),
    },
};
