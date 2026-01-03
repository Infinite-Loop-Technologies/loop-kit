export type CapabilityName = string;

export interface Capability {
    name: CapabilityName;
}

export interface CapabilityRequest {
    capability: CapabilityName;
    payload: unknown;
}

export interface CapabilityResponse {
    ok: boolean;
    value?: unknown;
    error?: string;
}
