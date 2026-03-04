import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    LoopWorkspaceConfigSchema,
    UndoJournalEntrySchema,
    UndoJournalIndexSchema,
} from '../src/index.js';

test('workspace normalizes legacy toolchain options to config', () => {
    const parsed = LoopWorkspaceConfigSchema.safeParse({
        schemaVersion: '1',
        workspace: {
            name: 'loop-kit',
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
        },
        modules: [],
        toolchains: [{ id: 'typescript', kind: 'typescript', options: { strict: true } }],
        tasks: {},
        pipelines: {},
        components: { defaultTarget: '.', ignoreGlobs: [] },
    });

    assert.equal(parsed.success, true);
    if (!parsed.success) {
        return;
    }

    assert.deepEqual(parsed.data.toolchains[0]?.config, { strict: true });
});

test('workspace validates task deps and pipeline references', () => {
    const parsed = LoopWorkspaceConfigSchema.safeParse({
        schemaVersion: '1',
        workspace: {
            name: 'loop-kit',
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
        },
        modules: [],
        toolchains: [{ id: 'typescript', kind: 'typescript', config: {} }],
        tasks: {
            build: { command: 'pnpm', args: ['-r', 'run', 'build'] },
            test: { command: 'pnpm', args: ['-r', 'run', 'test'], deps: ['build'] },
        },
        pipelines: {
            ci: { tasks: ['build', 'test'] },
        },
        components: { defaultTarget: '.', ignoreGlobs: [] },
    });

    assert.equal(parsed.success, true);
});

test('workspace override validates lane ids by exact ref key', () => {
    const parsed = LoopWorkspaceConfigSchema.safeParse({
        schemaVersion: '1',
        workspace: {
            name: 'loop-kit',
            appsDir: 'apps',
            packagesDir: 'packages',
            assetsDir: 'assets',
            toolsDir: 'tools',
            loopDir: 'loop',
        },
        lanes: {
            workspace: { kind: 'local', config: {} },
            shared: { kind: 'file', config: {} },
        },
        defaults: {
            componentLane: 'workspace',
            moduleLane: 'workspace',
        },
        modules: [],
        toolchains: [{ id: 'typescript', kind: 'typescript', config: {} }],
        components: { defaultTarget: '.', ignoreGlobs: [] },
        overrides: {
            components: {
                'loop://ui/button': { laneId: 'shared', ref: 'file:../shared/components/ui/button' },
            },
            modules: {
                'loop://core/provider': { laneId: 'workspace' },
            },
        },
    });

    assert.equal(parsed.success, true);
});

test('undo schemas validate persisted journal and index payloads', () => {
    const entry = UndoJournalEntrySchema.safeParse({
        schemaVersion: '1',
        undoId: '20260304T120000-component.add.ui-button',
        planId: 'component.add.ui-button',
        title: 'Install ui-button',
        createdAt: '2026-03-04T12:00:00.000Z',
        source: 'loop:add',
        workspaceRoot: '/tmp/workspace',
        plan: {
            id: 'component.add.ui-button',
            title: 'Install ui-button',
            provenance: { source: 'loop:add' },
            operations: [],
            preconditions: [],
            postconditions: [],
        },
        touchedFiles: ['apps/demo/src/components/ui/button.tsx'],
        before: [{ path: 'apps/demo/src/components/ui/button.tsx', existed: false }],
        after: [{
            path: 'apps/demo/src/components/ui/button.tsx',
            existed: true,
            content: 'export const Button = () => null;\n',
        }],
    });
    assert.equal(entry.success, true);

    const index = UndoJournalIndexSchema.safeParse({
        schemaVersion: '1',
        entries: [{
            undoId: '20260304T120000-component.add.ui-button',
            planId: 'component.add.ui-button',
            title: 'Install ui-button',
            createdAt: '2026-03-04T12:00:00.000Z',
            source: 'loop:add',
            journalPath: 'loop/undo/20260304T120000-component.add.ui-button/journal.json',
        }],
    });
    assert.equal(index.success, true);
});
