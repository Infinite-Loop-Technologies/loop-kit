import assert from 'node:assert/strict';
import test from 'node:test';

import {
    compileThemeToCssVars,
    defaultDarkTheme,
    defaultLightTheme,
} from '../src/theme';

test('compileThemeToCssVars returns stable vars and css text', () => {
    const first = compileThemeToCssVars(defaultLightTheme);
    const second = compileThemeToCssVars(defaultLightTheme);

    assert.deepEqual(first.vars, second.vars);
    assert.equal(first.cssText, second.cssText);
    assert.equal(first.vars['--loop-colors-background'], defaultLightTheme.tokens.colors.background);
    assert.equal(first.vars['--background'], defaultLightTheme.tokens.colors.background);
    assert.match(first.cssText, /--loop-colors-background:/);
});

test('compileThemeToCssVars maps dark destructive aliases', () => {
    const compiled = compileThemeToCssVars(defaultDarkTheme);

    assert.equal(compiled.vars['--destructive'], defaultDarkTheme.tokens.colors.danger);
    assert.equal(
        compiled.vars['--destructive-foreground'],
        defaultDarkTheme.tokens.colors.dangerForeground,
    );
});
