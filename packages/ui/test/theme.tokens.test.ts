import assert from 'node:assert/strict';
import test from 'node:test';

import { compileThemeToCssVars } from '../src/theme';
import {
    createDockSkins,
    setThemeTokenValue,
    validateUiSkinEntry,
} from '../src/blocks/dock/theme-state';

test('setThemeTokenValue updates a token and compiles through Theme compiler', () => {
    const skins = createDockSkins();
    const skin = skins.graphite;
    assert.ok(skin);
    if (!skin) {
        return;
    }

    const updated = setThemeTokenValue(
        skin.themes.light,
        'colors.accent',
        'oklch(0.71 0.23 190)',
    );
    assert.ok(updated);
    if (!updated) {
        return;
    }

    const compiled = compileThemeToCssVars(updated);
    assert.equal(compiled.vars['--loop-colors-accent'], 'oklch(0.71 0.23 190)');
    assert.equal(compiled.vars['--accent'], 'oklch(0.71 0.23 190)');
});

test('setThemeTokenValue updates sidebar tokens through the Theme compiler', () => {
    const skins = createDockSkins();
    const skin = skins.command;
    assert.ok(skin);
    if (!skin) {
        return;
    }

    const updated = setThemeTokenValue(
        skin.themes.dark,
        'colors.sidebar',
        'oklch(0.18 0.02 220)',
    );
    assert.ok(updated);
    if (!updated) {
        return;
    }

    const compiled = compileThemeToCssVars(updated);
    assert.equal(compiled.vars['--loop-colors-sidebar'], 'oklch(0.18 0.02 220)');
    assert.equal(compiled.vars['--sidebar'], 'oklch(0.18 0.02 220)');
});

test('setThemeTokenValue rejects unknown token paths', () => {
    const skins = createDockSkins();
    const skin = skins.classic;
    assert.ok(skin);
    if (!skin) {
        return;
    }

    const updated = setThemeTokenValue(
        skin.themes.dark,
        'colors.missingToken',
        'oklch(0.5 0.2 40)',
    );
    assert.equal(updated, null);
});

test('validateUiSkinEntry reports valid skin as null message', () => {
    const skins = createDockSkins();
    const skin = skins.sunset;
    assert.ok(skin);
    if (!skin) {
        return;
    }

    assert.equal(validateUiSkinEntry(skin, 'light'), null);
    assert.equal(validateUiSkinEntry(skin, 'dark'), null);
});
