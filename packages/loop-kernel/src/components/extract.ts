import path from 'node:path';
import fg from 'fast-glob';
import {
    err,
    ok,
    type PatchOperation,
    type Result,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';
import { executePatchPlan } from '../patch/executor.js';
import { sha256 } from '../utils/hash.js';
import { stableStringify } from '../utils/json.js';
import {
    captureFileStates,
    collectPatchPlanTouchedFiles,
} from '../undo/snapshot.js';
import type { ExtractResult } from '../types.js';

function sanitizeComponentId(componentId: string): string {
    return componentId.replace(/[^a-zA-Z0-9._/-]/g, '-');
}

export async function extractComponent(
    workspaceRoot: string,
    inputPath: string,
    componentId: string,
    options: {
        lane?: string;
        relocate?: string | boolean;
        packageToo?: boolean;
        dryRun?: boolean;
        fs?: FsGateway;
    } = {},
): Promise<Result<ExtractResult>> {
    const fs = options.fs ?? nodeFsGateway;
    const lane = options.lane ?? 'local';
    if (lane !== 'local') {
        return err({
            code: 'extract.lane_not_supported',
            message: `Extract currently supports only the local lane (received: ${lane}).`,
        });
    }

    const absoluteInput = path.isAbsolute(inputPath)
        ? inputPath
        : path.resolve(workspaceRoot, inputPath);

    if (!(await fs.exists(absoluteInput))) {
        return err({
            code: 'extract.path_missing',
            message: `Cannot extract missing path: ${inputPath}`,
        });
    }

    const relativeInput = path.relative(workspaceRoot, absoluteInput);
    if (relativeInput.startsWith('..')) {
        return err({
            code: 'extract.outside_workspace',
            message: 'Extract path must be inside workspace root.',
        });
    }

    const files = await fg('**/*', {
        cwd: absoluteInput,
        onlyFiles: true,
        dot: true,
        ignore: ['**/node_modules/**', '**/dist/**'],
    });

    if (files.length === 0) {
        return err({
            code: 'extract.no_files',
            message: 'No files found to extract.',
        });
    }

    const manifestId = sanitizeComponentId(componentId);
    const componentDir = path.join('loop', 'components', manifestId);
    const manifestFiles: Array<{ source: string; target: string }> = [];
    const operations: PatchOperation[] = [];

    let aggregate = '';
    const relocateTarget =
        options.packageToo
            ? path.join('packages', manifestId)
            : typeof options.relocate === 'string'
                ? options.relocate
                : options.relocate
                    ? path.join('components', manifestId)
                    : null;

    for (const relativeFile of files) {
        const sourceAbsolute = path.join(absoluteInput, relativeFile);
        const content = await fs.readText(sourceAbsolute);
        aggregate += content;

        const payloadPath = path.join(componentDir, 'files', relativeFile);
        operations.push({
            kind: 'ensureFile',
            opId: `extract.payload.${relativeFile}`,
            path: payloadPath,
            overwrite: true,
            content,
        });

        const target = relocateTarget
            ? path.normalize(path.join(relocateTarget, relativeFile))
            : path.normalize(path.join(relativeInput, relativeFile));

        manifestFiles.push({
            source: path.normalize(path.join('files', relativeFile)).replace(/\\/g, '/'),
            target: target.replace(/\\/g, '/'),
        });

        if (relocateTarget) {
            operations.push({
                kind: 'ensureFile',
                opId: `extract.relocate.${relativeFile}`,
                path: target,
                overwrite: false,
                content,
            });
        }
    }

    const snapshotId = sha256(aggregate);
    const snapshotRoot = path.join('loop', 'snapshots', snapshotId);

    for (const relativeFile of files) {
        const sourceAbsolute = path.join(absoluteInput, relativeFile);
        const content = await fs.readText(sourceAbsolute);
        operations.push({
            kind: 'ensureFile',
            opId: `extract.snapshot.${relativeFile}`,
            path: path.join(snapshotRoot, 'files', relativeFile),
            overwrite: true,
            content,
        });
    }

    if (options.packageToo) {
        const packageRoot = path.join('packages', manifestId);
        const entrySource = files[0] ?? 'index.ts';
        const entryNoExt = entrySource.replace(/\.[^/.]+$/, '');
        const entryImportPath = entryNoExt.startsWith('.')
            ? entryNoExt
            : `./${entryNoExt.replace(/\\/g, '/')}`;

        operations.push({
            kind: 'ensureFile',
            opId: 'extract.package.package-json',
            path: path.join(packageRoot, 'package.json'),
            overwrite: false,
            content: stableStringify({
                name: manifestId,
                version: '0.1.0',
                private: true,
                type: 'module',
                exports: {
                    '.': './index.ts',
                },
            }),
        });
        operations.push({
            kind: 'ensureFile',
            opId: 'extract.package.index',
            path: path.join(packageRoot, 'index.ts'),
            overwrite: false,
            content: `export * from '${entryImportPath}';\n`,
        });
        operations.push({
            kind: 'ensureFile',
            opId: 'extract.package.tsconfig',
            path: path.join(packageRoot, 'tsconfig.json'),
            overwrite: false,
            content: stableStringify({
                extends: '../../tsconfig.base.json',
                compilerOptions: {
                    rootDir: '.',
                },
                include: ['**/*.ts', '**/*.tsx'],
            }),
        });
    }

    const manifest = {
        schemaVersion: '1',
        kind: 'component',
        id: manifestId,
        name: manifestId,
        version: '0.1.0',
        description: `Extracted from ${relativeInput}`,
        snapshot: snapshotId,
        files: manifestFiles,
        patches: [],
        dependencies: [],
        targets: ['app', 'pkg'],
    };

    operations.push({
        kind: 'ensureFile',
        opId: 'extract.manifest',
        path: path.join(componentDir, 'loop.component.json'),
        overwrite: true,
        content: stableStringify(manifest),
    });

    operations.push({
        kind: 'ensureFile',
        opId: 'extract.snapshot.meta',
        path: path.join(snapshotRoot, 'snapshot.json'),
        overwrite: true,
        content: stableStringify({
            schemaVersion: '1',
            componentId: manifestId,
            snapshotId,
            sourcePath: relativeInput.replace(/\\/g, '/'),
            files: manifestFiles,
        }),
    });

    const plan = {
        id: `component.extract.${manifestId}`,
        title: `Extract ${manifestId}`,
        provenance: {
            source: 'loop:extract',
            componentId: manifestId,
            snapshotId,
        },
        operations,
        preconditions: [],
        postconditions: [],
    };
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

    return ok({
        componentId: manifestId,
        snapshotId,
        plan,
        execution,
        undoSnapshot: {
            touchedFiles,
            before,
            after,
        },
    });
}
