import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssetResolver, defaultAssetRegistry } from '../src/assets';

test('asset resolver resolves texture identifiers', () => {
    const resolver = createAssetResolver();
    const resolved = resolver.resolve('asset://texture/panel/noise-01');

    assert.equal(resolved, defaultAssetRegistry.textures['panel/noise-01']);
});

test('asset resolver supports custom overrides', () => {
    const resolver = createAssetResolver({
        textures: {
            'panel/noise-01': 'https://cdn.example/texture.svg',
        },
    });

    assert.equal(
        resolver.resolve('asset://texture/panel/noise-01'),
        'https://cdn.example/texture.svg',
    );
});

test('asset resolver returns undefined for unknown assets', () => {
    const resolver = createAssetResolver();

    assert.equal(resolver.resolve('asset://texture/panel/missing'), undefined);
    assert.equal(resolver.resolve('http://example.com/image.png'), undefined);
});
