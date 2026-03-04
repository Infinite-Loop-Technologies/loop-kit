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

export class ActionRegistry {
    private readonly actions = new Map<string, ActionDefinition>();

    registerAction<TPayload>(
        id: string,
        definition: ActionDefinition<TPayload>,
    ): () => void {
        this.actions.set(id, definition as ActionDefinition);

        return () => {
            this.actions.delete(id);
        };
    }

    canRun<TPayload>(id: string, context: ActionContext, payload: TPayload): boolean {
        const action = this.actions.get(id);
        if (!action) {
            return false;
        }

        return action.when ? action.when(context, payload) : true;
    }

    dispatch<TPayload>(id: string, context: ActionContext, payload: TPayload): boolean {
        const action = this.actions.get(id);
        if (!action) {
            return false;
        }

        if (action.when && !action.when(context, payload)) {
            return false;
        }

        action.run(context, payload);
        return true;
    }

    getAction(id: string): ActionDefinition | undefined {
        return this.actions.get(id);
    }

    listActionIds(): string[] {
        return Array.from(this.actions.keys());
    }
}
