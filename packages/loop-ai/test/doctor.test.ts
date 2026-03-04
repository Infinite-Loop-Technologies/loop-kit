import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { runAiDoctor } from '../src/index.js';

function workspaceConfig() {
    return {
        schemaVersion: '1',
        workspace: {
            name: 'loop-ai-test',
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

test('ai doctor does not apply by default', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-ai-doctor-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), workspaceConfig(), { spaces: 2 });
        const result = await runAiDoctor(workspaceRoot);
        assert.equal(result.applied, false);
        assert.equal(result.executionCount, 0);
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('ai doctor applies only with explicit apply flag', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-ai-doctor-apply-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), workspaceConfig(), { spaces: 2 });
        const result = await runAiDoctor(workspaceRoot, { apply: true });
        assert.equal(result.applied, true);
        assert.ok(result.executionCount >= 0);
    } finally {
        await fs.remove(workspaceRoot);
    }
});
