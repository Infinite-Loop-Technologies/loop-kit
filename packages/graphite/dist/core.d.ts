import type { CommitListener, CommitOptions, CommitRecord, DispatchIntentOptions, EventListener, GraphState, GraphiteStore, GraphiteStoreOptions, IntentProducer, MutationOperatorHandler, MutationPatch, QueryCapabilityScope, QueryInput, QueryInvalidationListener, QueryOperatorHandler, QueryRunEvent, QueryRunListener, QuerySubscription, QueryWatchOptions, StateListener } from './types';
/**
 * Graphite runtime implementation: commit pipeline, intent dispatch, query reactivity, and history.
 */
export declare class GraphiteRuntime<TState extends GraphState = GraphState> implements GraphiteStore<TState> {
    private readonly mutationOperators;
    private readonly queryOperators;
    private readonly intentProducers;
    private readonly queryPlanCache;
    private readonly commitListeners;
    private readonly eventListeners;
    private readonly queryRunListeners;
    private readonly invalidationListeners;
    private readonly stateListeners;
    private readonly activeQueries;
    private readonly maxCommits;
    private readonly eventMode;
    private readonly idFactory;
    private state;
    private commits;
    private readonly historyChannels;
    private commitCounter;
    private idCounter;
    constructor(options?: GraphiteStoreOptions<TState>);
    /**
     * Returns the current immutable state snapshot.
     */
    getState(): Readonly<TState>;
    /**
     * Applies a mutation patch and records a commit/diff.
     */
    commit(patch: MutationPatch, options?: CommitOptions<TState>): CommitRecord<TState>;
    /**
     * Applies an external patch source (filesystem, websocket, polling) with source metadata.
     */
    materializeExternalPatch(patch: MutationPatch, metadata?: Record<string, unknown>): CommitRecord<TState>;
    /**
     * Executes a one-off query against current state.
     */
    query<TResult>(query: QueryInput<TState, TResult>, scope?: QueryCapabilityScope): TResult;
    /**
     * Registers a reactive query subscription.
     */
    watchQuery<TResult>(query: QueryInput<TState, TResult>, listener: (value: TResult, event: QueryRunEvent<TState, TResult>) => void, options?: QueryWatchOptions<TState, TResult>): QuerySubscription<TState, TResult>;
    /**
     * Registers a custom mutation operator.
     */
    registerMutationOperator(name: string, handler: MutationOperatorHandler<TState>): () => void;
    /**
     * Registers a custom query operator.
     */
    registerQueryOperator(name: string, handler: QueryOperatorHandler<TState>): () => void;
    /**
     * Registers an intent producer by name.
     */
    registerIntent<TPayload>(name: string, producer: IntentProducer<TState, TPayload>): () => void;
    /**
     * Compiles and dispatches an intent, returning a commit when a patch is produced.
     */
    dispatchIntent<TPayload>(name: string, payload: TPayload, options?: DispatchIntentOptions<TState>): CommitRecord<TState> | null;
    onCommit(listener: CommitListener<TState>): () => void;
    onEvent(listener: EventListener<TState>): () => void;
    onQueryRun(listener: QueryRunListener<TState>): () => void;
    onInvalidation(listener: QueryInvalidationListener<TState>): () => void;
    onState(listener: StateListener<TState>): () => void;
    getCommitLog(): readonly CommitRecord<TState>[];
    /**
     * Returns whether undo is available for a given history channel.
     */
    canUndo(channel?: string): boolean;
    /**
     * Returns whether redo is available for a given history channel.
     */
    canRedo(channel?: string): boolean;
    /**
     * Applies the inverse patch for the latest undoable commit in a history channel.
     */
    undo(recordOrId?: string | CommitRecord<TState>, channel?: string): CommitRecord<TState> | null;
    /**
     * Re-applies the latest redone commit in a history channel.
     */
    redo(recordOrId?: string | CommitRecord<TState>, channel?: string): CommitRecord<TState> | null;
    private nextId;
    private getCompiledQuery;
    private executeQuery;
    private runActiveQuery;
    private updateHistoryStacks;
    private resolveHistoryChannel;
    private normalizeHistoryChannel;
    private getHistoryChannelState;
    private clampHistoryChannel;
    private toRequestedCommitId;
    private invalidateQueries;
    private resolveEvent;
}
/**
 * Creates a new Graphite runtime/store instance.
 */
export declare function createGraphStore<TState extends GraphState = GraphState>(options?: GraphiteStoreOptions<TState>): GraphiteRuntime<TState>;
//# sourceMappingURL=core.d.ts.map