import { describe, expect, test } from 'bun:test';

import { getBlueprint, resolveBlueprintVariants } from '../src/blueprints';
import { defineRecipe } from '../src/recipes';
import { mergeResolvedStyles } from '../src/styles';
import { resolveThemeLayers } from '../src/theme';
import { createFallbackTokens } from '../src/tokens';

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
});

describe('loom-core recipes', () => {
    test('recipe returns part keyed resolved styles', () => {
        const recipe = defineRecipe(({ tokens, variants }) => ({
            root: {
                style: {
                    background: variants.tone === 'accent' ? tokens.color.accent : tokens.color.surface,
                },
            },
        }));

        expect(
            recipe({
                tokens: createFallbackTokens(),
                variants: { tone: 'accent' },
                state: {},
            }).root?.style?.background,
        ).toBe(createFallbackTokens().color.accent);
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
    test('theme layers fall back to base tokens and compose overrides', () => {
        const resolved = resolveThemeLayers(
            [
                {
                    id: 'base',
                    modes: {
                        light: {
                            tokens: {
                                color: {
                                    surface: 'white',
                                },
                            },
                        },
                        dark: {
                            tokens: {
                                color: {
                                    surface: 'black',
                                },
                            },
                        },
                    },
                },
                {
                    id: 'accent',
                    modes: {
                        light: {
                            tokens: {
                                color: {
                                    accent: 'royalblue',
                                },
                            },
                        },
                        dark: {
                            tokens: {
                                color: {
                                    accent: 'deepskyblue',
                                },
                            },
                        },
                    },
                },
            ],
            'dark',
        );

        expect(resolved.tokens.color.surface).toBe('black');
        expect(resolved.tokens.color.accent).toBe('deepskyblue');
        expect(resolved.tokens.color.text).toBeTruthy();
    });
});
