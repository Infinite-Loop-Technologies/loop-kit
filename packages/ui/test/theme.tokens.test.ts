import assert from 'node:assert/strict';
import test from 'node:test';

import { compileThemeToCssVars } from '../src/theme';
import {
    createDockThemePresets,
    setThemeTokenValue,
    validateThemeSetEntry,
} from '../src/blocks/dock/theme-state';

test('setThemeTokenValue updates a token and compiles through Theme compiler', () => {
    const presets = createDockThemePresets();
    const preset = presets.graphite;
    assert.ok(preset);
    if (!preset) {
        return;
    }

    const updated = setThemeTokenValue(
        preset.themes.light,
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

test('setThemeTokenValue rejects unknown token paths', () => {
    const presets = createDockThemePresets();
    const preset = presets.classic;
    assert.ok(preset);
    if (!preset) {
        return;
    }

    const updated = setThemeTokenValue(
        preset.themes.dark,
        'colors.missingToken',
        'oklch(0.5 0.2 40)',
    );
    assert.equal(updated, null);
});

test('validateThemeSetEntry reports valid preset as null message', () => {
    const presets = createDockThemePresets();
    const preset = presets.sunset;
    assert.ok(preset);
    if (!preset) {
        return;
    }

    assert.equal(validateThemeSetEntry(preset, 'light'), null);
    assert.equal(validateThemeSetEntry(preset, 'dark'), null);
});
