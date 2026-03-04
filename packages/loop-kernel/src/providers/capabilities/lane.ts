import type {
    LaneResolveComponentRequest,
    LaneResolveComponentResponse,
    LaneResolveModuleRequest,
    LaneResolveModuleResponse,
    Result,
} from '@loop-kit/loop-contracts';

export interface LaneProvider {
    readonly id: string;
    readonly kind: string;

    resolveComponent(
        request: LaneResolveComponentRequest,
    ): Promise<Result<LaneResolveComponentResponse>>;

    resolveModule(
        request: LaneResolveModuleRequest,
    ): Promise<Result<LaneResolveModuleResponse>>;

    getAuthStatus?(): Promise<{ authenticated: boolean; message?: string }>;
    auth?(token?: string): Promise<Result<{ authenticated: boolean; message?: string }>>;
}
