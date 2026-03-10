import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { ProviderHost } from '../src/providers/host.js';
import { LocalLaneProvider } from '../src/lanes/builtin/localLane.js';
import { addComponent } from '../src/components/add.js';

async function writeWorkspaceScaffold(workspaceRoot: string): Promise<void> {
    await fs.ensureDir(path.join(workspaceRoot, 'apps', 'demo'));
    await fs.ensureDir(path.join(workspaceRoot, 'packages', 'lib'));
    await fs.writeJson(
        path.join(workspaceRoot, 'apps', 'demo', 'package.json'),
        {
            name: 'demo',
            private: true,
            version: '0.1.0',
        },
        { spaces: 2 },
    );
    await fs.writeJson(
        path.join(workspaceRoot, 'packages', 'lib', 'package.json'),
        {
            name: '@loop-kit/lib',
            version: '0.1.0',
        },
        { spaces: 2 },
    );
}

async function writeComponent(
    workspaceRoot: string,
    componentId: string,
    targets: Array<'app' | 'pkg'>,
): Promise<void> {
    const componentRoot = path.join(workspaceRoot, 'loop', 'components', componentId);
    await fs.ensureDir(path.join(componentRoot, 'files'));
    await fs.writeFile(
        path.join(componentRoot, 'files', 'feature.ts'),
        'export const feature = true;\n',
        'utf8',
    );
    await fs.writeJson(
        path.join(componentRoot, 'loop.component.json'),
        {
            schemaVersion: '1',
            kind: 'component',
            id: componentId,
            name: componentId,
            version: '0.1.0',
            description: 'target test component',
            files: [
                {
                    source: 'files/feature.ts',
                    target: 'src/feature.ts',
                },
            ],
            patches: [],
            dependencies: [],
            targets,
        },
        { spaces: 2 },
    );
}

function createHost(): ProviderHost {
    const host = new ProviderHost();
    host.registerLaneProvider(new LocalLaneProvider());
    return host;
}

test('addComponent enforces manifest target compatibility for --to path', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-targets-'));
    try {
        await writeWorkspaceScaffold(workspaceRoot);
        await writeComponent(workspaceRoot, 'app-only', ['app']);
        const host = createHost();

        const mismatch = await addComponent(workspaceRoot, host, 'local:app-only', {
            targetPath: 'packages/lib',
        });

        assert.equal(mismatch.ok, false);
        if (mismatch.ok) {
            return;
        }
        assert.equal(mismatch.error.code, 'component.target_incompatible');
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('addComponent installs when target kind matches manifest', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-targets-ok-'));
    try {
        await writeWorkspaceScaffold(workspaceRoot);
        await writeComponent(workspaceRoot, 'app-only', ['app']);
        const host = createHost();

        const result = await addComponent(workspaceRoot, host, 'local:app-only', {
            targetPath: 'apps/demo',
        });

        assert.equal(result.ok, true);
        if (!result.ok) {
            return;
        }
        const installed = await fs.readFile(
            path.join(workspaceRoot, 'apps', 'demo', 'src', 'feature.ts'),
            'utf8',
        );
        assert.equal(installed, 'export const feature = true;\n');
    } finally {
        await fs.remove(workspaceRoot);
    }
});
