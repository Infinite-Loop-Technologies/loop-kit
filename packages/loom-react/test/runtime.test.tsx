import { describe, expect, test } from 'bun:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { LoomTokens } from '@loop-kit/loom-core';

import { Icon, LoomProvider, Text, defineIconSet } from '../src';

function createTestTokens(): LoomTokens {
    return {
        color: {
            text: {
                default: '#101828',
                muted: '#667085',
                inverse: '#ffffff',
            },
            surface: {
                default: '#ffffff',
                raised: '#f8fafc',
                sunken: '#f1f5f9',
                overlay: 'rgb(255 255 255 / 0.88)',
            },
            border: {
                default: '#d0d5dd',
                strong: '#98a2b3',
                focus: '#2e90fa',
            },
            accent: {
                default: '#155eef',
                text: '#eff8ff',
            },
            status: {
                success: '#17b26a',
                warning: '#f79009',
                danger: '#f04438',
                info: '#2e90fa',
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
            sm: '0.25rem',
            md: '0.5rem',
            lg: '0.75rem',
        },
        font: {
            family: {
                body: 'system-ui',
                heading: 'serif',
                mono: 'monospace',
            },
            size: {
                sm: '0.875rem',
                md: '1rem',
                lg: '1.125rem',
                xl: '1.5rem',
            },
        },
        shadow: {
            sm: '0 1px 2px rgb(0 0 0 / 0.05)',
            md: '0 6px 18px rgb(0 0 0 / 0.12)',
            lg: '0 12px 28px rgb(0 0 0 / 0.18)',
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

function renderWithThemes(node: React.ReactNode, themes: Parameters<typeof LoomProvider>[0]['themes']) {
    return renderToStaticMarkup(
        <LoomProvider colorMode='dark' themes={themes}>
            {node}
        </LoomProvider>,
    );
}

describe('loom-react provider and icon pipeline', () => {
    test('composes theme layers and emits recursive css vars', () => {
        const markup = renderWithThemes(
            <Text>Hello</Text>,
            [
                {
                    id: 'base',
                    modes: {
                        light: { tokens: createTestTokens() },
                        dark: { tokens: createTestTokens() },
                    },
                },
                {
                    id: 'accent',
                    modes: {
                        light: {
                            tokens: {
                                color: {
                                    accent: {
                                        default: '#7c3aed',
                                    },
                                },
                            },
                        },
                        dark: {
                            tokens: {
                                color: {
                                    accent: {
                                        default: '#c084fc',
                                    },
                                },
                            },
                        },
                    },
                },
            ],
        );

        expect(markup).toContain('data-loom-theme="base accent"');
        expect(markup).toContain('--loom-color-text-default:#101828');
        expect(markup).toContain('--loom-color-accent-default:#c084fc');
        expect(markup).toContain('Hello');
    });

    test('renders an icon fallback when the theme does not resolve a semantic icon', () => {
        const markup = renderWithThemes(
            <Icon name='settings' />,
            [
                {
                    id: 'base',
                    modes: {
                        light: { tokens: createTestTokens() },
                        dark: { tokens: createTestTokens() },
                    },
                },
            ],
        );

        expect(markup).toContain('<svg');
        expect(markup).toContain('<rect');
    });

    test('uses theme icon overrides when available', () => {
        const markup = renderWithThemes(
            <Icon name='settings' />,
            [
                {
                    id: 'base',
                    modes: {
                        light: { tokens: createTestTokens() },
                        dark: { tokens: createTestTokens() },
                    },
                },
                {
                    id: 'icons',
                    icons: defineIconSet({
                        settings: ({ size = 16 }) => (
                            <svg data-icon='custom-settings' height={size} width={size} />
                        ),
                    }),
                    modes: {
                        light: {},
                        dark: {},
                    },
                },
            ],
        );

        expect(markup).toContain('data-icon="custom-settings"');
    });
});
