import type { EnsureExportsEntryOperation, OperationResult } from '@loop-kit/loop-contracts';
import { stableStringify } from '../../utils/json.js';
import type { OperationHandler } from './runtime.js';

type PackageJsonLike = Record<string, unknown> & {
    exports?: Record<string, unknown> | string;
};

export const ensureExportsEntryHandler: OperationHandler<EnsureExportsEntryOperation> = async (
    operation,
    runtime,
): Promise<OperationResult> => {
    const current = await runtime.readCurrentContent(operation.packageJsonPath);
    const pkg = (current ? JSON.parse(current) : { name: 'generated-package', version: '0.0.0' }) as PackageJsonLike;

    const exportsField = pkg.exports;
    let exportsMap: Record<string, unknown>;
    if (!exportsField || typeof exportsField === 'string') {
        exportsMap = {};
    } else {
        exportsMap = { ...exportsField };
    }

    const previousValue = exportsMap[operation.exportPath];
    const nextValue = operation.value;

    if (JSON.stringify(previousValue) === JSON.stringify(nextValue)) {
        return {
            opId: operation.opId,
            status: 'noop',
            changedFiles: [],
            diagnostics: [],
        };
    }

    exportsMap[operation.exportPath] = nextValue;
    pkg.exports = exportsMap;

    await runtime.setFileContent(operation.packageJsonPath, stableStringify(pkg));

    return {
        opId: operation.opId,
        status: 'applied',
        changedFiles: [operation.packageJsonPath],
        diagnostics: [],
    };
};
