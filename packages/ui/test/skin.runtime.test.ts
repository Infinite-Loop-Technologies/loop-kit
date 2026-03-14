import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { defaultAssetRegistry } from '../src/assets';
import { defaultIconRegistry } from '../src/icons';
import { Panel } from '../src/primitives';
import {
    UiProvider,
    createSkinAssetResolver,
    createSkinIconRegistry,
    defaultUiSkinDefinitions,
    resolveUiSkin,
} from '../src/skins';

test('resolveUiSkin inherits parent themes and merges overrides', () => {
    const resolved = resolveUiSkin(
        {
            id: 'test-child',
            extends: 'classic',
            assets: {
                textures: {
                    'panel/noise-01': 'https://cdn.example/custom-noise.svg',
                },
            },
            iconAliases: {
                search: 'wrench',
            },
        },
        defaultUiSkinDefinitions,
    );

    assert.equal(resolved.label, 'Test Child');
    assert.equal(resolved.themes.light.id, 'classic-light');
    assert.equal(
        resolved.assets.textures['panel/noise-01'],
        'https://cdn.example/custom-noise.svg',
    );
    assert.equal(resolved.iconAliases.search, 'wrench');
});

test('createSkinAssetResolver preserves default textures when a skin only overrides one key', () => {
    const resolved = resolveUiSkin(
        {
            id: 'test-assets',
            extends: 'classic',
            assets: {
                textures: {
                    'panel/noise-01': 'https://cdn.example/override.svg',
                },
            },
        },
        defaultUiSkinDefinitions,
    );
    const resolver = createSkinAssetResolver(resolved);

    assert.equal(
        resolver.resolve('asset://texture/panel/noise-01'),
        'https://cdn.example/override.svg',
    );
    assert.equal(
        resolver.resolve('asset://texture/panel/noise-03'),
        defaultAssetRegistry.textures['panel/noise-03'],
    );
});

test('createSkinIconRegistry applies aliases and falls back to the default icon pack', () => {
    const resolved = resolveUiSkin(
        {
            id: 'test-icons',
            extends: 'classic',
            iconAliases: {
                search: 'wrench',
            },
        },
        defaultUiSkinDefinitions,
    );
    const registry = createSkinIconRegistry(resolved);

    assert.equal(registry.get('search'), defaultIconRegistry.get('wrench'));
    assert.equal(registry.get('menu'), defaultIconRegistry.get('menu'));
});

test('Panel consumes the active skin texture and blur variables from UiProvider context', () => {
    const skin = resolveUiSkin(defaultUiSkinDefinitions.forge, defaultUiSkinDefinitions);
    const markup = renderToStaticMarkup(
        React.createElement(
            UiProvider,
            { skin, mode: 'dark' },
            React.createElement(Panel, null, 'Forge surface'),
        ),
    );

    assert.match(
        markup,
        new RegExp(
            defaultAssetRegistry.textures['panel/noise-03']!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        ),
    );
    assert.match(markup, /backdrop-filter:blur\(var\(--loop-fx-glassBlur\)\)/);
    assert.match(markup, /opacity:var\(--loop-fx-panelOverlayOpacity\)/);
});
