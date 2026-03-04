import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { createLoopdServer } from '../src/rpc.js';

function workspaceConfig() {
    return {
        schemaVersion: '1',
        workspace: {
            name: 'loopd-test',
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
            ciPipeline: 'ci',
            refKindMap: {
                local: 'workspace',
                loop: 'workspace',
            },
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

test('loopd rpc returns components.list', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loopd-rpc-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), workspaceConfig(), { spaces: 2 });
        const componentRoot = path.join(workspaceRoot, 'loop', 'components', 'sample');
        await fs.ensureDir(componentRoot);
        await fs.writeJson(path.join(componentRoot, 'loop.component.json'), {
            schemaVersion: '1',
            kind: 'component',
            id: 'sample',
            name: 'sample',
            version: '0.1.0',
            files: [],
            patches: [],
            dependencies: [],
            targets: ['app', 'pkg'],
        }, { spaces: 2 });

        const server = createLoopdServer(workspaceRoot);
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
        const address = server.address();
        assert.ok(address && typeof address === 'object');
        if (!address || typeof address !== 'object') {
            return;
        }

        const response = await fetch(`http://127.0.0.1:${address.port}/rpc`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                id: '1',
                method: 'components.list',
                params: {},
            }),
        });
        assert.equal(response.status, 200);
        const body = await response.json() as { result?: Array<{ id: string }> };
        assert.ok(Array.isArray(body.result));
        assert.equal(body.result?.[0]?.id, 'sample');

        await new Promise<void>((resolve) => server.close(() => resolve()));
    } finally {
        await fs.remove(workspaceRoot);
    }
});
