import type { CapabilityId } from './ids';
import type { ProviderTier } from './tiers';

export type ProviderScope = 'singleton' | 'perComponent';

export interface ProviderManifest {
    id: string;
    tier: ProviderTier;
    implements: CapabilityId[];
    scope: ProviderScope;
    entry: string; // path (js), dll path, wasm path, etc
}
