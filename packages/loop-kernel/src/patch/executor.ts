import path from 'node:path';
import { createPatch } from 'diff';
import {
    type Diagnostic,
    type OperationResult,
    type PatchOperation,
    type PatchPlan,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';
import type { PatchExecutionResult } from '../types.js';
import {
    applyJsonMergePatchHandler,
    applyUnifiedDiffHandler,
    ensureDependencyHandler,
    ensureExportsEntryHandler,
    ensureFileHandler,
    ensureSentinelBlockHandler,
    ensureTsconfigExtendsHandler,
    tsEnsureImportAndWrapReactRootHandler,
    type BufferedFile,
    type OperationHandler,
    type PatchExecutionRuntime,
} from './ops/index.js';

const operationHandlers: Record<PatchOperation['kind'], OperationHandler<any>> = {
    ensureDependency: ensureDependencyHandler,
    ensureExportsEntry: ensureExportsEntryHandler,
    ensureTsconfigExtends: ensureTsconfigExtendsHandler,
    ensureFile: ensureFileHandler,
    ensureSentinelBlock: ensureSentinelBlockHandler,
    applyJsonMergePatch: applyJsonMergePatchHandler,
    applyUnifiedDiff: applyUnifiedDiffHandler,
    tsEnsureImportAndWrapReactRoot: tsEnsureImportAndWrapReactRootHandler,
};

type ExecutePatchPlanOptions = {
    workspaceRoot: string;
    dryRun?: boolean;
    fs?: FsGateway;
};

class BufferedFilesystem {
    private readonly files = new Map<string, BufferedFile>();

    constructor(
        private readonly workspaceRoot: string,
        private readonly fs: FsGateway,
    ) {}

    private resolve(relativePath: string): string {
        return path.resolve(this.workspaceRoot, relativePath);
    }

    async get(relativePath: string): Promise<BufferedFile> {
        const absolutePath = this.resolve(relativePath);
        const existing = this.files.get(absolutePath);
        if (existing) {
            return existing;
        }

        const existed = await this.fs.exists(absolutePath);
        const content = existed ? await this.fs.readText(absolutePath) : undefined;
        const buffered: BufferedFile = {
            absolutePath,
            relativePath,
            existedAtStart: existed,
            originalContent: content,
            currentContent: content,
        };

        this.files.set(absolutePath, buffered);
        return buffered;
    }

    async read(relativePath: string): Promise<string | undefined> {
        const buffered = await this.get(relativePath);
        return buffered.currentContent;
    }

    async write(relativePath: string, content: string): Promise<void> {
        const buffered = await this.get(relativePath);
        buffered.currentContent = content;
    }

    async exists(relativePath: string): Promise<boolean> {
        const buffered = await this.get(relativePath);
        return buffered.currentContent !== undefined;
    }

    listModified(): BufferedFile[] {
        return Array.from(this.files.values()).filter((entry) => entry.originalContent !== entry.currentContent);
    }

    async commit(): Promise<void> {
        const modified = this.listModified().sort((left, right) => left.relativePath.localeCompare(right.relativePath));
        const backups = modified.map((entry) => ({
            entry,
            originalContent: entry.originalContent,
            existedAtStart: entry.existedAtStart,
        }));

        try {
            for (const entry of modified) {
                await this.fs.writeText(entry.absolutePath, entry.currentContent ?? '');
            }
        } catch (error) {
            for (const backup of backups) {
                if (backup.existedAtStart) {
                    await this.fs.writeText(backup.entry.absolutePath, backup.originalContent ?? '');
                } else {
                    await this.fs.remove(backup.entry.absolutePath);
                }
            }

            throw error;
        }
    }
}

export async function executePatchPlan(
    plan: PatchPlan,
    options: ExecutePatchPlanOptions,
): Promise<PatchExecutionResult> {
    const fs = options.fs ?? nodeFsGateway;
    const diagnostics: Diagnostic[] = [];
    const operationResults: OperationResult[] = [];
    const bufferedFs = new BufferedFilesystem(options.workspaceRoot, fs);

    const runtime: PatchExecutionRuntime = {
        workspaceRoot: options.workspaceRoot,
        dryRun: options.dryRun ?? false,
        getFile: (relativePath) => bufferedFs.get(relativePath),
        setFileContent: async (relativePath, content) => {
            await bufferedFs.write(relativePath, content);
        },
        fileExists: (relativePath) => bufferedFs.exists(relativePath),
        readCurrentContent: (relativePath) => bufferedFs.read(relativePath),
        addDiagnostic: (diagnostic) => {
            diagnostics.push(diagnostic);
        },
    };

    let failed = false;

    for (const operation of plan.operations) {
        const handler = operationHandlers[operation.kind];
        if (!handler) {
            const result: OperationResult = {
                opId: operation.opId,
                status: 'failed',
                changedFiles: [],
                diagnostics: [
                    {
                        id: 'patch.unknown_operation',
                        severity: 'error',
                        message: `Unknown patch operation kind: ${operation.kind}`,
                        evidence: { kind: operation.kind },
                    },
                ],
            };

            operationResults.push(result);
            failed = true;
            break;
        }

        const result = await handler(operation as never, runtime);
        operationResults.push(result);
        for (const diagnostic of result.diagnostics) {
            diagnostics.push(diagnostic);
        }

        if (result.status === 'failed') {
            failed = true;
            break;
        }
    }

    const modifiedFiles = bufferedFs.listModified();
    const diffByFile: Record<string, string> = {};
    for (const file of modifiedFiles) {
        const patch = createPatch(
            file.relativePath,
            file.originalContent ?? '',
            file.currentContent ?? '',
        );
        diffByFile[file.relativePath] = patch;
    }

    const shouldApply = !failed && !(options.dryRun ?? false);
    let commitFailed = false;
    if (shouldApply) {
        try {
            await bufferedFs.commit();
        } catch (error) {
            commitFailed = true;
            const diagnostic: Diagnostic = {
                id: 'patch.commit_failed',
                severity: 'error',
                message: 'Patch commit failed. Changes were rolled back where possible.',
                evidence: {
                    error: String(error),
                },
            };

            diagnostics.push(diagnostic);
            operationResults.push({
                opId: 'patch.commit',
                status: 'failed',
                changedFiles: [],
                diagnostics: [diagnostic],
            });
        }
    }

    return {
        applied: shouldApply && !commitFailed,
        operationResults,
        changedFiles: modifiedFiles.map((file) => file.relativePath),
        diffByFile,
        diagnostics,
    };
}
