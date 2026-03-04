import type { GraphiteMetrics } from '../instrument/metrics.js';
import { type Patch } from '../store/patch.js';
import type { ScopeId } from '../types/ids.js';
import { type IntentSnapshotReader, type IntentStore } from './intentStore.js';
export type OverlayChangeListener = (scopeId: ScopeId, touchedKeys: Set<string>) => void;
export declare class OverlayLayer {
    private readonly intentStore;
    private readonly metrics?;
    private readonly scopes;
    private readonly listeners;
    constructor(intentStore: IntentStore, metrics?: GraphiteMetrics | undefined);
    pushOverlay(scopeId: ScopeId, patch: Patch): {
        overlayVersion: number;
        touchedKeys: Set<string>;
    };
    clearOverlay(scopeId: ScopeId): {
        overlayVersion: number;
        touchedKeys: Set<string>;
    };
    getOverlayStack(scopeId: ScopeId): readonly Patch[];
    getOverlayVersion(scopeId: ScopeId): number;
    readIntentSnapshot(scopeId: ScopeId): IntentSnapshotReader;
    subscribe(listener: OverlayChangeListener): () => void;
    private notify;
    private getOrCreateScope;
}
//# sourceMappingURL=overlay.d.ts.map