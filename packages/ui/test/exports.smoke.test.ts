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
    assert.equal(typeof blocks.DockWorkspaceDemo, 'function');
    assert.equal(typeof blocks.ThemeManagerBlock, 'function');
    assert.equal(typeof blocks.TokenEditorBlock, 'function');
    assert.equal(typeof blocks.ColorPicker, 'function');
    assert.equal(typeof blocks.ShortcutSettingsBlock, 'function');
});

test('skins barrel smoke import', async () => {
    const skins = await import('@loop-kit/ui/skins');

    assert.equal(typeof skins.UiProvider, 'function');
    assert.equal(typeof skins.resolveUiSkin, 'function');
    assert.equal(typeof skins.defaultUiSkinRegistry.resolve, 'function');
});

test('packs barrel smoke import', async () => {
    const packs = await import('@loop-kit/ui/packs');

    assert.equal(typeof packs.ThemePackProvider, 'function');
    assert.equal(typeof packs.ThemedPanel, 'function');
    assert.equal(typeof packs.resolveDefaultThemePack, 'function');
});
