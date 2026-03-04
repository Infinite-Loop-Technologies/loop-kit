import { EffectRunner } from './effects/effectRunner.js';
import type { CommitEffect } from './effects/effectTypes.js';
import { HistoryManager } from './history/history.js';
import { OverlayLayer } from './intent/overlay.js';
import { IntentStore } from './intent/intentStore.js';
import { GraphiteMetrics } from './instrument/metrics.js';
import { InteractionRuntime } from './interaction/interactionRuntime.js';
import { QueryEngine } from './query/queryEngine.js';
import { CommitController, EventLog, type CommitMeta, type CommitResult } from './store/commit.js';
import type { Patch } from './store/patch.js';
import type { ScopeId } from './types/ids.js';
import { ValidateEngine, type ValidateMode } from './validate/validateEngine.js';
import { ValidatorRegistry, type Validator } from './validate/validatorRegistry.js';
export type ActionDispatchHandler = (scopeId: ScopeId, actionId: string, payload: unknown) => void;
export type GraphiteRuntimeOptions = {
    validateMode?: ValidateMode;
    enableHistory?: boolean;
    enableEventLog?: boolean;
    metrics?: GraphiteMetrics;
};
export declare class GraphiteScopeRuntime {
    readonly scopeId: ScopeId;
    private readonly runtime;
    readonly queryEngine: QueryEngine;
    readonly interactionRuntime: InteractionRuntime;
    constructor(scopeId: ScopeId, runtime: GraphiteRuntime);
    getStateView(): import("./validate/validateEngine.js").StateView;
    subscribeStateView(listener: () => void): () => void;
    pushOverlayPatch(patch: Patch): void;
    clearOverlay(): void;
    commitIntentPatch(patch: Patch, meta?: CommitMeta): CommitResult;
    dispatchAction(actionId: string, payload?: unknown): void;
}
export declare class GraphiteRuntime {
    readonly intentStore: IntentStore;
    readonly metrics: GraphiteMetrics;
    readonly overlayLayer: OverlayLayer;
    readonly validatorRegistry: ValidatorRegistry;
    readonly validateEngine: ValidateEngine;
    readonly history?: HistoryManager;
    readonly eventLog?: EventLog;
    readonly commitController: CommitController;
    readonly effectRunner: EffectRunner;
    private readonly scopes;
    private actionDispatchHandler?;
    constructor(options?: GraphiteRuntimeOptions);
    getScope(scopeId: ScopeId): GraphiteScopeRuntime;
    registerValidator<TSlice>(facetName: string, validator: Validator<TSlice>): void;
    registerEffect(effect: CommitEffect): () => void;
    setActionDispatchHandler(handler: ActionDispatchHandler): void;
    dispatchAction(scopeId: ScopeId, actionId: string, payload?: unknown): void;
    commitIntentPatch(patch: Patch, meta?: CommitMeta): CommitResult;
    pushOverlayPatch(scopeId: ScopeId, patch: Patch): void;
    clearOverlay(scopeId: ScopeId): void;
    undo(): CommitResult | undefined;
    redo(): CommitResult | undefined;
}
//# sourceMappingURL=runtime.d.ts.map