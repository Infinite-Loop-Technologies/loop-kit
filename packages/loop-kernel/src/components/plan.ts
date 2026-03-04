import path from 'node:path';
import {
    type ComponentManifest,
    type PatchOperation,
    type PatchPlan,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';

function prefixPath(targetRoot: string, inputPath: string): string {
    return path.normalize(path.join(targetRoot, inputPath));
}

function prefixOperationPaths(targetRoot: string, operation: PatchOperation): PatchOperation {
    switch (operation.kind) {
        case 'ensureDependency':
            return {
                ...operation,
                packageJsonPath: prefixPath(targetRoot, operation.packageJsonPath),
            };
        case 'ensureExportsEntry':
            return {
                ...operation,
                packageJsonPath: prefixPath(targetRoot, operation.packageJsonPath),
            };
        case 'ensureTsconfigExtends':
            return {
                ...operation,
                tsconfigPath: prefixPath(targetRoot, operation.tsconfigPath),
            };
        case 'ensureFile':
            return {
                ...operation,
                path: prefixPath(targetRoot, operation.path),
            };
        case 'ensureSentinelBlock':
            return {
                ...operation,
                path: prefixPath(targetRoot, operation.path),
            };
        case 'applyJsonMergePatch':
            return {
                ...operation,
                path: prefixPath(targetRoot, operation.path),
            };
        case 'applyUnifiedDiff':
            return {
                ...operation,
                path: prefixPath(targetRoot, operation.path),
            };
        case 'tsEnsureImportAndWrapReactRoot':
            return {
                ...operation,
                path: prefixPath(targetRoot, operation.path),
            };
        default:
            return operation;
    }
}

export async function buildComponentInstallPlan(
    manifest: ComponentManifest,
    options: {
        componentBaseDir: string;
        targetPath: string;
        overwriteFiles?: boolean;
        fs?: FsGateway;
    },
): Promise<PatchPlan> {
    const fs = options.fs ?? nodeFsGateway;
    const operations: PatchOperation[] = [];

    for (const file of manifest.files) {
        const sourcePath = path.resolve(options.componentBaseDir, file.source);
        const content = await fs.readText(sourcePath);
        operations.push({
            kind: 'ensureFile',
            opId: `component.file.${file.target}`,
            path: prefixPath(options.targetPath, file.target),
            content,
            overwrite: options.overwriteFiles ?? false,
        });
    }

    for (const dependency of manifest.dependencies) {
        operations.push({
            kind: 'ensureDependency',
            opId: `component.dep.${dependency.name}`,
            packageJsonPath: prefixPath(options.targetPath, 'package.json'),
            dependencyType: dependency.type,
            name: dependency.name,
            version: dependency.version,
        });
    }

    for (const patch of manifest.patches) {
        for (const operation of patch.operations) {
            operations.push(prefixOperationPaths(options.targetPath, operation));
        }
    }

    return {
        id: `component.install.${manifest.id}`,
        title: `Install component ${manifest.id}`,
        provenance: {
            source: 'loop:add',
            componentId: manifest.id,
            snapshotId: manifest.snapshot,
        },
        operations,
        preconditions: [],
        postconditions: [],
    };
}
