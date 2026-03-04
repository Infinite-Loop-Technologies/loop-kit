import type { GraphiteMetrics } from '../instrument/metrics.js';
import type { IntentSnapshotReader } from '../intent/intentStore.js';
import type { ScopeId } from '../types/ids.js';
import type { Diagnostic } from './diagnostics.js';
import {
    type Validator,
    type ValidatorResult,
    ValidatorRegistry,
} from './validatorRegistry.js';

export type ValidateMode = 'lazy' | 'eager';

export type ValidateEngineOptions = {
    mode?: ValidateMode;
    metrics?: GraphiteMetrics;
};

type FacetCacheEntry = {
    intentVersion: number;
    overlayVersion: number;
    slice: unknown;
    diagnostics: Diagnostic[];
};

type ScopeCache = {
    facetCache: Map<string, FacetCacheEntry>;
    subscribers: Set<() => void>;
};

export type StateView = {
    scopeId: ScopeId;
    getSlice<TSlice>(facetName: string): TSlice | undefined;
    getDiagnostics(facetName?: string): Diagnostic[];
    getVersions(): { intentVersion: number; overlayVersion: number };
};

export class ValidateEngine {
    private readonly mode: ValidateMode;
    private readonly metrics?: GraphiteMetrics;
    private readonly caches = new Map<ScopeId, ScopeCache>();

    constructor(
        private readonly registry: ValidatorRegistry,
        private readonly readSnapshot: (scopeId: ScopeId) => IntentSnapshotReader,
        options: ValidateEngineOptions = {},
    ) {
        this.mode = options.mode ?? 'lazy';
        this.metrics = options.metrics;
    }

    getStateView(scopeId: ScopeId): StateView {
        this.getOrCreateScope(scopeId);
        return {
            scopeId,
            getSlice: <TSlice>(facetName: string) => this.getSlice<TSlice>(scopeId, facetName),
            getDiagnostics: (facetName?: string) => this.getDiagnostics(scopeId, facetName),
            getVersions: () => {
                const snapshot = this.readSnapshot(scopeId);
                return {
                    intentVersion: snapshot.intentVersion,
                    overlayVersion: snapshot.overlayVersion,
                };
            },
        };
    }

    subscribe(scopeId: ScopeId, listener: () => void): () => void {
        const scope = this.getOrCreateScope(scopeId);
        scope.subscribers.add(listener);

        return () => {
            scope.subscribers.delete(listener);
        };
    }

    onSnapshotChanged(scopeId: ScopeId): void {
        if (this.mode === 'eager') {
            this.refreshScope(scopeId);
        }

        this.notify(scopeId);
    }

    refreshScope(scopeId: ScopeId): void {
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

    getSlice<TSlice>(scopeId: ScopeId, facetName: string): TSlice | undefined {
        const validator = this.registry.get<TSlice>(facetName);
        if (!validator) {
            return undefined;
        }

        const snapshot = this.readSnapshot(scopeId);
        const scope = this.getOrCreateScope(scopeId);
        const cache = scope.facetCache.get(facetName);

        if (
            cache &&
            cache.intentVersion === snapshot.intentVersion &&
            cache.overlayVersion === snapshot.overlayVersion
        ) {
            this.metrics?.increment('validator.cache.hit');
            return cache.slice as TSlice;
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

        return result.slice as TSlice;
    }

    getDiagnostics(scopeId: ScopeId, facetName?: string): Diagnostic[] {
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

        const diagnostics: Diagnostic[] = [];
        for (const [name, validator] of this.registry.entries()) {
            const cache = this.getOrRun(scopeId, name, validator, snapshot);
            diagnostics.push(...cache.diagnostics);
        }

        return diagnostics;
    }

    private getOrRun(
        scopeId: ScopeId,
        facetName: string,
        validator: Validator,
        snapshot: IntentSnapshotReader,
    ): FacetCacheEntry {
        const scope = this.getOrCreateScope(scopeId);
        const cache = scope.facetCache.get(facetName);
        if (
            cache &&
            cache.intentVersion === snapshot.intentVersion &&
            cache.overlayVersion === snapshot.overlayVersion
        ) {
            this.metrics?.increment('validator.cache.hit');
            return cache;
        }

        this.metrics?.increment('validator.cache.miss');
        const started = performance.now();
        const result = runValidator(validator, snapshot, scopeId, facetName);
        this.metrics?.onValidatorTime(performance.now() - started);

        const next: FacetCacheEntry = {
            intentVersion: snapshot.intentVersion,
            overlayVersion: snapshot.overlayVersion,
            slice: result.slice,
            diagnostics: result.diagnostics,
        };

        scope.facetCache.set(facetName, next);
        return next;
    }

    private notify(scopeId: ScopeId): void {
        const scope = this.getOrCreateScope(scopeId);
        for (const subscriber of scope.subscribers) {
            subscriber();
        }
    }

    private getOrCreateScope(scopeId: ScopeId): ScopeCache {
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

function runValidator(
    validator: Validator,
    snapshot: IntentSnapshotReader,
    scopeId: ScopeId,
    facetName: string,
): ValidatorResult {
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
