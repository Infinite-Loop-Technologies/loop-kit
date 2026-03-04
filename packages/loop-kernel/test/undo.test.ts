import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { createKernel } from '../src/kernel.js';

function baseWorkspaceConfig() {
    return {
        schemaVersion: '1',
        workspace: {
            name: 'undo-test',
            appsDir: 'apps',
            packagesDir: 'packages',
            assetsDir: 'assets',
            toolsDir: 'tools',
            loopDir: 'loop',
        },
        lanes: {
            workspace: { kind: 'local', config: {} },
        },
        defaults: {
            componentLane: 'workspace',
            moduleLane: 'workspace',
            refKindMap: {
                local: 'workspace',
                loop: 'workspace',
            },
            ciPipeline: 'ci',
        },
        modules: [],
        toolchains: [{ id: 'typescript', kind: 'typescript', config: {} }],
        components: {
            defaultTarget: '.',
            ignoreGlobs: [],
        },
        tasks: {},
        pipelines: {},
        overrides: {
            components: {},
            modules: {},
        },
    };
}

async function writeComponent(workspaceRoot: string, version: string, fileContent: string) {
    const componentRoot = path.join(workspaceRoot, 'loop', 'components', 'ui-button');
    await fs.ensureDir(path.join(componentRoot, 'files'));
    await fs.writeFile(path.join(componentRoot, 'files', 'button.tsx'), fileContent, 'utf8');
    await fs.writeJson(path.join(componentRoot, 'loop.component.json'), {
        schemaVersion: '1',
        kind: 'component',
        id: 'ui-button',
        name: 'ui-button',
        version,
        files: [{
            source: 'files/button.tsx',
            target: 'src/components/ui/button.tsx',
        }],
        patches: [],
        dependencies: [],
        targets: ['app', 'pkg'],
    }, { spaces: 2 });
}

test('add writes undo journal and undo restores pre-install state', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-undo-add-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), baseWorkspaceConfig(), { spaces: 2 });
        await fs.ensureDir(path.join(workspaceRoot, 'apps', 'demo'));
        await fs.writeJson(path.join(workspaceRoot, 'apps', 'demo', 'package.json'), {
            name: 'demo',
            version: '0.1.0',
            private: true,
        }, { spaces: 2 });
        await writeComponent(workspaceRoot, '0.1.0', 'export const Button = "v1";\n');

        const kernel = createKernel({ workspaceRoot });
        const added = await kernel.add('local:ui-button', {
            targetPath: 'apps/demo',
        });
        assert.equal(added.ok, true);
        if (!added.ok) {
            return;
        }
        assert.ok(added.value.undoId);

        const targetPath = path.join(workspaceRoot, 'apps', 'demo', 'src', 'components', 'ui', 'button.tsx');
        assert.equal(await fs.pathExists(targetPath), true);

        const undone = await kernel.undo(added.value.undoId ?? '');
        assert.equal(undone.ok, true);
        if (!undone.ok) {
            return;
        }

        assert.equal(await fs.pathExists(targetPath), false);
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('update undo restores previous installed content', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-undo-update-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), baseWorkspaceConfig(), { spaces: 2 });
        await fs.ensureDir(path.join(workspaceRoot, 'apps', 'demo'));
        await fs.writeJson(path.join(workspaceRoot, 'apps', 'demo', 'package.json'), {
            name: 'demo',
            version: '0.1.0',
            private: true,
        }, { spaces: 2 });
        await writeComponent(workspaceRoot, '0.1.0', 'export const Button = "v1";\n');

        const kernel = createKernel({ workspaceRoot });
        const added = await kernel.add('local:ui-button', { targetPath: 'apps/demo' });
        assert.equal(added.ok, true);
        if (!added.ok) {
            return;
        }

        await writeComponent(workspaceRoot, '0.2.0', 'export const Button = "v2";\n');
        const updated = await kernel.update('local:ui-button', { targetPath: 'apps/demo' });
        assert.equal(updated.ok, true);
        if (!updated.ok) {
            return;
        }
        assert.ok(updated.value.undoId);

        const targetPath = path.join(workspaceRoot, 'apps', 'demo', 'src', 'components', 'ui', 'button.tsx');
        assert.equal(await fs.readFile(targetPath, 'utf8'), 'export const Button = "v2";\n');

        const undone = await kernel.undo(updated.value.undoId ?? '');
        assert.equal(undone.ok, true);
        if (!undone.ok) {
            return;
        }

        assert.equal(await fs.readFile(targetPath, 'utf8'), 'export const Button = "v1";\n');
    } finally {
        await fs.remove(workspaceRoot);
    }
});
