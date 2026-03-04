import type {
    PatchAdapterRequest,
    PatchAdapterResponse,
    Result,
} from '@loop-kit/loop-contracts';

export interface PatchAdapter {
    readonly id: string;
    readonly kind: string;

    apply(request: PatchAdapterRequest): Promise<Result<PatchAdapterResponse>>;
}
