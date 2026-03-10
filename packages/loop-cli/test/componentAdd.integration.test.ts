import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { handleAdd } from '../src/commands/component.js';

async function writeJson(filePath: string, value: unknown): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function createWorkspace(workspaceRoot: string): Promise<void> {
    await fs.mkdir(path.join(workspaceRoot, 'apps', 'demo'), { recursive: true });
    await fs.mkdir(path.join(workspaceRoot, 'packages', 'lib'), { recursive: true });
    await writeJson(path.join(workspaceRoot, 'apps', 'demo', 'package.json'), {
        name: 'demo',
        version: '0.1.0',
        private: true,
    });
    await writeJson(path.join(workspaceRoot, 'packages', 'lib', 'package.json'), {
        name: '@loop-kit/lib',
        version: '0.1.0',
    });
    await writeJson(path.join(workspaceRoot, 'loop.json'), {
        schemaVersion: '1',
        workspace: {
            name: 'tmp',
            appsDir: 'apps',
            packagesDir: 'packages',
            assetsDir: 'assets',
            toolsDir: 'tools',
            loopDir: 'loop',
        },
        lanes: {
            local: { kind: 'local', config: {} },
        },
        defaults: {
            componentLane: 'local',
            moduleLane: 'local',
            ciPipeline: 'ci',
            refKindMap: {
                local: 'local',
            },
        },
        modules: [],
        toolchains: [],
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
    });
}

async function createComponent(
    workspaceRoot: string,
    componentId: string,
    targets: Array<'app' | 'pkg'>,
): Promise<void> {
    const componentRoot = path.join(workspaceRoot, 'loop', 'components', componentId);
    await fs.mkdir(path.join(componentRoot, 'files'), { recursive: true });
    await fs.writeFile(path.join(componentRoot, 'files', 'Demo.tsx'), 'export const Demo = 1;\n', 'utf8');
    await writeJson(path.join(componentRoot, 'loop.component.json'), {
        schemaVersion: '1',
        kind: 'component',
        id: componentId,
        name: componentId,
        version: '0.1.0',
        files: [
            {
                source: 'files/Demo.tsx',
                target: 'src/Demo.tsx',
            },
        ],
        patches: [],
        dependencies: [],
        targets,
    });
}

test('handleAdd dry-run installs local component using repo-local CLI command path', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-cli-add-'));
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args: unknown[]) => {
        logs.push(args.map((arg) => String(arg)).join(' '));
    };

    try {
        await createWorkspace(workspaceRoot);
        await createComponent(workspaceRoot, 'ui-demo-starter', ['app']);

        await handleAdd('local:ui-demo-starter', {
            cwd: workspaceRoot,
            to: 'apps/demo',
            dryRun: true,
        });

        assert.ok(logs.some((line) => line.includes('Install component ui-demo-starter')));
    } finally {
        console.log = originalLog;
        await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
});

test('handleAdd reports target mismatch when destination kind is incompatible', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-cli-add-mismatch-'));
    try {
        await createWorkspace(workspaceRoot);
        await createComponent(workspaceRoot, 'ui-demo-starter', ['app']);

        await assert.rejects(
            () =>
                handleAdd('local:ui-demo-starter', {
                    cwd: workspaceRoot,
                    to: 'packages/lib',
                    dryRun: true,
                }),
            /targets \[app\].*resolves to "pkg"/i,
        );
    } finally {
        await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
});
