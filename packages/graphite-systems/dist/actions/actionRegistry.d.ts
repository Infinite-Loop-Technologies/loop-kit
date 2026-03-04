import type { GraphiteScopeRuntime, IntentSnapshotReader, StateView } from '@loop-kit/graphite-core';
export type ActionDefinition<TPayload = unknown> = {
    label: string;
    when?: (context: ActionContext, payload: TPayload) => boolean;
    run: (context: ActionContext, payload: TPayload) => void;
};
export type ActionContext = {
    scope: GraphiteScopeRuntime;
    snapshot: IntentSnapshotReader;
    stateView: StateView;
};
export declare class ActionRegistry {
    private readonly actions;
    registerAction<TPayload>(id: string, definition: ActionDefinition<TPayload>): () => void;
    canRun<TPayload>(id: string, context: ActionContext, payload: TPayload): boolean;
    dispatch<TPayload>(id: string, context: ActionContext, payload: TPayload): boolean;
    getAction(id: string): ActionDefinition | undefined;
    listActionIds(): string[];
}
//# sourceMappingURL=actionRegistry.d.ts.map