import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { ProviderHost } from '../src/providers/host.js';
import { LocalLaneProvider } from '../src/lanes/builtin/localLane.js';
import { addComponent } from '../src/components/add.js';
import { updateComponent } from '../src/components/update.js';

test('update overwrites managed files after snapshot change', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-update-'));

    try {
        const host = new ProviderHost();
        host.registerLaneProvider(new LocalLaneProvider());

        await fs.ensureDir(path.join(workspaceRoot, 'apps', 'demo'));
        await fs.writeJson(path.join(workspaceRoot, 'apps', 'demo', 'package.json'), {
            name: 'demo',
            version: '0.1.0',
            private: true,
        }, { spaces: 2 });

        const componentRoot = path.join(workspaceRoot, 'loop', 'components', 'hello');
        await fs.ensureDir(path.join(componentRoot, 'files'));
        await fs.writeFile(path.join(componentRoot, 'files', 'hello.ts'), 'export const hello = "v1";\n', 'utf8');
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

        const addResult = await addComponent(workspaceRoot, host, 'local:hello', {
            targetPath: 'apps/demo',
        });
        assert.equal(addResult.ok, true);
        if (!addResult.ok) {
            return;
        }

        const installedPath = path.join(workspaceRoot, 'apps', 'demo', 'src', 'hello.ts');
        assert.equal(await fs.readFile(installedPath, 'utf8'), 'export const hello = "v1";\n');

        await fs.writeFile(path.join(componentRoot, 'files', 'hello.ts'), 'export const hello = "v2";\n', 'utf8');

        const updateResult = await updateComponent(workspaceRoot, host, 'local:hello', {
            targetPath: 'apps/demo',
        });

        assert.equal(updateResult.ok, true);
        if (!updateResult.ok) {
            return;
        }

        assert.equal(updateResult.value.execution.changedFiles.includes(path.join('apps', 'demo', 'src', 'hello.ts')), true);
        assert.equal(await fs.readFile(installedPath, 'utf8'), 'export const hello = "v2";\n');
    } finally {
        await fs.remove(workspaceRoot);
    }
});
