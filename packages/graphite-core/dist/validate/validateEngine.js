export class ValidateEngine {
    registry;
    readSnapshot;
    mode;
    metrics;
    caches = new Map();
    constructor(registry, readSnapshot, options = {}) {
        this.registry = registry;
        this.readSnapshot = readSnapshot;
        this.mode = options.mode ?? 'lazy';
        this.metrics = options.metrics;
    }
    getStateView(scopeId) {
        this.getOrCreateScope(scopeId);
        return {
            scopeId,
            getSlice: (facetName) => this.getSlice(scopeId, facetName),
            getDiagnostics: (facetName) => this.getDiagnostics(scopeId, facetName),
            getVersions: () => {
                const snapshot = this.readSnapshot(scopeId);
                return {
                    intentVersion: snapshot.intentVersion,
                    overlayVersion: snapshot.overlayVersion,
                };
            },
        };
    }
    subscribe(scopeId, listener) {
        const scope = this.getOrCreateScope(scopeId);
        scope.subscribers.add(listener);
        return () => {
            scope.subscribers.delete(listener);
        };
    }
    onSnapshotChanged(scopeId) {
        if (this.mode === 'eager') {
            this.refreshScope(scopeId);
        }
        this.notify(scopeId);
    }
    refreshScope(scopeId) {
        const snapshot = this.readSnapshot(scopeId);
        const scope = this.getOrCreateScope(scopeId);
        const started = performance.now();
        for (const [facetName, validator] of this.registry.entries()) {
            const result = runValidator(validator, snapshot, scopeId, facetName);
            scope.facetCache.set(facetName, {
                intentVersion: snapshot.intentVersion,
                overlayVersion: snapshot.overlayVersion,
                slice: result.slice,
                diagnostics: result.diagnostics,
            });
        }
        this.metrics?.increment('validator.refresh');
        this.metrics?.onValidatorTime(performance.now() - started);
    }
    getSlice(scopeId, facetName) {
        const validator = this.registry.get(facetName);
        if (!validator) {
            return undefined;
        }
        const snapshot = this.readSnapshot(scopeId);
        const scope = this.getOrCreateScope(scopeId);
        const cache = scope.facetCache.get(facetName);
        if (cache &&
            cache.intentVersion === snapshot.intentVersion &&
            cache.overlayVersion === snapshot.overlayVersion) {
            this.metrics?.increment('validator.cache.hit');
            return cache.slice;
        }
        this.metrics?.increment('validator.cache.miss');
        const started = performance.now();
        const result = runValidator(validator, snapshot, scopeId, facetName);
        this.metrics?.onValidatorTime(performance.now() - started);
        scope.facetCache.set(facetName, {
            intentVersion: snapshot.intentVersion,
            overlayVersion: snapshot.overlayVersion,
            slice: result.slice,
            diagnostics: result.diagnostics,
        });
        return result.slice;
    }
    getDiagnostics(scopeId, facetName) {
        const snapshot = this.readSnapshot(scopeId);
        const scope = this.getOrCreateScope(scopeId);
        if (facetName) {
            const validator = this.registry.get(facetName);
            if (!validator) {
                return [];
            }
            const cache = this.getOrRun(scopeId, facetName, validator, snapshot);
            return [...cache.diagnostics];
        }
        const diagnostics = [];
        for (const [name, validator] of this.registry.entries()) {
            const cache = this.getOrRun(scopeId, name, validator, snapshot);
            diagnostics.push(...cache.diagnostics);
        }
        return diagnostics;
    }
    getOrRun(scopeId, facetName, validator, snapshot) {
        const scope = this.getOrCreateScope(scopeId);
        const cache = scope.facetCache.get(facetName);
        if (cache &&
            cache.intentVersion === snapshot.intentVersion &&
            cache.overlayVersion === snapshot.overlayVersion) {
            this.metrics?.increment('validator.cache.hit');
            return cache;
        }
        this.metrics?.increment('validator.cache.miss');
        const started = performance.now();
        const result = runValidator(validator, snapshot, scopeId, facetName);
        this.metrics?.onValidatorTime(performance.now() - started);
        const next = {
            intentVersion: snapshot.intentVersion,
            overlayVersion: snapshot.overlayVersion,
            slice: result.slice,
            diagnostics: result.diagnostics,
        };
        scope.facetCache.set(facetName, next);
        return next;
    }
    notify(scopeId) {
        const scope = this.getOrCreateScope(scopeId);
        for (const subscriber of scope.subscribers) {
            subscriber();
        }
    }
    getOrCreateScope(scopeId) {
        let scope = this.caches.get(scopeId);
        if (!scope) {
            scope = {
                facetCache: new Map(),
                subscribers: new Set(),
            };
            this.caches.set(scopeId, scope);
        }
        return scope;
    }
}
function runValidator(validator, snapshot, scopeId, facetName) {
    const result = validator(snapshot, {
        scopeId,
        facetName,
    });
    if (!Array.isArray(result.diagnostics)) {
        return {
            slice: result.slice,
            diagnostics: [],
        };
    }
    return result;
}
//# sourceMappingURL=validateEngine.js.map