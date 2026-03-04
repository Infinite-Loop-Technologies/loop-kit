import type { EnsureDependencyOperation, OperationResult } from '@loop-kit/loop-contracts';
import { stableStringify } from '../../utils/json.js';
import type { OperationHandler } from './runtime.js';

type PackageJsonLike = Record<string, unknown> & {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
};

export const ensureDependencyHandler: OperationHandler<EnsureDependencyOperation> = async (
    operation,
    runtime,
): Promise<OperationResult> => {
    const current = await runtime.readCurrentContent(operation.packageJsonPath);
    let pkg: PackageJsonLike;
    if (!current) {
        pkg = {
            name: 'generated-package',
            version: '0.0.0',
        };
    } else {
        pkg = JSON.parse(current) as PackageJsonLike;
    }

    const section =
        (pkg[operation.dependencyType] as Record<string, string> | undefined) ?? {};
    const previous = section[operation.name];

    if (previous === operation.version) {
        return {
            opId: operation.opId,
            status: 'noop',
            changedFiles: [],
            diagnostics: [],
        };
    }

    section[operation.name] = operation.version;
    pkg[operation.dependencyType] = section;

    await runtime.setFileContent(operation.packageJsonPath, stableStringify(pkg));

    return {
        opId: operation.opId,
        status: 'applied',
        changedFiles: [operation.packageJsonPath],
        diagnostics: [],
    };
};
