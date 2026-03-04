import { applyPatch } from 'diff';
import type { ApplyUnifiedDiffOperation, OperationResult } from '@loop-kit/loop-contracts';
import type { OperationHandler } from './runtime.js';

export const applyUnifiedDiffHandler: OperationHandler<ApplyUnifiedDiffOperation> = async (
    operation,
    runtime,
): Promise<OperationResult> => {
    const current = await runtime.readCurrentContent(operation.path);
    if (current === undefined) {
        return {
            opId: operation.opId,
            status: 'failed',
            changedFiles: [],
            diagnostics: [
                {
                    id: 'patch.diff_missing_file',
                    severity: 'error',
                    message: `Cannot apply diff to missing file: ${operation.path}`,
                    evidence: { path: operation.path },
                },
            ],
        };
    }

    const patched = applyPatch(current, operation.diff);
    if (patched === false) {
        return {
            opId: operation.opId,
            status: 'failed',
            changedFiles: [],
            diagnostics: [
                {
                    id: 'patch.diff_apply_failed',
                    severity: 'error',
                    message: `Unified diff failed for ${operation.path}`,
                    evidence: { path: operation.path },
                },
            ],
        };
    }

    if (patched === current) {
        return {
            opId: operation.opId,
            status: 'noop',
            changedFiles: [],
            diagnostics: [],
        };
    }

    await runtime.setFileContent(operation.path, patched);

    return {
        opId: operation.opId,
        status: 'applied',
        changedFiles: [operation.path],
        diagnostics: [],
    };
};
