import * as React from 'react';

import type { ButtonProps } from '@loop-kit/loom-react';
import {
    defaultLoomImplementationMap,
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

export const neumorphReactTheme: LoomReactThemeLayer = {
    id: 'loom-neumorph',
    label: 'Neumorph',
    description: 'Soft contour-heavy surfaces with pronounced inner and outer depth.',
    modes: {
        light: {
            tokens: {
                color: {
                    accent: 'oklch(0.66 0.09 250)',
                    accentText: 'oklch(0.98 0.01 255)',
                    border: 'oklch(0.9 0.01 255)',
                    borderStrong: 'oklch(0.72 0.03 255)',
                    focusRing: 'oklch(0.68 0.09 250)',
                    surface: 'oklch(0.94 0.006 255)',
                    surfaceRaised: 'oklch(0.97 0.004 255)',
                    surfaceSunken: 'oklch(0.9 0.008 255)',
                    text: 'oklch(0.32 0.02 255)',
                    textMuted: 'oklch(0.52 0.02 255)',
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
                    accent: 'oklch(0.76 0.08 250)',
                    accentText: 'oklch(0.18 0.01 250)',
                    border: 'oklch(0.28 0.01 250)',
                    borderStrong: 'oklch(0.48 0.02 250)',
                    focusRing: 'oklch(0.8 0.08 250)',
                    surface: 'oklch(0.2 0.01 250)',
                    surfaceRaised: 'oklch(0.24 0.01 250)',
                    surfaceSunken: 'oklch(0.16 0.01 250)',
                    text: 'oklch(0.93 0.01 250)',
                    textMuted: 'oklch(0.72 0.02 250)',
                },
                shadow: {
                    md: '8px 8px 20px rgb(7 10 16 / 0.7), -8px -8px 20px rgb(44 50 60 / 0.36)',
                    lg: '18px 18px 36px rgb(7 10 16 / 0.78), -18px -18px 36px rgb(44 50 60 / 0.42)',
                },
            },
        },
    },
    implementations: {
        button: NeumorphButton as LoomPrimitiveImplementation<Record<string, unknown>>,
    },
    recipes: {
        panel: ({ tokens }) => ({
            root: {
                style: {
                    background: tokens.color.surface,
                    border: `1px solid ${tokens.color.border}`,
                    boxShadow: tokens.shadow.lg,
                },
            },
        }),
        button: ({ tokens, variants }) => ({
            root: {
                style: {
                    background: variants.kind === 'ghost' ? 'transparent' : tokens.color.surfaceRaised,
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: '1.25rem',
                    color: tokens.color.text,
                    boxShadow: tokens.shadow.md,
                },
            },
        }),
    },
};
