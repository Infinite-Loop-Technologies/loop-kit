import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { LocalLaneProvider } from '../src/lanes/builtin/localLane.js';
import { FileLaneProvider } from '../src/lanes/builtin/fileLane.js';
import { ProviderHost } from '../src/providers/host.js';
import { resolveComponentRef } from '../src/components/resolve.js';
import { createKernel } from '../src/kernel.js';

test('component resolution uses workspace defaults.refKindMap lane instance', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-lane-routing-'));
    try {
        const remoteRoot = path.join(workspaceRoot, 'remote', 'components', 'design', 'button');
        await fs.ensureDir(path.join(remoteRoot, 'files'));
        await fs.writeFile(path.join(remoteRoot, 'files', 'button.tsx'), 'export const button = 1;\n', 'utf8');
        await fs.writeJson(path.join(remoteRoot, 'loop.component.json'), {
            schemaVersion: '1',
            kind: 'component',
            id: 'design-button',
            name: 'design-button',
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

        const host = new ProviderHost();
        host.registerLaneProvider(new LocalLaneProvider());
        host.registerLaneProvider(new FileLaneProvider());

        const config = {
            schemaVersion: '1' as const,
            workspace: {
                name: 'lane-routing',
                appsDir: 'apps',
                packagesDir: 'packages',
                assetsDir: 'assets',
                toolsDir: 'tools',
                loopDir: 'loop',
            },
            lanes: {
                workspace: {
                    kind: 'local',
                    config: { root: '.' },
                },
                shared: {
                    kind: 'file',
                    config: { path: 'remote' },
                },
            },
            defaults: {
                componentLane: 'workspace',
                moduleLane: 'workspace',
                refKindMap: {
                    loop: 'shared',
                    local: 'workspace',
                    file: 'shared',
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

        const resolved = await resolveComponentRef(
            workspaceRoot,
            host,
            config,
            'loop://design/button',
        );
        assert.equal(resolved.ok, true);
        if (!resolved.ok) {
            return;
        }

        assert.equal(resolved.value.laneId, 'shared');
        assert.equal(resolved.value.manifest.id, 'design-button');
        assert.equal(
            resolved.value.baseDir,
            path.resolve(workspaceRoot, 'remote', 'components', 'design', 'button'),
        );
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('lane list resolves providers by lane kind when instance id differs', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-lane-list-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), {
            schemaVersion: '1',
            workspace: {
                name: 'lane-list',
                appsDir: 'apps',
                packagesDir: 'packages',
                assetsDir: 'assets',
                toolsDir: 'tools',
                loopDir: 'loop',
            },
            lanes: {
                workspace: { kind: 'local', config: { root: '.' } },
                official: { kind: 'http', config: { url: 'https://example.invalid' } },
            },
            defaults: {
                componentLane: 'workspace',
                moduleLane: 'workspace',
                refKindMap: {
                    local: 'workspace',
                    loop: 'workspace',
                    http: 'official',
                },
                ciPipeline: 'ci',
            },
            modules: [],
            toolchains: [{ id: 'typescript', kind: 'typescript', config: {} }],
            components: { defaultTarget: '.', ignoreGlobs: [] },
            tasks: {},
            pipelines: {},
            overrides: {
                components: {},
                modules: {},
            },
        }, { spaces: 2 });

        const kernel = createKernel({ workspaceRoot });
        const result = await kernel.laneList();
        assert.equal(result.ok, true);
        if (!result.ok) {
            return;
        }

        const workspaceLane = result.value.find((item) => item.laneId === 'workspace');
        assert.ok(workspaceLane);
        if (workspaceLane) {
            assert.equal(workspaceLane.lane.kind, 'local');
            assert.equal(workspaceLane.authenticated, true);
            assert.notEqual(workspaceLane.message, 'No provider registered for lane.');
        }
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('component override routes exact ref to override lane and ref', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-lane-override-'));
    try {
        const remoteRoot = path.join(workspaceRoot, 'remote', 'components', 'design', 'button');
        await fs.ensureDir(path.join(remoteRoot, 'files'));
        await fs.writeFile(path.join(remoteRoot, 'files', 'button.tsx'), 'export const button = 2;\n', 'utf8');
        await fs.writeJson(path.join(remoteRoot, 'loop.component.json'), {
            schemaVersion: '1',
            kind: 'component',
            id: 'design-button',
            name: 'design-button',
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

        const host = new ProviderHost();
        host.registerLaneProvider(new LocalLaneProvider());
        host.registerLaneProvider(new FileLaneProvider());

        const config = {
            schemaVersion: '1' as const,
            workspace: {
                name: 'lane-override',
                appsDir: 'apps',
                packagesDir: 'packages',
                assetsDir: 'assets',
                toolsDir: 'tools',
                loopDir: 'loop',
            },
            lanes: {
                workspace: {
                    kind: 'local',
                    config: { root: '.' },
                },
                shared: {
                    kind: 'file',
                    config: { path: 'remote' },
                },
            },
            defaults: {
                componentLane: 'workspace',
                moduleLane: 'workspace',
                refKindMap: {
                    loop: 'workspace',
                    local: 'workspace',
                    file: 'shared',
                },
                ciPipeline: 'ci',
            },
            modules: [],
            toolchains: [{ id: 'typescript', kind: 'typescript', config: {} }],
            tasks: {},
            pipelines: {},
            overrides: {
                components: {
                    'loop://design/button': {
                        laneId: 'shared',
                        ref: 'loop://design/button',
                    },
                },
                modules: {},
            },
            components: {
                defaultTarget: '.',
                ignoreGlobs: [],
            },
        };

        const resolved = await resolveComponentRef(
            workspaceRoot,
            host,
            config,
            'loop://design/button',
        );
        assert.equal(resolved.ok, true);
        if (!resolved.ok) {
            return;
        }

        assert.equal(resolved.value.laneId, 'shared');
        assert.equal(resolved.value.manifest.id, 'design-button');
    } finally {
        await fs.remove(workspaceRoot);
    }
});
