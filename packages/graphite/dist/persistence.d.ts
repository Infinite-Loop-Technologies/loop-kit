import type { GraphState, GraphiteStore, MutationPatch } from './types';
export type GraphitePersistenceStrategy = 'state' | 'commits';
export interface GraphitePersistenceSnapshot<TState extends GraphState = GraphState> {
    version: 1;
    strategy: GraphitePersistenceStrategy;
    storedAt: number;
    state?: TState;
    commits?: MutationPatch[];
}
export interface GraphitePersistenceAdapter<TState extends GraphState = GraphState> {
    load(): GraphitePersistenceSnapshot<TState> | null | Promise<GraphitePersistenceSnapshot<TState> | null>;
    save(snapshot: GraphitePersistenceSnapshot<TState>): void | Promise<void>;
    clear?(): void | Promise<void>;
}
export interface GraphitePersistenceOptions<TState extends GraphState = GraphState> {
    adapter: GraphitePersistenceAdapter<TState>;
    strategy?: GraphitePersistenceStrategy;
    debounceMs?: number;
    maxCommits?: number;
}
export interface GraphitePersistenceController {
    hydrate(): Promise<boolean>;
    flush(): Promise<void>;
    clear(): Promise<void>;
    dispose(): void;
}
export declare function attachGraphitePersistence<TState extends GraphState = GraphState>(store: GraphiteStore<TState>, options: GraphitePersistenceOptions<TState>): GraphitePersistenceController;
export interface LocalStoragePersistenceAdapterOptions {
    key: string;
    storage?: Storage;
}
export declare function createLocalStoragePersistenceAdapter<TState extends GraphState = GraphState>(options: LocalStoragePersistenceAdapterOptions): GraphitePersistenceAdapter<TState>;
//# sourceMappingURL=persistence.d.ts.map