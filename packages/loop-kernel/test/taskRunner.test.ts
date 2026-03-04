import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import type { TaskEvent } from '@loop-kit/loop-contracts';
import { createKernel } from '../src/kernel.js';

function taskWorkspaceConfig() {
    return {
        schemaVersion: '1',
        workspace: {
            name: 'task-runner',
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
        components: { defaultTarget: '.', ignoreGlobs: [] },
        tasks: {
            prep: {
                command: 'node',
                args: ['-e', 'const fs=require("node:fs");fs.writeFileSync("prep.txt","ok\\n")'],
            },
            build: {
                command: 'node',
                args: ['-e', 'const fs=require("node:fs");fs.writeFileSync("build.txt","ok\\n")'],
                deps: ['prep'],
            },
            test: {
                command: 'node',
                args: ['-e', 'const fs=require("node:fs");fs.writeFileSync("test.txt","ok\\n")'],
                deps: ['build'],
            },
            fail: {
                command: 'node',
                args: ['-e', 'process.exit(9)'],
            },
            blocked: {
                command: 'node',
                args: ['-e', 'const fs=require("node:fs");fs.writeFileSync("blocked.txt","no\\n")'],
                deps: ['fail'],
            },
        },
        pipelines: {
            ci: {
                tasks: ['test'],
            },
        },
        overrides: {
            components: {},
            modules: {},
        },
    };
}

test('runTask executes deps in order and emits task events', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-run-task-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), taskWorkspaceConfig(), { spaces: 2 });

        const kernel = createKernel({ workspaceRoot });
        const events: TaskEvent[] = [];
        const result = await kernel.runTask('test', {
            onEvent: (event) => events.push(event),
        });
        assert.equal(result.ok, true);
        if (!result.ok) {
            return;
        }

        assert.equal(result.value.summary.taskId, 'test');
        assert.deepEqual(
            result.value.tasks.map((task) => task.taskId),
            ['prep', 'build', 'test'],
        );
        assert.ok(await fs.pathExists(path.join(workspaceRoot, 'prep.txt')));
        assert.ok(await fs.pathExists(path.join(workspaceRoot, 'build.txt')));
        assert.ok(await fs.pathExists(path.join(workspaceRoot, 'test.txt')));

        const startEvents = events.filter((event) => event.type === 'task.start');
        assert.deepEqual(startEvents.map((event) => event.taskId), ['prep', 'build', 'test']);
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('runTask short-circuits dependents when a dependency fails', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-run-task-fail-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), taskWorkspaceConfig(), { spaces: 2 });
        const kernel = createKernel({ workspaceRoot });
        const result = await kernel.runTask('blocked');
        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, 'task.not_executed');
        }
        assert.equal(await fs.pathExists(path.join(workspaceRoot, 'blocked.txt')), false);
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('ci runs configured pipeline and emits pipeline events', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-ci-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), taskWorkspaceConfig(), { spaces: 2 });
        const kernel = createKernel({ workspaceRoot });
        const events: TaskEvent[] = [];
        const result = await kernel.ci({
            onEvent: (event) => events.push(event),
        });
        assert.equal(result.ok, true);
        if (!result.ok) {
            return;
        }

        assert.equal(result.value.pipelineId, 'ci');
        assert.equal(result.value.success, true);
        assert.ok(events.some((event) => event.type === 'pipeline.start'));
        assert.ok(events.some((event) => event.type === 'pipeline.finish'));
    } finally {
        await fs.remove(workspaceRoot);
    }
});
