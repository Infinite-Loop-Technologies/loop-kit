import type { GraphiteMetrics } from '../instrument/metrics.js';
import type { IntentSnapshotReader } from '../intent/intentStore.js';
import type { ScopeId } from '../types/ids.js';
import type { Diagnostic } from './diagnostics.js';
import { ValidatorRegistry } from './validatorRegistry.js';
export type ValidateMode = 'lazy' | 'eager';
export type ValidateEngineOptions = {
    mode?: ValidateMode;
    metrics?: GraphiteMetrics;
};
export type StateView = {
    scopeId: ScopeId;
    getSlice<TSlice>(facetName: string): TSlice | undefined;
    getDiagnostics(facetName?: string): Diagnostic[];
    getVersions(): {
        intentVersion: number;
        overlayVersion: number;
    };
};
export declare class ValidateEngine {
    private readonly registry;
    private readonly readSnapshot;
    private readonly mode;
    private readonly metrics?;
    private readonly caches;
    constructor(registry: ValidatorRegistry, readSnapshot: (scopeId: ScopeId) => IntentSnapshotReader, options?: ValidateEngineOptions);
    getStateView(scopeId: ScopeId): StateView;
    subscribe(scopeId: ScopeId, listener: () => void): () => void;
    onSnapshotChanged(scopeId: ScopeId): void;
    refreshScope(scopeId: ScopeId): void;
    getSlice<TSlice>(scopeId: ScopeId, facetName: string): TSlice | undefined;
    getDiagnostics(scopeId: ScopeId, facetName?: string): Diagnostic[];
    private getOrRun;
    private notify;
    private getOrCreateScope;
}
//# sourceMappingURL=validateEngine.d.ts.map