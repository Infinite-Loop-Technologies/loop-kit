import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLocalCommandHints } from '../src/commands/componentCatalog.js';

test('buildLocalCommandHints uses metadata overrides when provided', () => {
    const hints = buildLocalCommandHints(
        'ui-demo-starter',
        ['app'],
        {
            localCommands: {
                addDev: 'pnpm run loop:dev add local:ui-demo-starter --to apps/ui-demo --cwd .',
                addDist: 'node packages/loop-cli/dist/cli.js add local:ui-demo-starter --to apps/ui-demo --cwd .',
                show: 'pnpm run loop:dev component show ui-demo-starter --cwd .',
            },
        },
    );

    assert.equal(
        hints.addDev,
        'pnpm run loop:dev add local:ui-demo-starter --to apps/ui-demo --cwd .',
    );
    assert.equal(
        hints.addDist,
        'node packages/loop-cli/dist/cli.js add local:ui-demo-starter --to apps/ui-demo --cwd .',
    );
    assert.equal(hints.showDev, 'pnpm run loop:dev component show ui-demo-starter --cwd .');
});

test('buildLocalCommandHints falls back to inferred target path', () => {
    const appHints = buildLocalCommandHints('ui-theme-manager', ['app', 'pkg'], undefined);
    assert.match(appHints.addDev, /--to apps\/ui-demo --cwd \./);

    const pkgHints = buildLocalCommandHints('pkg-only', ['pkg'], undefined);
    assert.match(pkgHints.addDist, /--to packages\/my-package --cwd \./);
});
