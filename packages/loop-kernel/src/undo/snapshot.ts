import path from 'node:path';
import type {
    PatchOperation,
    PatchPlan,
    UndoFileState,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';

function operationPath(operation: PatchOperation): string {
    switch (operation.kind) {
        case 'ensureDependency':
            return operation.packageJsonPath;
        case 'ensureExportsEntry':
            return operation.packageJsonPath;
        case 'ensureTsconfigExtends':
            return operation.tsconfigPath;
        case 'ensureFile':
            return operation.path;
        case 'ensureSentinelBlock':
            return operation.path;
        case 'applyJsonMergePatch':
            return operation.path;
        case 'applyUnifiedDiff':
            return operation.path;
        case 'tsEnsureImportAndWrapReactRoot':
            return operation.path;
        default:
            return '';
    }
}

export function collectPatchPlanTouchedFiles(plan: PatchPlan): string[] {
    const seen = new Set<string>();
    for (const operation of plan.operations) {
        const relativePath = operationPath(operation).trim();
        if (!relativePath) {
            continue;
        }

        const normalized = path.normalize(relativePath).replace(/\\/g, '/');
        seen.add(normalized);
    }

    return Array.from(seen).sort((left, right) => left.localeCompare(right));
}

export async function captureFileStates(
    workspaceRoot: string,
    relativePaths: string[],
    fs: FsGateway = nodeFsGateway,
): Promise<UndoFileState[]> {
    const states: UndoFileState[] = [];

    for (const relativePath of relativePaths) {
        const absolutePath = path.resolve(workspaceRoot, relativePath);
        const exists = await fs.exists(absolutePath);
        if (!exists) {
            states.push({
                path: relativePath,
                existed: false,
            });
            continue;
        }

        const content = await fs.readText(absolutePath);
        states.push({
            path: relativePath,
            existed: true,
            content,
        });
    }

    return states;
}
