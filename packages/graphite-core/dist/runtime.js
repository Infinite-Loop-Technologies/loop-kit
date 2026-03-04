import { EffectRunner } from './effects/effectRunner.js';
import { HistoryManager } from './history/history.js';
import { OverlayLayer } from './intent/overlay.js';
import { IntentStore } from './intent/intentStore.js';
import { GraphiteMetrics } from './instrument/metrics.js';
import { InteractionRuntime } from './interaction/interactionRuntime.js';
import { QueryEngine } from './query/queryEngine.js';
import { CommitController, EventLog, } from './store/commit.js';
import { ValidateEngine } from './validate/validateEngine.js';
import { ValidatorRegistry } from './validate/validatorRegistry.js';
export class GraphiteScopeRuntime {
    scopeId;
    runtime;
    queryEngine;
    interactionRuntime;
    constructor(scopeId, runtime) {
        this.scopeId = scopeId;
        this.runtime = runtime;
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
    subscribeStateView(listener) {
        return this.runtime.validateEngine.subscribe(this.scopeId, listener);
    }
    pushOverlayPatch(patch) {
        this.runtime.overlayLayer.pushOverlay(this.scopeId, patch);
    }
    clearOverlay() {
        this.runtime.overlayLayer.clearOverlay(this.scopeId);
    }
    commitIntentPatch(patch, meta = {}) {
        return this.runtime.commitController.commit(patch, {
            ...meta,
            scopeId: meta.scopeId ?? this.scopeId,
        });
    }
    dispatchAction(actionId, payload) {
        this.runtime.dispatchAction(this.scopeId, actionId, payload);
    }
}
export class GraphiteRuntime {
    intentStore = new IntentStore();
    metrics;
    overlayLayer;
    validatorRegistry = new ValidatorRegistry();
    validateEngine;
    history;
    eventLog;
    commitController;
    effectRunner;
    scopes = new Map();
    actionDispatchHandler;
    constructor(options = {}) {
        this.metrics = options.metrics ?? new GraphiteMetrics();
        this.history = options.enableHistory ? new HistoryManager() : undefined;
        this.eventLog = options.enableEventLog ? new EventLog() : undefined;
        this.overlayLayer = new OverlayLayer(this.intentStore, this.metrics);
        this.validateEngine = new ValidateEngine(this.validatorRegistry, (scopeId) => this.overlayLayer.readIntentSnapshot(scopeId), {
            mode: options.validateMode ?? 'lazy',
            metrics: this.metrics,
        });
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
    getScope(scopeId) {
        let scope = this.scopes.get(scopeId);
        if (!scope) {
            scope = new GraphiteScopeRuntime(scopeId, this);
            this.scopes.set(scopeId, scope);
            this.validateEngine.onSnapshotChanged(scopeId);
        }
        return scope;
    }
    registerValidator(facetName, validator) {
        this.validatorRegistry.register(facetName, validator);
        for (const scope of this.scopes.values()) {
            this.validateEngine.onSnapshotChanged(scope.scopeId);
        }
    }
    registerEffect(effect) {
        return this.effectRunner.registerEffect(effect);
    }
    setActionDispatchHandler(handler) {
        this.actionDispatchHandler = handler;
    }
    dispatchAction(scopeId, actionId, payload) {
        this.actionDispatchHandler?.(scopeId, actionId, payload);
    }
    commitIntentPatch(patch, meta = {}) {
        return this.commitController.commit(patch, meta);
    }
    pushOverlayPatch(scopeId, patch) {
        this.overlayLayer.pushOverlay(scopeId, patch);
    }
    clearOverlay(scopeId) {
        this.overlayLayer.clearOverlay(scopeId);
    }
    undo() {
        return this.history?.undo((patch, meta) => this.commitController.commit(patch, meta));
    }
    redo() {
        return this.history?.redo((patch, meta) => this.commitController.commit(patch, meta));
    }
}
//# sourceMappingURL=runtime.js.map