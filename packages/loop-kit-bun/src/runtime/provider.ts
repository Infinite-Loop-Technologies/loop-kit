import type { CapabilityId } from './ids';
import type { ProviderTier } from './tiers';

export type CapabilityRequest = { capability: CapabilityId; payload: unknown };

export type CapabilityResponse =
    | { ok: true; value: unknown }
    | { ok: false; error: string };

export interface ProviderInit {
    id: string;
    config?: unknown;
}

export interface Provider {
    readonly id: string;
    readonly tier: ProviderTier;

    /** WIT-ish capability IDs this provider can satisfy */
    readonly capabilities: ReadonlyArray<CapabilityId>;

    init(init: ProviderInit): Promise<void>;
    handle(req: CapabilityRequest): Promise<CapabilityResponse>;
    dispose(): Promise<void>;
}
