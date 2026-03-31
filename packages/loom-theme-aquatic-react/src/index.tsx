import * as React from 'react';

import type { PanelProps } from '@loop-kit/loom-react';
import {
    defaultLoomImplementationMap,
    type LoomPrimitiveImplementation,
    type LoomReactThemeLayer,
} from '@loop-kit/loom-react';

const BasePanel = defaultLoomImplementationMap.panel as LoomPrimitiveImplementation<PanelProps>;

function AquaticPanel(props: React.ComponentProps<typeof BasePanel>) {
    return (
        <BasePanel
            {...props}
            style={{
                background:
                    'linear-gradient(180deg, color-mix(in oklch, white 18%, var(--loom-color-surface-raised)) 0%, color-mix(in oklch, var(--loom-color-surface) 85%, transparent) 100%)',
                boxShadow:
                    '0 18px 48px color-mix(in oklch, var(--loom-color-accent) 25%, transparent), inset 0 1px 0 color-mix(in oklch, white 40%, transparent)',
                position: 'relative',
                ...props.style,
            }}
        />
    );
}

export const aquaticReactTheme: LoomReactThemeLayer = {
    id: 'loom-aquatic',
    label: 'Aquatic',
    description: 'Glossy translucent surfaces with watery blue-green highlights.',
    modes: {
        light: {
            tokens: {
                color: {
                    accent: 'oklch(0.74 0.14 210)',
                    accentText: 'oklch(0.18 0.02 225)',
                    border: 'oklch(0.84 0.02 215)',
                    borderStrong: 'oklch(0.64 0.07 215)',
                    focusRing: 'oklch(0.8 0.14 215)',
                    info: 'oklch(0.76 0.12 220)',
                    surface: 'oklch(0.985 0.01 220 / 0.84)',
                    surfaceOverlay: 'oklch(0.92 0.02 220 / 0.75)',
                    surfaceRaised: 'oklch(0.995 0.006 220 / 0.9)',
                    surfaceSunken: 'oklch(0.93 0.02 220 / 0.8)',
                    text: 'oklch(0.22 0.03 245)',
                    textMuted: 'oklch(0.46 0.04 232)',
                },
                shadow: {
                    md: '0 20px 54px oklch(0.62 0.04 220 / 0.18)',
                    lg: '0 34px 92px oklch(0.48 0.05 220 / 0.24)',
                },
            },
        },
        dark: {
            tokens: {
                color: {
                    accent: 'oklch(0.8 0.12 215)',
                    accentText: 'oklch(0.18 0.01 230)',
                    border: 'oklch(0.42 0.02 220 / 0.55)',
                    borderStrong: 'oklch(0.62 0.08 220)',
                    focusRing: 'oklch(0.82 0.13 215)',
                    info: 'oklch(0.8 0.11 215)',
                    surface: 'oklch(0.22 0.015 220 / 0.74)',
                    surfaceOverlay: 'oklch(0.32 0.02 220 / 0.66)',
                    surfaceRaised: 'oklch(0.26 0.014 220 / 0.8)',
                    surfaceSunken: 'oklch(0.18 0.012 220 / 0.72)',
                    text: 'oklch(0.95 0.012 215)',
                    textMuted: 'oklch(0.78 0.03 215)',
                },
                shadow: {
                    md: '0 20px 54px oklch(0.04 0.01 220 / 0.48)',
                    lg: '0 34px 92px oklch(0.04 0.01 220 / 0.58)',
                },
            },
        },
    },
    implementations: {
        panel: AquaticPanel as LoomPrimitiveImplementation<Record<string, unknown>>,
    },
    recipes: {
        panel: ({ tokens, variants }) => ({
            root: {
                style: {
                    background:
                        variants.emphasis === 'strong'
                            ? tokens.color.surfaceRaised
                            : tokens.color.surface,
                    backdropFilter: 'blur(18px)',
                    border: `1px solid ${tokens.color.border}`,
                    borderRadius: tokens.radius.lg,
                    boxShadow: tokens.shadow.lg,
                },
            },
        }),
    },
};
