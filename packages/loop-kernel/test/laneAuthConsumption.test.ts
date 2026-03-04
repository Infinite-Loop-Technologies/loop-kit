import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import {
    err,
    ok,
    type LaneResolveComponentRequest,
    type LaneResolveComponentResponse,
    type LaneResolveModuleRequest,
    type LaneResolveModuleResponse,
    type Result,
} from '@loop-kit/loop-contracts';
import { createKernel } from '../src/kernel.js';
import type { LaneProvider } from '../src/providers/capabilities/lane.js';

class AuthTrackingLocalLane implements LaneProvider {
    readonly id = 'auth-tracking-local';
    readonly kind = 'local';
    authTokens: string[] = [];
    private readonly baseDir: string;

    constructor(baseDir: string) {
        this.baseDir = baseDir;
    }

    async resolveComponent(
        request: LaneResolveComponentRequest,
    ): Promise<Result<LaneResolveComponentResponse>> {
        if (request.ref.kind !== 'local') {
            return err({
                code: 'lane.local.invalid_ref',
                message: `Unexpected ref kind ${request.ref.kind}`,
            });
        }

        return ok({
            manifest: {
                schemaVersion: '1',
                kind: 'component',
                id: 'auth-demo',
                name: 'auth-demo',
                version: '0.1.0',
                files: [
                    { source: 'files/hello.ts', target: 'src/hello.ts' },
                ],
                patches: [],
                dependencies: [],
                targets: ['app', 'pkg'],
            },
            baseDir: this.baseDir,
            snapshotId: 'snapshot-auth-demo',
        });
    }

    async resolveModule(
        request: LaneResolveModuleRequest,
    ): Promise<Result<LaneResolveModuleResponse>> {
        return err({
            code: 'lane.local.module_not_supported',
            message: `Module resolution not used in this test (${request.ref.kind}).`,
        });
    }

    async getAuthStatus(): Promise<{ authenticated: boolean; message?: string }> {
        return {
            authenticated: this.authTokens.length > 0,
            message: this.authTokens.length > 0 ? 'token consumed' : 'no token',
        };
    }

    async auth(token?: string): Promise<Result<{ authenticated: boolean; message?: string }>> {
        if (token) {
            this.authTokens.push(token);
        }

        return ok({
            authenticated: true,
            message: token ? 'token applied' : 'no token provided',
        });
    }
}

test('kernel consumes lane auth token before provider resolve', async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-kernel-lane-auth-'));
    try {
        const componentRoot = path.join(workspaceRoot, 'component-source');
        await fs.ensureDir(path.join(componentRoot, 'files'));
        await fs.writeFile(path.join(componentRoot, 'files', 'hello.ts'), 'export const hello = 1;\n', 'utf8');

        await fs.ensureDir(path.join(workspaceRoot, 'loop'));
        await fs.writeJson(path.join(workspaceRoot, 'loop', 'auth.json'), {
            schemaVersion: '1',
            lanes: {
                workspace: {
                    token: 'secret-token',
                    updatedAt: new Date().toISOString(),
                },
            },
        }, { spaces: 2 });

        await fs.writeJson(path.join(workspaceRoot, 'loop.json'), {
            schemaVersion: '1',
            workspace: {
                name: 'auth-consumption',
                appsDir: 'apps',
                packagesDir: 'packages',
                assetsDir: 'assets',
                toolsDir: 'tools',
                loopDir: 'loop',
            },
            lanes: {
                workspace: { kind: 'local', config: { root: '.' } },
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
            components: { defaultTarget: '.', ignoreGlobs: [] },
            tasks: {},
            pipelines: {},
            overrides: {
                components: {},
                modules: {},
            },
        }, { spaces: 2 });

        const kernel = createKernel({ workspaceRoot });
        const provider = new AuthTrackingLocalLane(componentRoot);
        kernel.providerHost.registerLaneProvider(provider);

        const diff = await kernel.diff('local:auth-demo');
        assert.equal(diff.ok, true);
        assert.deepEqual(provider.authTokens, ['secret-token']);
    } finally {
        await fs.remove(workspaceRoot);
    }
});
