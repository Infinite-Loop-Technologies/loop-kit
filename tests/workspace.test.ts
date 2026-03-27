import { describe, expect, test } from 'bun:test';

import { orderWorkspacesForTask, type WorkspaceManifest } from '../tools/workspace';

describe('workspace runner planning', () => {
    test('orders build tasks by workspace dependencies', () => {
        const manifests: WorkspaceManifest[] = [
            {
                dir: 'apps/forge',
                name: '@loop-kit/forge',
                scripts: ['build', 'typecheck'],
                workspaceDeps: ['@loop-kit/ui'],
            },
            {
                dir: 'packages/ui',
                name: '@loop-kit/ui',
                scripts: ['build', 'test', 'typecheck'],
                workspaceDeps: ['@loop-kit/dock'],
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
            '@loop-kit/ui',
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
                dir: 'apps/ui-demo',
                name: '@loop-kit/ui-demo',
                scripts: ['build', 'typecheck'],
                workspaceDeps: [],
            },
        ];

        expect(orderWorkspacesForTask(manifests, 'typecheck').map((manifest) => manifest.name)).toEqual([
            '@loop-kit/ui-demo',
        ]);
    });
});
