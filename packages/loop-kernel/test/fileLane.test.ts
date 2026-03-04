import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { FileLaneProvider } from '../src/lanes/builtin/fileLane.js';

test('file lane snapshot changes when payload content changes', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-file-lane-'));

    try {
        const componentRoot = path.join(workspaceRoot, 'remote-component');
        await fs.ensureDir(path.join(componentRoot, 'files'));
        await fs.writeFile(path.join(componentRoot, 'files', 'button.tsx'), 'export const v = 1;\n', 'utf8');
        await fs.writeJson(path.join(componentRoot, 'loop.component.json'), {
            schemaVersion: '1',
            kind: 'component',
            id: 'remote-button',
            name: 'remote-button',
            version: '0.1.0',
            files: [
                {
                    source: 'files/button.tsx',
                    target: 'src/button.tsx',
                },
            ],
            patches: [],
            dependencies: [],
            targets: ['app', 'pkg'],
        }, { spaces: 2 });

        const provider = new FileLaneProvider();
        const first = await provider.resolveComponent({
            laneId: 'file',
            workspaceRoot,
            ref: {
                kind: 'file',
                path: componentRoot,
            },
        });

        assert.equal(first.ok, true);
        if (!first.ok) {
            return;
        }

        await fs.writeFile(path.join(componentRoot, 'files', 'button.tsx'), 'export const v = 2;\n', 'utf8');

        const second = await provider.resolveComponent({
            laneId: 'file',
            workspaceRoot,
            ref: {
                kind: 'file',
                path: componentRoot,
            },
        });

        assert.equal(second.ok, true);
        if (!second.ok) {
            return;
        }

        assert.notEqual(first.value.snapshotId, second.value.snapshotId);
    } finally {
        await fs.remove(workspaceRoot);
    }
});
