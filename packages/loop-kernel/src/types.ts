import type {
    PipelineRunSummary,
    TaskEvent,
    TaskRunSummary,
    ComponentLockfile,
    ComponentManifest,
    Diagnostic,
    KernelError,
    LaneInstance,
    LoopWorkspaceConfig,
    ModuleManifest,
    OverrideEntry,
    OperationResult,
    PatchPlan,
    UndoFileState,
    UndoJournalEntry,
    Result,
} from '@loop-kit/loop-contracts';

export type KernelOptions = {
    workspaceRoot?: string;
};

export type PatchExecutionResult = {
    applied: boolean;
    operationResults: OperationResult[];
    changedFiles: string[];
    diffByFile: Record<string, string>;
    diagnostics: Diagnostic[];
};

export type DoctorReport = {
    diagnostics: Diagnostic[];
    fixPlans: Array<{
        id: string;
        title: string;
        safe: boolean;
        diagnosticIds: string[];
        plan: PatchPlan;
    }>;
};

export type GraphNode = {
    id: string;
    name: string;
    path: string;
    version: string;
    kind: 'app' | 'pkg';
};

export type GraphEdge = {
    from: string;
    to: string;
    dependencyType: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
};

export type WorkspaceGraph = {
    nodes: GraphNode[];
    edges: GraphEdge[];
};

export type AddComponentResult = {
    plan: PatchPlan;
    execution: PatchExecutionResult;
    lockfile: ComponentLockfile;
    undoSnapshot?: {
        touchedFiles: string[];
        before: UndoFileState[];
        after: UndoFileState[];
    };
    undoId?: string;
};

export type UpdateComponentResult = AddComponentResult;
export type DiffComponentResult = AddComponentResult;

export type ExtractResult = {
    componentId: string;
    snapshotId: string;
    plan: PatchPlan;
    execution: PatchExecutionResult;
    undoSnapshot?: {
        touchedFiles: string[];
        before: UndoFileState[];
        after: UndoFileState[];
    };
    undoId?: string;
};

export type AdoptResult = {
    componentId: string;
    sourceInstallRef: string;
    sourcePath: string;
    componentDir: string;
    previewPath: string;
    manifest: ComponentManifest;
    plan: PatchPlan;
    execution: PatchExecutionResult;
    undoSnapshot?: {
        touchedFiles: string[];
        before: UndoFileState[];
        after: UndoFileState[];
    };
    undoId?: string;
};

export type UndoResult = {
    undoId: string;
    execution: PatchExecutionResult;
    entry: UndoJournalEntry;
};

export type ListedComponent = {
    id: string;
    manifestPath: string;
    sourceDir: string;
    name: string;
    version: string;
    description?: string;
    tags?: string[];
};

export type RunTaskOptions = {
    parallel?: boolean;
    onEvent?: (event: TaskEvent) => void;
    env?: Record<string, string>;
};

export type RunTaskResult = {
    rootTaskId: string;
    summary: TaskRunSummary;
    tasks: TaskRunSummary[];
};

export type CiOptions = {
    pipelineId?: string;
    parallel?: boolean;
    onEvent?: (event: TaskEvent) => void;
    env?: Record<string, string>;
};

export type LaneStatus = {
    laneId: string;
    lane: LaneInstance;
    authenticated: boolean;
    message?: string;
};

export type ToolchainStatus = {
    id: string;
    status: 'ok' | 'warning' | 'error';
    diagnostics: Diagnostic[];
    details: Record<string, unknown>;
};

export type LoadedWorkspace = {
    path: string;
    config: LoopWorkspaceConfig;
};

export type ResolveComponentResult = {
    manifest: ComponentManifest;
    baseDir: string;
    snapshotId: string;
    laneId: string;
};

export type ResolveModuleResult = {
    manifest: ModuleManifest;
    baseDir: string;
    snapshotId: string;
    laneId: string;
};

export type ResolveOverrideResult = {
    refText: string;
    override?: OverrideEntry;
};

export type KernelCommandResult<T> = Result<T, KernelError>;
