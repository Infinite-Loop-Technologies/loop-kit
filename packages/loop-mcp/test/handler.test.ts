import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { handleMcpRequest } from '../src/index.js';

function workspaceConfig() {
    return {
        schemaVersion: '1',
        workspace: {
            name: 'loop-mcp-test',
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

test('initialize returns tool list', async () => {
    const response = await handleMcpRequest(process.cwd(), {
        id: '1',
        type: 'initialize',
    });

    assert.equal(response.type, 'initialize.result');
    const result = response.result as { tools?: string[] };
    assert.ok(Array.isArray(result.tools));
    assert.ok(result.tools?.includes('loop.search_components'));
});

test('search_components returns catalog entries', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-mcp-test-'));
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

        const response = await handleMcpRequest(workspaceRoot, {
            id: '2',
            type: 'tool.call',
            tool: 'loop.search_components',
            arguments: { query: 'sample' },
        });
        assert.equal(response.type, 'tool.result');
        const result = response.result as Array<{ id: string }>;
        assert.equal(result[0]?.id, 'sample');
    } finally {
        await fs.remove(workspaceRoot);
    }
});
