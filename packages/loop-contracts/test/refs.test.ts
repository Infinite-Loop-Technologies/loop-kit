import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLoopRef } from '../src/refs.js';

test('parseLoopRef parses local and file refs', () => {
    const local = parseLoopRef('local:ui-button');
    assert.equal(local.ok, true);
    if (local.ok) {
        assert.equal(local.value.kind, 'local');
        assert.equal(local.value.id, 'ui-button');
    }

    const file = parseLoopRef('file:./component');
    assert.equal(file.ok, true);
    if (file.ok) {
        assert.equal(file.value.kind, 'file');
        assert.equal(file.value.path, './component');
    }
});
