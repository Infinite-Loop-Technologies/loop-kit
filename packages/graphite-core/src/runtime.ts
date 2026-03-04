import { EffectRunner } from './effects/effectRunner.js';
import type { CommitEffect } from './effects/effectTypes.js';
import { HistoryManager } from './history/history.js';
import { OverlayLayer } from './intent/overlay.js';
import { IntentStore } from './intent/intentStore.js';
import { GraphiteMetrics } from './instrument/metrics.js';
import { InteractionRuntime } from './interaction/interactionRuntime.js';
import { QueryEngine } from './query/queryEngine.js';
import {
    CommitController,
    EventLog,
    type CommitMeta,
    type CommitResult,
} from './store/commit.js';
import type { Patch } from './store/patch.js';
import type { ScopeId } from './types/ids.js';
import { ValidateEngine, type ValidateMode } from './validate/validateEngine.js';
import { ValidatorRegistry, type Validator } from './validate/validatorRegistry.js';

export type ActionDispatchHandler = (
    scopeId: ScopeId,
    actionId: string,
    payload: unknown,
) => void;

export type GraphiteRuntimeOptions = {
    validateMode?: ValidateMode;
    enableHistory?: boolean;
    enableEventLog?: boolean;
    metrics?: GraphiteMetrics;
};

export class GraphiteScopeRuntime {
    readonly queryEngine: QueryEngine;
    readonly interactionRuntime: InteractionRuntime;

    constructor(
        readonly scopeId: ScopeId,
        private readonly runtime: GraphiteRuntime,
    ) {
        this.queryEngine = new QueryEngine(() => this.runtime.overlayLayer.readIntentSnapshot(scopeId), {
            metrics: runtime.metrics,
        });

        this.interactionRuntime = new InteractionRuntime({
            scopeId,
            metrics: runtime.metrics,
            getStateView: () => this.runtime.validateEngine.getStateView(scopeId),
            getIntentSnapshot: () => this.runtime.overlayLayer.readIntentSnapshot(scopeId),
            pushOverlayPatch: (patch) => {
                this.pushOverlayPatch(patch);
            },
            clearOverlay: () => {
                this.clearOverlay();
            },
            commitIntentPatch: (patch, meta) => this.commitIntentPatch(patch, meta),
            dispatchAction: (actionId, payload) => {
                this.dispatchAction(actionId, payload);
            },
        });
    }

    getStateView() {
        return this.runtime.validateEngine.getStateView(this.scopeId);
    }

    subscribeStateView(listener: () => void): () => void {
        return this.runtime.validateEngine.subscribe(this.scopeId, listener);
    }

    pushOverlayPatch(patch: Patch): void {
        this.runtime.overlayLayer.pushOverlay(this.scopeId, patch);
    }

    clearOverlay(): void {
        this.runtime.overlayLayer.clearOverlay(this.scopeId);
    }

    commitIntentPatch(patch: Patch, meta: CommitMeta = {}): CommitResult {
        return this.runtime.commitController.commit(patch, {
            ...meta,
            scopeId: meta.scopeId ?? this.scopeId,
        });
    }

    dispatchAction(actionId: string, payload?: unknown): void {
        this.runtime.dispatchAction(this.scopeId, actionId, payload);
    }
}

export class GraphiteRuntime {
    readonly intentStore = new IntentStore();
    readonly metrics: GraphiteMetrics;
    readonly overlayLayer: OverlayLayer;
    readonly validatorRegistry = new ValidatorRegistry();
    readonly validateEngine: ValidateEngine;
    readonly history?: HistoryManager;
    readonly eventLog?: EventLog;
    readonly commitController: CommitController;
    readonly effectRunner: EffectRunner;

    private readonly scopes = new Map<ScopeId, GraphiteScopeRuntime>();
    private actionDispatchHandler?: ActionDispatchHandler;

    constructor(options: GraphiteRuntimeOptions = {}) {
        this.metrics = options.metrics ?? new GraphiteMetrics();
        this.history = options.enableHistory ? new HistoryManager() : undefined;
        this.eventLog = options.enableEventLog ? new EventLog() : undefined;
        this.overlayLayer = new OverlayLayer(this.intentStore, this.metrics);
        this.validateEngine = new ValidateEngine(
            this.validatorRegistry,
            (scopeId) => this.overlayLayer.readIntentSnapshot(scopeId),
            {
                mode: options.validateMode ?? 'lazy',
                metrics: this.metrics,
            },
        );

        this.commitController = new CommitController(this.intentStore.graph, {
            history: this.history,
            eventLog: this.eventLog,
            metrics: this.metrics,
            onTouchedKeys: (touchedKeys) => {
                for (const scope of this.scopes.values()) {
                    scope.queryEngine.invalidateTouchedKeys(touchedKeys);
                    this.validateEngine.onSnapshotChanged(scope.scopeId);
                }
            },
        });

        this.overlayLayer.subscribe((scopeId, touchedKeys) => {
            const scope = this.scopes.get(scopeId);
            if (!scope) {
                return;
            }

            scope.queryEngine.invalidateTouchedKeys(touchedKeys);
            this.validateEngine.onSnapshotChanged(scopeId);
        });

        this.effectRunner = new EffectRunner(this.commitController, {
            metrics: this.metrics,
        });
        this.effectRunner.start();
    }

    getScope(scopeId: ScopeId): GraphiteScopeRuntime {
        let scope = this.scopes.get(scopeId);
        if (!scope) {
            scope = new GraphiteScopeRuntime(scopeId, this);
            this.scopes.set(scopeId, scope);
            this.validateEngine.onSnapshotChanged(scopeId);
        }

        return scope;
    }

    registerValidator<TSlice>(facetName: string, validator: Validator<TSlice>): void {
        this.validatorRegistry.register(facetName, validator);
        for (const scope of this.scopes.values()) {
            this.validateEngine.onSnapshotChanged(scope.scopeId);
        }
    }

    registerEffect(effect: CommitEffect): () => void {
        return this.effectRunner.registerEffect(effect);
    }

    setActionDispatchHandler(handler: ActionDispatchHandler): void {
        this.actionDispatchHandler = handler;
    }

    dispatchAction(scopeId: ScopeId, actionId: string, payload?: unknown): void {
        this.actionDispatchHandler?.(scopeId, actionId, payload);
    }

    commitIntentPatch(patch: Patch, meta: CommitMeta = {}): CommitResult {
        return this.commitController.commit(patch, meta);
    }

    pushOverlayPatch(scopeId: ScopeId, patch: Patch): void {
        this.overlayLayer.pushOverlay(scopeId, patch);
    }

    clearOverlay(scopeId: ScopeId): void {
        this.overlayLayer.clearOverlay(scopeId);
    }

    undo(): CommitResult | undefined {
        return this.history?.undo((patch, meta) => this.commitController.commit(patch, meta));
    }

    redo(): CommitResult | undefined {
        return this.history?.redo((patch, meta) => this.commitController.commit(patch, meta));
    }
}
