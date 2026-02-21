import { type GraphPath, type GraphState, type GraphiteStore } from '@loop-kit/graphite';
import { type DockPolicyConfig } from './model';
export interface RegisterDockIntentsOptions<TState extends GraphState = GraphState> {
    path?: GraphPath;
    intentPrefix?: string;
    defaultMetadata?: Record<string, unknown>;
    policy?: DockPolicyConfig;
    selectDock?: (state: Readonly<TState>) => unknown;
}
export interface DockIntentNames {
    activatePanel: string;
    movePanel: string;
    resize: string;
    removePanel: string;
    addPanel: string;
}
export declare function createDockIntentNames(intentPrefix?: string): DockIntentNames;
/**
 * Registers dock domain intents on a Graphite store. Each intent:
 * read current dock state -> reduce action -> normalize -> write patched dock subtree.
 */
export declare function registerDockIntents<TState extends GraphState = GraphState>(store: GraphiteStore<TState>, options?: RegisterDockIntentsOptions<TState>): {
    dispose: () => void;
    intents: DockIntentNames;
};
//# sourceMappingURL=intents.d.ts.map