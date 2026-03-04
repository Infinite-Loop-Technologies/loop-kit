import type { EnsureTsconfigExtendsOperation, OperationResult } from '@loop-kit/loop-contracts';
import { parseJsonWithComments, stableStringify } from '../../utils/json.js';
import type { OperationHandler } from './runtime.js';

type TsConfigLike = {
    extends?: string;
    [key: string]: unknown;
};

export const ensureTsconfigExtendsHandler: OperationHandler<EnsureTsconfigExtendsOperation> = async (
    operation,
    runtime,
): Promise<OperationResult> => {
    const current = await runtime.readCurrentContent(operation.tsconfigPath);
    const config: TsConfigLike = current ? parseJsonWithComments<TsConfigLike>(current) : {};

    if (config.extends === operation.extendsPath) {
        return {
            opId: operation.opId,
            status: 'noop',
            changedFiles: [],
            diagnostics: [],
        };
    }

    config.extends = operation.extendsPath;
    await runtime.setFileContent(operation.tsconfigPath, stableStringify(config));

    return {
        opId: operation.opId,
        status: 'applied',
        changedFiles: [operation.tsconfigPath],
        diagnostics: [],
    };
};
