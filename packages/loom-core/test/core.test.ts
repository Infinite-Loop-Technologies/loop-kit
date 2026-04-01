import { describe, expect, test } from 'bun:test';

import { getBlueprint, resolveBlueprintVariants } from '../src/blueprints';
import { defineRecipe } from '../src/recipes';
import { mergeResolvedStyles } from '../src/styles';
import { resolveThemeLayers } from '../src/theme';
import {
    composeTokens,
    mergeTokens,
    tokensToCssVariables,
    type LoomTokens,
} from '../src/tokens';

function createTestTokens(): LoomTokens {
    return {
        color: {
            text: {
                default: '#111827',
                muted: '#6b7280',
                inverse: '#ffffff',
            },
            surface: {
                default: '#ffffff',
                raised: '#f9fafb',
                sunken: '#f3f4f6',
                overlay: 'rgb(255 255 255 / 0.88)',
            },
            border: {
                default: '#d1d5db',
                strong: '#6b7280',
                focus: '#3b82f6',
            },
            accent: {
                default: '#2563eb',
                text: '#eff6ff',
            },
            status: {
                success: '#16a34a',
                warning: '#f59e0b',
                danger: '#dc2626',
                info: '#0ea5e9',
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
            sm: '0 1px 2px rgb(0 0 0 / 0.08)',
            md: '0 8px 24px rgb(0 0 0 / 0.12)',
            lg: '0 16px 40px rgb(0 0 0 / 0.18)',
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

describe('loom-core blueprints', () => {
    test('resolves semantic props into variant values', () => {
        const blueprint = getBlueprint('button');
        const variants = resolveBlueprintVariants(blueprint, {
            appearance: 'plain',
            size: 'lg',
        });

        expect(variants.kind).toBe('ghost');
        expect(variants.size).toBe('lg');
        expect(variants.tone).toBe('neutral');
    });

    test('keeps Icon content selectors out of variants', () => {
        const blueprint = getBlueprint('icon');
        const variants = resolveBlueprintVariants(blueprint, {
            name: 'settings',
            tone: 'accent',
        });

        expect(variants.tone).toBe('accent');
        expect((variants as Record<string, string | undefined>).name).toBeUndefined();
    });
});

describe('loom-core token helpers', () => {
    test('merges nested token patches', () => {
        const merged = mergeTokens(createTestTokens(), {
            color: {
                accent: {
                    default: '#0f766e',
                },
            },
            font: {
                family: {
                    heading: 'Fraunces',
                },
            },
        });

        expect(merged.color.accent.default).toBe('#0f766e');
        expect(merged.color.accent.text).toBe('#eff6ff');
        expect(merged.font.family.heading).toBe('Fraunces');
        expect(merged.font.family.body).toBe('system-ui');
    });

    test('flattens nested tokens into recursive CSS variables', () => {
        const cssVars = tokensToCssVariables(createTestTokens());

        expect(cssVars['--loom-color-text-default']).toBe('#111827');
        expect(cssVars['--loom-color-surface-raised']).toBe('#f9fafb');
        expect(cssVars['--loom-font-family-heading']).toBe('serif');
        expect(cssVars['--loom-motion-duration-fast']).toBe('120ms');
    });
});

describe('loom-core recipes', () => {
    test('recipe returns part keyed resolved styles', () => {
        const recipe = defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    background:
                        variants.tone === 'accent'
                            ? tokens.color.accent.default
                            : tokens.color.surface.default,
                },
            },
        }));

        expect(
            recipe({
                tokens: createTestTokens(),
                variants: { tone: 'accent' },
                state: {},
            }).root?.style?.background,
        ).toBe(createTestTokens().color.accent.default);
    });

    test('resolved styles merge by part', () => {
        const merged = mergeResolvedStyles(
            {
                root: { style: { color: 'red' } },
            },
            {
                root: { style: { background: 'blue' } },
            },
        );

        expect(merged.root?.style).toEqual({
            color: 'red',
            background: 'blue',
        });
    });
});

describe('loom-core theme composition', () => {
    test('theme layers compose nested token overrides without core fallbacks', () => {
        const resolved = resolveThemeLayers(
            [
                {
                    id: 'base',
                    modes: {
                        light: {
                            tokens: createTestTokens(),
                        },
                        dark: {
                            tokens: composeTokens(createTestTokens(), {
                                color: {
                                    surface: {
                                        default: '#0f172a',
                                    },
                                    text: {
                                        default: '#f8fafc',
                                    },
                                },
                            }),
                        },
                    },
                },
                {
                    id: 'accent',
                    modes: {
                        light: {
                            tokens: {
                                color: {
                                    accent: {
                                        default: 'royalblue',
                                    },
                                },
                            },
                        },
                        dark: {
                            tokens: {
                                color: {
                                    accent: {
                                        default: 'deepskyblue',
                                    },
                                },
                            },
                        },
                    },
                },
            ],
            'dark',
        );

        expect(resolved.tokens.color.surface.default).toBe('#0f172a');
        expect(resolved.tokens.color.accent.default).toBe('deepskyblue');
        expect(resolved.tokens.color.text.default).toBe('#f8fafc');
    });
});
