import type { GraphiteMetrics } from '../instrument/metrics.js';
import { extractTouchedKeysFromPatch } from '../query/depKeys.js';
import { GraphStore } from '../store/graphStore.js';
import { applyPatch, type Patch } from '../store/patch.js';
import type { ScopeId } from '../types/ids.js';
import {
    createSnapshotReader,
    type IntentSnapshotReader,
    type IntentStore,
} from './intentStore.js';

type OverlayScopeState = {
    stack: Patch[];
    version: number;
    cache?: {
        intentVersion: number;
        overlayVersion: number;
        graph: GraphStore;
    };
};

export type OverlayChangeListener = (
    scopeId: ScopeId,
    touchedKeys: Set<string>,
) => void;

export class OverlayLayer {
    private readonly scopes = new Map<ScopeId, OverlayScopeState>();
    private readonly listeners = new Set<OverlayChangeListener>();

    constructor(
        private readonly intentStore: IntentStore,
        private readonly metrics?: GraphiteMetrics,
    ) {}

    pushOverlay(scopeId: ScopeId, patch: Patch): { overlayVersion: number; touchedKeys: Set<string> } {
        const scope = this.getOrCreateScope(scopeId);
        scope.stack.push(patch);
        scope.version += 1;
        scope.cache = undefined;

        const touchedKeys = extractTouchedKeysFromPatch(patch);
        this.metrics?.increment('overlay.push');
        this.notify(scopeId, touchedKeys);
        return {
            overlayVersion: scope.version,
            touchedKeys,
        };
    }

    clearOverlay(scopeId: ScopeId): { overlayVersion: number; touchedKeys: Set<string> } {
        const scope = this.getOrCreateScope(scopeId);
        const touchedKeys = new Set<string>();

        for (const patch of scope.stack) {
            const patchTouched = extractTouchedKeysFromPatch(patch);
            for (const key of patchTouched) {
                touchedKeys.add(key);
            }
        }

        scope.stack = [];
        scope.version += 1;
        scope.cache = undefined;

        this.metrics?.increment('overlay.clear');
        this.notify(scopeId, touchedKeys);
        return {
            overlayVersion: scope.version,
            touchedKeys,
        };
    }

    getOverlayStack(scopeId: ScopeId): readonly Patch[] {
        return this.getOrCreateScope(scopeId).stack;
    }

    getOverlayVersion(scopeId: ScopeId): number {
        return this.getOrCreateScope(scopeId).version;
    }

    readIntentSnapshot(scopeId: ScopeId): IntentSnapshotReader {
        const scope = this.getOrCreateScope(scopeId);
        const intentVersion = this.intentStore.version;

        if (scope.stack.length === 0) {
            return this.intentStore.createSnapshotReader(scope.version);
        }

        if (
            scope.cache &&
            scope.cache.intentVersion === intentVersion &&
            scope.cache.overlayVersion === scope.version
        ) {
            return createSnapshotReader(scope.cache.graph, intentVersion, scope.version);
        }

        const start = performance.now();
        const graph = this.intentStore.graph.clone();
        for (const patch of scope.stack) {
            applyPatch(graph, patch);
        }

        scope.cache = {
            intentVersion,
            overlayVersion: scope.version,
            graph,
        };

        this.metrics?.onOverlayMaterializeTime(performance.now() - start);
        return createSnapshotReader(graph, intentVersion, scope.version);
    }

    subscribe(listener: OverlayChangeListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify(scopeId: ScopeId, touchedKeys: Set<string>): void {
        for (const listener of this.listeners) {
            listener(scopeId, touchedKeys);
        }
    }

    private getOrCreateScope(scopeId: ScopeId): OverlayScopeState {
        let scope = this.scopes.get(scopeId);
        if (!scope) {
            scope = { stack: [], version: 0 };
            this.scopes.set(scopeId, scope);
        }

        return scope;
    }
}
