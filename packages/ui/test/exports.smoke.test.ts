import assert from 'node:assert/strict';
import test from 'node:test';

test('legacy barrel smoke import', async () => {
    const legacy = await import('@loop-kit/ui/legacy');

    assert.equal(typeof legacy.Button, 'function');
    assert.equal(typeof legacy.Card, 'function');
});

test('blocks barrel smoke import', async () => {
    const blocks = await import('@loop-kit/ui/blocks');

    assert.equal(typeof blocks.GraphiteStudioBlock, 'function');
    assert.equal(typeof blocks.OutlineEditorBlock, 'function');
});
