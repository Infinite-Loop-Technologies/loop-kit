import type { ApplyJsonMergePatchOperation, OperationResult } from '@loop-kit/loop-contracts';
import { apply } from 'json-merge-patch';
import { parseJsonWithComments, stableStringify } from '../../utils/json.js';
import type { OperationHandler } from './runtime.js';

export const applyJsonMergePatchHandler: OperationHandler<ApplyJsonMergePatchOperation> = async (
    operation,
    runtime,
): Promise<OperationResult> => {
    const current = await runtime.readCurrentContent(operation.path);
    const base = current ? parseJsonWithComments<Record<string, unknown>>(current) : {};
    const merged = apply(base, operation.patch);
    const next = stableStringify(merged);

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
