import path from 'node:path';
import {
    err,
    ok,
    type LoopWorkspaceConfig,
    type Result,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';
import type { ProviderHost } from '../providers/host.js';
import type { LaneProvider } from '../providers/capabilities/lane.js';
import { executePatchPlan } from '../patch/executor.js';
import { sha256 } from '../utils/hash.js';
import type { UpdateComponentResult } from '../types.js';
import { buildComponentInstallPlan } from './plan.js';
import {
    captureFileStates,
    collectPatchPlanTouchedFiles,
} from '../undo/snapshot.js';
import {
    findInstallRecord,
    readComponentLockfile,
    upsertInstallRecord,
    writeComponentLockfile,
} from './lockfile.js';
import { resolveComponentRef } from './resolve.js';
import {
    normalizeTargetPath,
    validateComponentTargetCompatibility,
} from './target.js';

function fallbackWorkspaceConfig(): LoopWorkspaceConfig {
    return {
        schemaVersion: '1',
        workspace: {
            name: 'loop-workspace',
            appsDir: 'apps',
            packagesDir: 'packages',
            assetsDir: 'assets',
            toolsDir: 'tools',
            loopDir: 'loop',
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
            ciPipeline: 'ci',
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

export async function updateComponent(
    workspaceRoot: string,
    host: ProviderHost,
    refText: string,
    options: {
        targetPath?: string;
        force?: boolean;
        dryRun?: boolean;
        fs?: FsGateway;
        workspaceConfig?: LoopWorkspaceConfig;
        authenticateLane?: (
            laneId: string,
            provider: LaneProvider,
        ) => Promise<Result<void>>;
    } = {},
): Promise<Result<UpdateComponentResult>> {
    const fs = options.fs ?? nodeFsGateway;
    const workspaceConfig = options.workspaceConfig ?? fallbackWorkspaceConfig();
    const resolved = await resolveComponentRef(
        workspaceRoot,
        host,
        workspaceConfig,
        refText,
        {
            authenticateLane: options.authenticateLane,
        },
    );
    if (!resolved.ok) {
        return resolved;
    }

    const lockfile = await readComponentLockfile(workspaceRoot, fs);
    const normalizedTarget = normalizeTargetPath(
        workspaceRoot,
        options.targetPath,
        options.targetPath ? '.' : '',
    );
    const existing = findInstallRecord(lockfile, resolved.value.manifest.id, normalizedTarget);

    if (!existing) {
        return err({
            code: 'component.update_not_installed',
            message: `Component ${resolved.value.manifest.id} is not installed in the target workspace.`,
        });
    }

    const targetValidation = validateComponentTargetCompatibility(
        resolved.value.manifest,
        existing.targetPath,
        workspaceConfig,
    );
    if (!targetValidation.ok) {
        return targetValidation;
    }

    if (existing.snapshotId === resolved.value.snapshotId) {
        return ok({
            plan: {
                id: `component.update.${resolved.value.manifest.id}`,
                title: `Update component ${resolved.value.manifest.id}`,
                provenance: {
                    source: 'loop:update',
                    componentId: resolved.value.manifest.id,
                    snapshotId: resolved.value.snapshotId,
                },
                operations: [],
                preconditions: [],
                postconditions: [],
            },
            execution: {
                applied: false,
                operationResults: [],
                changedFiles: [],
                diffByFile: {},
                diagnostics: [],
            },
            lockfile,
        });
    }

    if (!options.force) {
        for (const managedFile of existing.managedFiles) {
            const absolutePath = path.resolve(workspaceRoot, managedFile.path);
            if (!(await fs.exists(absolutePath))) {
                continue;
            }

            const currentContent = await fs.readText(absolutePath);
            const currentHash = sha256(currentContent);
            if (currentHash !== managedFile.sha256) {
                return err({
                    code: 'component.update_conflict',
                    message: `Local modifications detected in ${managedFile.path}. Re-run with --force to overwrite.`,
                    details: {
                        path: managedFile.path,
                    },
                });
            }
        }
    }

    const plan = await buildComponentInstallPlan(resolved.value.manifest, {
        componentBaseDir: resolved.value.baseDir,
        targetPath: existing.targetPath,
        overwriteFiles: true,
        fs,
    });
    const touchedFiles = collectPatchPlanTouchedFiles(plan);
    const before = await captureFileStates(workspaceRoot, touchedFiles, fs);

    const execution = await executePatchPlan(plan, {
        workspaceRoot,
        dryRun: options.dryRun,
        fs,
    });
    const after = execution.applied
        ? await captureFileStates(workspaceRoot, touchedFiles, fs)
        : before;

    if (options.dryRun || !execution.applied) {
        return ok({
            plan,
            execution,
            lockfile,
            undoSnapshot: {
                touchedFiles,
                before,
                after,
            },
        });
    }

    const managedFiles = [] as Array<{ path: string; sha256: string; mtimeMs: number }>;
    for (const entry of resolved.value.manifest.files) {
        const relativePath = path.normalize(path.join(existing.targetPath, entry.target));
        const absolutePath = path.resolve(workspaceRoot, relativePath);
        if (!(await fs.exists(absolutePath))) {
            continue;
        }

        const content = await fs.readText(absolutePath);
        const stat = await fs.stat(absolutePath);
        managedFiles.push({
            path: relativePath,
            sha256: sha256(content),
            mtimeMs: stat.mtimeMs,
        });
    }

    const nextLockfile = upsertInstallRecord(lockfile, {
        ...existing,
        snapshotId: resolved.value.snapshotId,
        laneId: resolved.value.laneId,
        ref: refText,
        installedAt: new Date().toISOString(),
        managedFiles,
    });

    await writeComponentLockfile(workspaceRoot, nextLockfile, fs);

    return ok({
        plan,
        execution,
        lockfile: nextLockfile,
        undoSnapshot: {
            touchedFiles,
            before,
            after,
        },
    });
}
