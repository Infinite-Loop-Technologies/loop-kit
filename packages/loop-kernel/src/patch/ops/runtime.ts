import type { Diagnostic, OperationResult, PatchOperation } from '@loop-kit/loop-contracts';

export type BufferedFile = {
    absolutePath: string;
    relativePath: string;
    existedAtStart: boolean;
    originalContent?: string;
    currentContent?: string;
};

export type PatchExecutionRuntime = {
    workspaceRoot: string;
    dryRun: boolean;
    getFile(relativePath: string): Promise<BufferedFile>;
    setFileContent(relativePath: string, content: string): Promise<void>;
    fileExists(relativePath: string): Promise<boolean>;
    readCurrentContent(relativePath: string): Promise<string | undefined>;
    addDiagnostic(diagnostic: Diagnostic): void;
};

export type OperationHandler<T extends PatchOperation = PatchOperation> = (
    operation: T,
    runtime: PatchExecutionRuntime,
) => Promise<OperationResult>;
