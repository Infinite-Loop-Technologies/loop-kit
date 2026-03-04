import type { EnsureFileOperation, OperationResult } from '@loop-kit/loop-contracts';
import { trimTrailingNewline } from '../../utils/text.js';
import type { OperationHandler } from './runtime.js';

export const ensureFileHandler: OperationHandler<EnsureFileOperation> = async (
    operation,
    runtime,
): Promise<OperationResult> => {
    const current = await runtime.readCurrentContent(operation.path);

    if (current !== undefined && !operation.overwrite) {
        if (current === trimTrailingNewline(operation.content)) {
            return {
                opId: operation.opId,
                status: 'noop',
                changedFiles: [],
                diagnostics: [],
            };
        }

        runtime.addDiagnostic({
            id: 'patch.ensure_file_exists',
            severity: 'warning',
            message: `Skipped ${operation.path} because it already exists and overwrite=false.`,
            evidence: {
                path: operation.path,
            },
        });

        return {
            opId: operation.opId,
            status: 'noop',
            changedFiles: [],
            diagnostics: [
                {
                    id: 'patch.ensure_file_exists',
                    severity: 'warning',
                    message: `Skipped ${operation.path} because it already exists and overwrite=false.`,
                    evidence: { path: operation.path },
                },
            ],
        };
    }

    const next = trimTrailingNewline(operation.content);
    if (current === next) {
        return {
            opId: operation.opId,
            status: 'noop',
            changedFiles: [],
            diagnostics: [],
        };
    }

    await runtime.setFileContent(operation.path, next);

    return {
        opId: operation.opId,
        status: 'applied',
        changedFiles: [operation.path],
        diagnostics: [],
    };
};
