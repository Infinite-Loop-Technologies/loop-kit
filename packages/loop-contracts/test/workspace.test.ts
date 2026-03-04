import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LoopWorkspaceConfigSchema } from '../src/workspace.js';

test('workspace schema accepts canonical lane-instance map', () => {
    const parsed = LoopWorkspaceConfigSchema.safeParse({
        schemaVersion: '1',
        workspace: {
            name: 'loop-kit',
            appsDir: 'apps',
            packagesDir: 'packages',
            assetsDir: 'assets',
            toolsDir: 'tools',
            loopDir: 'loop',
        },
        lanes: {
            workspace: { kind: 'local', config: { root: '.' } },
            shared: { kind: 'file', config: { path: '../lane' } },
        },
        defaults: {
            componentLane: 'workspace',
            moduleLane: 'workspace',
            refKindMap: {
                local: 'workspace',
                file: 'shared',
            },
        },
        modules: [],
        toolchains: [{ id: 'typescript', kind: 'typescript', options: {} }],
        components: { defaultTarget: '.', ignoreGlobs: [] },
    });

    assert.equal(parsed.success, true);
    if (parsed.success) {
        assert.equal(parsed.data.workspace.name, 'loop-kit');
        assert.equal(parsed.data.lanes.workspace.kind, 'local');
        assert.equal(parsed.data.defaults.componentLane, 'workspace');
    }
});

test('workspace schema normalizes legacy lanes array + options into canonical shape', () => {
    const parsed = LoopWorkspaceConfigSchema.safeParse({
        schemaVersion: '1',
        workspace: {
            appsDir: 'apps',
            packagesDir: 'packages',
            assetsDir: 'assets',
            toolsDir: 'tools',
            loopDir: 'loop',
        },
        lanes: [
            { id: 'local', kind: 'local', options: {} },
            { id: 'file', kind: 'file', options: { path: '../legacy' } },
        ],
        modules: [],
        toolchains: [{ id: 'typescript', kind: 'typescript', options: {} }],
        components: { defaultTarget: '.', ignoreGlobs: [] },
    });

    assert.equal(parsed.success, true);
    if (parsed.success) {
        assert.equal(parsed.data.workspace.name, 'loop-workspace');
        assert.equal(parsed.data.lanes.local.kind, 'local');
        assert.deepEqual(parsed.data.lanes.file.config, { path: '../legacy' });
        assert.equal(parsed.data.defaults.componentLane, 'local');
        assert.equal(parsed.data.defaults.moduleLane, 'local');
    }
});
