import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { executePatchPlan } from '../src/patch/executor.js';
import type { FsGateway } from '../src/io/fsGateway.js';

test('patch executor is idempotent for ensureFile + ensureDependency', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-patch-'));
    try {
        await fs.writeJson(path.join(workspaceRoot, 'package.json'), {
            name: 'fixture',
            version: '0.0.0',
        }, { spaces: 2 });

        const plan = {
            id: 'test.plan',
            title: 'test',
            provenance: { source: 'test' },
            operations: [
                {
                    kind: 'ensureFile' as const,
                    opId: 'ensure.readme',
                    path: 'README.md',
                    content: '# hello\n',
                    overwrite: false,
                },
                {
                    kind: 'ensureDependency' as const,
                    opId: 'ensure.dep',
                    packageJsonPath: 'package.json',
                    dependencyType: 'dependencies' as const,
                    name: 'zod',
                    version: '^4.1.11',
                },
            ],
            preconditions: [],
            postconditions: [],
        };

        const first = await executePatchPlan(plan, {
            workspaceRoot,
        });

        assert.equal(first.applied, true);
        assert.ok(first.changedFiles.includes('README.md'));
        assert.ok(first.changedFiles.includes('package.json'));

        const second = await executePatchPlan(plan, {
            workspaceRoot,
        });

        assert.equal(second.applied, true);
        assert.equal(second.changedFiles.length, 0);
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('patch executor dry-run does not write files', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-dryrun-'));
    try {
        const plan = {
            id: 'test.plan.dry',
            title: 'dry',
            provenance: { source: 'test' },
            operations: [
                {
                    kind: 'ensureFile' as const,
                    opId: 'dry.file',
                    path: 'dry.txt',
                    content: 'dry\n',
                    overwrite: true,
                },
            ],
            preconditions: [],
            postconditions: [],
        };

        const result = await executePatchPlan(plan, {
            workspaceRoot,
            dryRun: true,
        });

        assert.equal(result.applied, false);
        assert.equal(await fs.pathExists(path.join(workspaceRoot, 'dry.txt')), false);
        assert.ok(result.diffByFile['dry.txt'].includes('+dry'));
    } finally {
        await fs.remove(workspaceRoot);
    }
});

test('patch executor rolls back on commit failure', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-rollback-'));
    const writes: string[] = [];

    const flakyFs: FsGateway = {
        async exists(filePath) {
            return fs.pathExists(filePath);
        },
        async readText(filePath) {
            return fs.readFile(filePath, 'utf8');
        },
        async writeText(filePath, content) {
            writes.push(filePath);
            if (writes.length === 2) {
                throw new Error('simulated write failure');
            }
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, content, 'utf8');
        },
        async remove(filePath) {
            await fs.remove(filePath);
        },
        async mkdirp(dirPath) {
            await fs.ensureDir(dirPath);
        },
        async stat(filePath) {
            const value = await fs.stat(filePath);
            return { mtimeMs: value.mtimeMs };
        },
        async readJson(filePath) {
            return fs.readJson(filePath) as Promise<any>;
        },
        async writeJson(filePath, value) {
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeJson(filePath, value, { spaces: 2 });
        },
        async readdir(dirPath) {
            return fs.readdir(dirPath);
        },
        async copyFile(source, target) {
            await fs.ensureDir(path.dirname(target));
            await fs.copyFile(source, target);
        },
    };

    try {
        const plan = {
            id: 'test.plan.rollback',
            title: 'rollback',
            provenance: { source: 'test' },
            operations: [
                {
                    kind: 'ensureFile' as const,
                    opId: 'rollback.a',
                    path: 'a.txt',
                    content: 'a\n',
                    overwrite: true,
                },
                {
                    kind: 'ensureFile' as const,
                    opId: 'rollback.b',
                    path: 'b.txt',
                    content: 'b\n',
                    overwrite: true,
                },
            ],
            preconditions: [],
            postconditions: [],
        };

        const result = await executePatchPlan(plan, {
            workspaceRoot,
            fs: flakyFs,
        });

        assert.equal(result.applied, false);
        assert.equal(result.diagnostics.some((item) => item.id === 'patch.commit_failed'), true);
        assert.equal(await fs.pathExists(path.join(workspaceRoot, 'a.txt')), false);
        assert.equal(await fs.pathExists(path.join(workspaceRoot, 'b.txt')), false);
    } finally {
        await fs.remove(workspaceRoot);
    }
});
