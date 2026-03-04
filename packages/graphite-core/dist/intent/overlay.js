import { extractTouchedKeysFromPatch } from '../query/depKeys.js';
import { applyPatch } from '../store/patch.js';
import { createSnapshotReader, } from './intentStore.js';
export class OverlayLayer {
    intentStore;
    metrics;
    scopes = new Map();
    listeners = new Set();
    constructor(intentStore, metrics) {
        this.intentStore = intentStore;
        this.metrics = metrics;
    }
    pushOverlay(scopeId, patch) {
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
    clearOverlay(scopeId) {
        const scope = this.getOrCreateScope(scopeId);
        const touchedKeys = new Set();
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
    getOverlayStack(scopeId) {
        return this.getOrCreateScope(scopeId).stack;
    }
    getOverlayVersion(scopeId) {
        return this.getOrCreateScope(scopeId).version;
    }
    readIntentSnapshot(scopeId) {
        const scope = this.getOrCreateScope(scopeId);
        const intentVersion = this.intentStore.version;
        if (scope.stack.length === 0) {
            return this.intentStore.createSnapshotReader(scope.version);
        }
        if (scope.cache &&
            scope.cache.intentVersion === intentVersion &&
            scope.cache.overlayVersion === scope.version) {
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
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify(scopeId, touchedKeys) {
        for (const listener of this.listeners) {
            listener(scopeId, touchedKeys);
        }
    }
    getOrCreateScope(scopeId) {
        let scope = this.scopes.get(scopeId);
        if (!scope) {
            scope = { stack: [], version: 0 };
            this.scopes.set(scopeId, scope);
        }
        return scope;
    }
}
//# sourceMappingURL=overlay.js.map