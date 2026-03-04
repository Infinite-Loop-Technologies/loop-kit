import {
    type PatchPlan,
    type PatchOperation,
} from '@loop-kit/loop-contracts';
import { stableStringify } from '../utils/json.js';

const DEFAULT_TSCONFIG_BASE = {
    compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        skipLibCheck: true,
    },
};

export type InitWorkspaceOptions = {
    name?: string;
    appsDir?: string;
    packagesDir?: string;
    assetsDir?: string;
    toolsDir?: string;
    loopDir?: string;
};

export function initWorkspacePlan(options: InitWorkspaceOptions = {}): PatchPlan {
    const name = options.name ?? 'loop-workspace';
    const appsDir = options.appsDir ?? 'apps';
    const packagesDir = options.packagesDir ?? 'packages';
    const assetsDir = options.assetsDir ?? 'assets';
    const toolsDir = options.toolsDir ?? 'tools';
    const loopDir = options.loopDir ?? 'loop';

    const ops: PatchOperation[] = [
        {
            kind: 'ensureFile',
            opId: 'init.loop-json',
            path: 'loop.json',
            overwrite: false,
            content: stableStringify({
                schemaVersion: '1',
                workspace: {
                    name,
                    appsDir,
                    packagesDir,
                    assetsDir,
                    toolsDir,
                    loopDir,
                },
                lanes: {
                    local: { kind: 'local', config: {} },
                    file: { kind: 'file', config: {} },
                },
                defaults: {
                    componentLane: 'local',
                    moduleLane: 'local',
                    refKindMap: {
                        local: 'local',
                        loop: 'local',
                        file: 'file',
                    },
                },
                modules: [],
                toolchains: [
                    { id: 'typescript', kind: 'typescript', options: {} },
                ],
                components: {
                    defaultTarget: '.',
                    ignoreGlobs: [],
                },
            }),
        },
        {
            kind: 'ensureFile',
            opId: 'init.pnpm-workspace',
            path: 'pnpm-workspace.yaml',
            overwrite: false,
            content: `packages:\n  - ${appsDir}/*\n  - ${packagesDir}/*\n`,
        },
        {
            kind: 'ensureFile',
            opId: 'init.tsconfig-base',
            path: 'tsconfig.base.json',
            overwrite: false,
            content: stableStringify(DEFAULT_TSCONFIG_BASE),
        },
        {
            kind: 'ensureFile',
            opId: 'init.apps',
            path: `${appsDir}/.gitkeep`,
            overwrite: false,
            content: '',
        },
        {
            kind: 'ensureFile',
            opId: 'init.packages',
            path: `${packagesDir}/.gitkeep`,
            overwrite: false,
            content: '',
        },
        {
            kind: 'ensureFile',
            opId: 'init.assets',
            path: `${assetsDir}/.gitkeep`,
            overwrite: false,
            content: '',
        },
        {
            kind: 'ensureFile',
            opId: 'init.tools',
            path: `${toolsDir}/.gitkeep`,
            overwrite: false,
            content: '',
        },
        {
            kind: 'ensureFile',
            opId: 'init.loop',
            path: `${loopDir}/.gitkeep`,
            overwrite: false,
            content: '',
        },
    ];

    return {
        id: 'workspace.init',
        title: 'Initialize loop workspace',
        provenance: {
            source: 'loop:init',
        },
        operations: ops,
        preconditions: [],
        postconditions: [],
    };
}
