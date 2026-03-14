import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Panel } from '../src/primitives';
import {
    UiProvider,
    createUiExtensionRegistry,
    defaultUiSkinDefinitions,
    resolveUiSkin,
} from '../src/skins';
import type { UiExtensionDefinition } from '../src/extensions';

const testPanelSurfaceExtension: UiExtensionDefinition = {
    id: 'test-panel-surface',
    slots: {
        'panel.surface': ({ DefaultSurface, children, contentClassName, ...props }) =>
            React.createElement(
                DefaultSurface,
                {
                    ...props,
                    contentClassName,
                },
                React.createElement(
                    'div',
                    { 'data-loop-panel-extension': 'test-panel-surface' },
                    children,
                ),
            ),
    },
};

test('createUiExtensionRegistry resolves slots only for explicitly enabled extensions', () => {
    const disabled = createUiExtensionRegistry({
        extensions: [testPanelSurfaceExtension],
    });
    assert.equal(disabled.getSlot('panel.surface'), undefined);

    const enabled = createUiExtensionRegistry({
        extensions: [testPanelSurfaceExtension],
        enabledExtensionIds: ['test-panel-surface'],
    });
    assert.ok(enabled.getSlot('panel.surface'));
});

test('skins alone do not load code, but explicit enabled extensions do', () => {
    const skin = resolveUiSkin(defaultUiSkinDefinitions.atelier, defaultUiSkinDefinitions);

    const defaultMarkup = renderToStaticMarkup(
        React.createElement(
            UiProvider,
            {
                skin,
                mode: 'light',
            },
            React.createElement(Panel, null, 'Atelier surface'),
        ),
    );

    assert.doesNotMatch(defaultMarkup, /data-loop-panel-extension=/);

    const extendedMarkup = renderToStaticMarkup(
        React.createElement(
            UiProvider,
            {
                skin,
                mode: 'light',
                extensions: [testPanelSurfaceExtension],
                enabledExtensionIds: ['test-panel-surface'],
            },
            React.createElement(Panel, null, 'Atelier surface'),
        ),
    );

    assert.match(extendedMarkup, /data-loop-panel-extension="test-panel-surface"/);
});
