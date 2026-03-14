import assert from 'node:assert/strict';
import test from 'node:test';

import { ModuleManifestSchema } from '../src/manifests/module.js';

test('module manifest accepts trusted browser ui-extension metadata', () => {
    const parsed = ModuleManifestSchema.parse({
        schemaVersion: '1',
        kind: 'module',
        id: 'atelier-panel-surface',
        name: 'atelier-panel-surface',
        version: '0.1.0',
        entry: './src/index.ts',
        browser: {
            entry: './src/index.ts',
            uiExtensions: [
                {
                    slot: 'panel.surface',
                    export: 'atelierPanelSurfaceExtension',
                },
            ],
        },
        provides: [
            {
                kind: 'ui-extension',
                id: 'atelier-panel-surface',
            },
        ],
        permissions: [],
    });

    assert.equal(parsed.browser?.uiExtensions[0]?.slot, 'panel.surface');
    assert.equal(parsed.provides[0]?.kind, 'ui-extension');
});
