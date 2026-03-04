import type { CommitMeta, GraphiteRuntime, GraphiteScopeRuntime, Patch, QueryFn, QueryCtx, ScopeId } from '@loop-kit/graphite-core';
export type GraphiteProviderValue = {
    runtime: GraphiteRuntime;
    scopeId: ScopeId;
    scope: GraphiteScopeRuntime;
};
export type UseQueryOptions = {
    deps?: readonly unknown[];
};
export type UseDispatchApi = {
    dispatchAction: (actionId: string, payload?: unknown) => void;
    commitIntentPatch: (patch: Patch, meta?: CommitMeta) => void;
    overlay: {
        pushOverlayPatch: (patch: Patch) => void;
        clearOverlay: () => void;
    };
};
export type QueryCallback<T> = QueryFn<T>;
export type QueryContext = QueryCtx;
//# sourceMappingURL=types.d.ts.map