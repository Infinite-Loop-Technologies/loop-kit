import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import type { LoopWorkspaceConfig, PatchPlan } from '@loop-kit/loop-contracts';
import { ProviderHost } from '../src/providers/host.js';
import { LocalLaneProvider } from '../src/lanes/builtin/localLane.js';
import { addComponent } from '../src/components/add.js';
import { updateComponent } from '../src/components/update.js';
import { readComponentLockfile } from '../src/components/lockfile.js';

function workspaceConfig(): LoopWorkspaceConfig {
    return {
        schemaVersion: '1',
        workspace: {
            name: 'lockfile-test',
            appsDir: 'apps',
            packagesDir: 'packages',
            assetsDir: 'assets',
            toolsDir: 'tools',
            loopDir: 'loop',
        },
        lanes: {
            local: { kind: 'local', config: {} },
            file: { kind: 'file', config: {} },
        },
        defaults: {
            componentLane: 'local',
            moduleLane: 'local',
            refKindMap: {
                local: 'local',
                loop: 'local',
                file: 'file',
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

function failingPatchPlan(): PatchPlan {
    return {
        id: 'component.patch.fail',
        title: 'Fail on missing file',
        provenance: {
            source: 'test',
        },
        operations: [
            {
                kind: 'applyUnifiedDiff',
                opId: 'component.patch.fail.diff',
                path: 'missing.txt',
                diff: '--- a/missing.txt\n+++ b/missing.txt\n@@ -1 +1 @@\n-a\n+b\n',
            },
        ],
        preconditions: [],
        postconditions: [],
    };
}

test('add does not update lockfile when patch execution fails', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-lockfile-add-fail-'));
    try {
        const host = new ProviderHost();
        host.registerLaneProvider(new LocalLaneProvider());

        const componentRoot = path.join(workspaceRoot, 'loop', 'components', 'bad-add');
        await fs.ensureDir(path.join(componentRoot, 'files'));
        await fs.writeFile(path.join(componentRoot, 'files', 'hello.ts'), 'export const hello = "v1";\n', 'utf8');
        await fs.writeJson(path.join(componentRoot, 'loop.component.json'), {
            schemaVersion: '1',
            kind: 'component',
            id: 'bad-add',
            name: 'bad-add',
            version: '0.1.0',
            files: [
                {
                    source: 'files/hello.ts',
                    target: 'src/hello.ts',
                },
            ],
            patches: [failingPatchPlan()],
            dependencies: [],
            targets: ['app', 'pkg'],
        }, { spaces: 2 });

        const added = await addComponent(workspaceRoot, host, 'local:bad-add', {
            targetPath: 'apps/demo',
            workspaceConfig: workspaceConfig(),
        });

        assert.equal(added.ok, true);
        if (!added.ok) {
            return;
        }

        assert.equal(added.value.execution.applied, false);
        const lockfile = await readComponentLockfile(workspaceRoot);
        assert.equal(lockfile.installs.length, 0);
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('update does not mutate lockfile when patch execution fails', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-lockfile-update-fail-'));
    try {
        const host = new ProviderHost();
        host.registerLaneProvider(new LocalLaneProvider());
        await fs.ensureDir(path.join(workspaceRoot, 'apps', 'demo'));
        await fs.writeJson(path.join(workspaceRoot, 'apps', 'demo', 'package.json'), {
            name: 'demo',
            version: '0.1.0',
            private: true,
        }, { spaces: 2 });

        const componentRoot = path.join(workspaceRoot, 'loop', 'components', 'bad-update');
        await fs.ensureDir(path.join(componentRoot, 'files'));
        await fs.writeFile(path.join(componentRoot, 'files', 'hello.ts'), 'export const hello = "v1";\n', 'utf8');
        await fs.writeJson(path.join(componentRoot, 'loop.component.json'), {
            schemaVersion: '1',
            kind: 'component',
            id: 'bad-update',
            name: 'bad-update',
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

        const added = await addComponent(workspaceRoot, host, 'local:bad-update', {
            targetPath: 'apps/demo',
            workspaceConfig: workspaceConfig(),
        });
        assert.equal(added.ok, true);
        if (!added.ok) {
            return;
        }
        assert.equal(added.value.execution.applied, true);

        const beforeLockfile = await readComponentLockfile(workspaceRoot);
        assert.equal(beforeLockfile.installs.length, 1);

        await fs.writeFile(path.join(componentRoot, 'files', 'hello.ts'), 'export const hello = "v2";\n', 'utf8');
        await fs.writeJson(path.join(componentRoot, 'loop.component.json'), {
            schemaVersion: '1',
            kind: 'component',
            id: 'bad-update',
            name: 'bad-update',
            version: '0.2.0',
            files: [
                {
                    source: 'files/hello.ts',
                    target: 'src/hello.ts',
                },
            ],
            patches: [failingPatchPlan()],
            dependencies: [],
            targets: ['app', 'pkg'],
        }, { spaces: 2 });

        const updated = await updateComponent(workspaceRoot, host, 'local:bad-update', {
            targetPath: 'apps/demo',
            workspaceConfig: workspaceConfig(),
        });

        assert.equal(updated.ok, true);
        if (!updated.ok) {
            return;
        }
        assert.equal(updated.value.execution.applied, false);

        const afterLockfile = await readComponentLockfile(workspaceRoot);
        assert.deepEqual(afterLockfile, beforeLockfile);
    } finally {
        await fs.remove(workspaceRoot);
    }
});
