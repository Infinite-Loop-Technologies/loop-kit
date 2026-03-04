import type {
    Result,
    ToolchainDetectRequest,
    ToolchainDetectResponse,
    ToolchainDiagnoseRequest,
    ToolchainDiagnoseResponse,
    ToolchainPlanFixRequest,
    ToolchainPlanFixResponse,
    ToolchainRunRequest,
    ToolchainRunResponse,
    ToolchainTasksRequest,
    ToolchainTasksResponse,
} from '@loop-kit/loop-contracts';

export interface ToolchainAdapter {
    readonly id: string;
    readonly kind: string;

    detect(request: ToolchainDetectRequest): Promise<Result<ToolchainDetectResponse>>;
    diagnose?(request: ToolchainDiagnoseRequest): Promise<Result<ToolchainDiagnoseResponse>>;
    tasks?(request: ToolchainTasksRequest): Promise<Result<ToolchainTasksResponse>>;
    planFix(request: ToolchainPlanFixRequest): Promise<Result<ToolchainPlanFixResponse>>;
    run(request: ToolchainRunRequest): Promise<Result<ToolchainRunResponse>>;
}
