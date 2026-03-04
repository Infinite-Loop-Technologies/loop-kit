import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { LocalLaneProvider } from '../src/lanes/builtin/localLane.js';

test('local lane resolves component manifest', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-local-lane-'));
    try {
        const componentRoot = path.join(workspaceRoot, 'loop', 'components', 'hello');
        await fs.ensureDir(path.join(componentRoot, 'files'));
        await fs.writeFile(path.join(componentRoot, 'files', 'hello.ts'), 'export const hi = 1;\n', 'utf8');
        await fs.writeJson(path.join(componentRoot, 'loop.component.json'), {
            schemaVersion: '1',
            kind: 'component',
            id: 'hello',
            name: 'hello',
            version: '0.1.0',
            files: [
                {
                    source: 'files/hello.ts',
                    target: 'src/hello.ts',
                },
            ],
            patches: [],
            dependencies: [],
            targets: ['app', 'pkg'],
        }, { spaces: 2 });

        const provider = new LocalLaneProvider();
        const resolved = await provider.resolveComponent({
            laneId: 'local',
            workspaceRoot,
            ref: { kind: 'local', id: 'hello' },
        });

        assert.equal(resolved.ok, true);
        if (resolved.ok) {
            assert.equal(resolved.value.manifest.id, 'hello');
            assert.ok(resolved.value.snapshotId.length > 10);
        }
    } finally {
        await fs.remove(workspaceRoot);
    }
});
