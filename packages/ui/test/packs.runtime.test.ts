import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Icon } from '../src/icons';
import {
    ThemePackProvider,
    ThemedButton,
    ThemedPanel,
    describeThemePackSurface,
} from '../src/packs';

test('describeThemePackSurface resolves the requested pack and preview styles', () => {
    const { pack, previewStyle } = describeThemePackSurface('liquid-glass');

    assert.equal(pack.id, 'liquid-glass');
    assert.equal(typeof previewStyle, 'object');
});

test('ThemePackProvider swaps icon registries and primitive overrides together', () => {
    const { pack } = describeThemePackSurface('neo-brutal');
    const markup = renderToStaticMarkup(
        React.createElement(
            ThemePackProvider,
            { pack, mode: 'dark' },
            React.createElement(
                ThemedPanel,
                null,
                React.createElement(Icon, { id: 'search', width: 16, height: 16 }),
                React.createElement(ThemedButton, null, 'Run'),
            ),
        ),
    );

    assert.match(markup, /<rect/);
    assert.match(markup, /box-shadow:5px 5px 0/);
});
