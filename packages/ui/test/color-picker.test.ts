import assert from 'node:assert/strict';
import test from 'node:test';

import { cssColorToHex } from '../src/blocks/token-editor/color-picker';

test('cssColorToHex normalizes hex colors', () => {
    assert.equal(cssColorToHex('#abc'), '#aabbcc');
    assert.equal(cssColorToHex('#A1B2C3'), '#a1b2c3');
});

test('cssColorToHex converts oklch colors without a DOM probe', () => {
    assert.equal(cssColorToHex('oklch(0 0 0)'), '#000000');
    assert.equal(cssColorToHex('oklch(1 0 0)'), '#ffffff');
    assert.equal(cssColorToHex('oklch(100% 0 0)'), '#ffffff');
});

test('cssColorToHex converts oklab colors without a DOM probe', () => {
    assert.equal(cssColorToHex('oklab(0 0 0)'), '#000000');
    assert.equal(cssColorToHex('oklab(1 0 0)'), '#ffffff');
});
