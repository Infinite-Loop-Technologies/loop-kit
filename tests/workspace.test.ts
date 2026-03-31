import { describe, expect, test } from 'bun:test';

import { orderWorkspacesForTask, type WorkspaceManifest } from '../tools/workspace';

describe('workspace runner planning', () => {
    test('orders build tasks by workspace dependencies', () => {
        const manifests: WorkspaceManifest[] = [
            {
                dir: 'apps/forge',
                name: '@loop-kit/forge',
                scripts: ['build', 'typecheck'],
                workspaceDeps: ['@loop-kit/loom-pack-dock', '@loop-kit/loom-react'],
            },
            {
                dir: 'packages/loom-pack-dock',
                name: '@loop-kit/loom-pack-dock',
                scripts: ['build', 'test', 'typecheck'],
                workspaceDeps: ['@loop-kit/dock', '@loop-kit/loom-react'],
            },
            {
                dir: 'packages/loom-react',
                name: '@loop-kit/loom-react',
                scripts: ['build', 'test', 'typecheck'],
                workspaceDeps: ['@loop-kit/loom-core'],
            },
            {
                dir: 'packages/loom-core',
                name: '@loop-kit/loom-core',
                scripts: ['build', 'test', 'typecheck'],
                workspaceDeps: [],
            },
            {
                dir: 'packages/dock',
                name: '@loop-kit/dock',
                scripts: ['build', 'test', 'typecheck'],
                workspaceDeps: [],
            },
        ];

        expect(orderWorkspacesForTask(manifests, 'build').map((manifest) => manifest.name)).toEqual([
            '@loop-kit/dock',
            '@loop-kit/loom-core',
            '@loop-kit/loom-react',
            '@loop-kit/loom-pack-dock',
            '@loop-kit/forge',
        ]);
    });

    test('skips workspaces that do not define the requested task', () => {
        const manifests: WorkspaceManifest[] = [
            {
                dir: 'packages/graphite',
                name: '@loop-kit/graphite',
                scripts: ['build'],
                workspaceDeps: [],
            },
            {
                dir: 'apps/dock-demo',
                name: '@loop-kit/dock-demo',
                scripts: ['build', 'typecheck'],
                workspaceDeps: [],
            },
        ];

        expect(orderWorkspacesForTask(manifests, 'typecheck').map((manifest) => manifest.name)).toEqual([
            '@loop-kit/dock-demo',
        ]);
    });
});
