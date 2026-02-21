/**
 * Root state shape managed by Graphite.
 */
export type GraphState = Record<string, unknown>;
/**
 * A single segment in a graph/state path.
 */
export type PathSegment = string | number;
/**
 * A path into the graph/state tree.
 */
export type GraphPath = readonly PathSegment[];
/**
 * Controls when commit events are materialized.
 */
export type EventMode = 'manual' | 'always' | 'when-observed';
/**
 * Optional canonical shape for graph-like entities with typed links.
 */
export interface GraphNode<TData extends GraphState = GraphState> {
    id: string;
    type?: string;
    data?: TData;
    links?: Record<string, string[]>;
    [key: string]: unknown;
}
/**
 * Internal marker for mutation command objects.
 */
export declare const GRAPHITE_MUTATION_SYMBOL: unique symbol;
/**
 * A typed command used by the mutation DSL (for example `$set`, `$merge`).
 */
export interface MutationCommand<Name extends string = string, Payload = unknown> {
    readonly [GRAPHITE_MUTATION_SYMBOL]: true;
    readonly kind: Name;
    readonly payload: Payload;
}
/**
 * Recursive patch object where keys are paths and values are patch values.
 */
export interface MutationPatchObject {
    [key: string]: MutationPatchValue;
}
/**
 * Value allowed in patch trees.
 */
export type MutationPatchValue = MutationCommand | MutationPatchObject | readonly unknown[] | unknown;
/**
 * Top-level patch payload accepted by `commit`.
 */
export type MutationPatch = MutationPatchObject | MutationCommand;
/**
 * Lightweight snapshot used for diff generation.
 */
export interface ValueSnapshot {
    exists: boolean;
    value: unknown;
}
/**
 * Single change entry emitted in commit diffs.
 */
export interface MutationChange {
    path: GraphPath;
    operation: string;
    before: ValueSnapshot;
    after: ValueSnapshot;
}
/**
 * Aggregated change information for a commit.
 */
export interface CommitDiff {
    changes: readonly MutationChange[];
    addedPaths: readonly GraphPath[];
    removedPaths: readonly GraphPath[];
    updatedPaths: readonly GraphPath[];
}
/**
 * Optional semantic frame describing which intent produced a commit.
 */
export interface CommitIntentFrame {
    name: string;
    payload?: unknown;
}
/**
 * Optional fact/event emitted from a commit.
 */
export interface GraphEvent {
    id: string;
    name: string;
    commitId: string;
    at: number;
    patch: MutationPatch;
    diff: CommitDiff;
    metadata?: Record<string, unknown>;
}
/**
 * History stack options.
 */
export interface CommitHistoryOptions {
    channel?: string;
}
/**
 * Commit-time metadata and behavior flags.
 */
export interface CommitOptions<TState extends GraphState = GraphState> {
    intent?: CommitIntentFrame;
    source?: string;
    metadata?: Record<string, unknown>;
    history?: false | string | CommitHistoryOptions;
    emitEvent?: boolean;
    event?: false | Partial<GraphEvent> | ((record: Readonly<CommitRecord<TState>>) => false | Partial<GraphEvent> | void);
}
/**
 * Immutable record produced by each successful commit.
 */
export interface CommitRecord<TState extends GraphState = GraphState> {
    id: string;
    index: number;
    at: number;
    source: string;
    patch: MutationPatch;
    inversePatch: MutationPatch | null;
    diff: CommitDiff;
    changedPaths: readonly GraphPath[];
    metadata?: Record<string, unknown>;
    intent?: CommitIntentFrame;
    historyChannel?: string;
    event?: GraphEvent;
    state: Readonly<TState>;
}
/**
 * Optional path-based read restrictions applied to queries.
 */
export interface QueryCapabilityScope {
    allow?: readonly GraphPath[];
    deny?: readonly GraphPath[];
}
/**
 * Runtime context exposed to function-based queries.
 */
export interface QueryRuntimeContext<TState extends GraphState = GraphState> {
    readonly state: Readonly<TState>;
    readonly scope?: QueryCapabilityScope;
    get(path: GraphPath): unknown;
}
/**
 * Function-based query form.
 */
export type QueryResolver<TState extends GraphState = GraphState, TResult = unknown> = (state: Readonly<TState>, ctx: QueryRuntimeContext<TState>) => TResult;
export type QueryShape = Record<string, unknown>;
/**
 * Query input can be a declarative shape or a resolver function.
 */
export type QueryInput<TState extends GraphState = GraphState, TResult = unknown> = QueryShape | QueryResolver<TState, TResult>;
export type QueryRunReason = 'initial' | 'commit' | 'manual' | 'query-updated';
/**
 * Query execution telemetry event.
 */
export interface QueryRunEvent<TState extends GraphState = GraphState, TResult = unknown> {
    queryId: string;
    reason: QueryRunReason;
    at: number;
    durationMs: number;
    dependencies: readonly GraphPath[];
    changedPaths?: readonly GraphPath[];
    result: TResult;
    state: Readonly<TState>;
}
/**
 * Emitted when a commit invalidates a watched query.
 */
export interface QueryInvalidationEvent<TState extends GraphState = GraphState> {
    queryId: string;
    at: number;
    dependencies: readonly GraphPath[];
    changedPaths: readonly GraphPath[];
    commit: Readonly<CommitRecord<TState>>;
}
/**
 * Options for query subscriptions.
 */
export interface QueryWatchOptions<TState extends GraphState = GraphState, TResult = unknown> {
    fireImmediately?: boolean;
    equalityFn?: (prev: TResult, next: TResult) => boolean;
    scope?: QueryCapabilityScope;
}
/**
 * Handle for a live watched query.
 */
export interface QuerySubscription<TState extends GraphState = GraphState, TResult = unknown> {
    readonly id: string;
    getCurrent(): TResult;
    update(query: QueryInput<TState, TResult>): TResult;
    run(): TResult;
    unsubscribe(): void;
}
/**
 * Payload for `$link`.
 */
export interface LinkMutationPayload {
    relation: string;
    to: string | readonly string[];
    from?: string;
    bidirectional?: boolean;
    inverseRelation?: string;
    nodesPath?: GraphPath;
}
/**
 * Payload for `$unlink`.
 */
export interface UnlinkMutationPayload {
    relation: string;
    to?: string | readonly string[];
    from?: string;
    bidirectional?: boolean;
    inverseRelation?: string;
    nodesPath?: GraphPath;
}
/**
 * Payload for `$move`.
 */
export interface MoveMutationPayload {
    from: number | string | GraphPath;
    to: number | string | GraphPath;
}
/**
 * Mutable context supplied to custom mutation operators.
 */
export interface MutationOperatorContext<TState extends GraphState = GraphState> {
    readonly state: TState;
    readonly path: GraphPath;
    readonly commitOptions: Readonly<CommitOptions<TState>>;
    get(target?: PathSegment | GraphPath): unknown;
    set(value: unknown, target?: PathSegment | GraphPath): void;
    merge(value: unknown, target?: PathSegment | GraphPath): void;
    del(target?: PathSegment | GraphPath): void;
    move(from: number | string | GraphPath, to: number | string | GraphPath, target?: PathSegment | GraphPath): void;
    link(payload: LinkMutationPayload, target?: PathSegment | GraphPath): void;
    unlink(payload: UnlinkMutationPayload, target?: PathSegment | GraphPath): void;
    apply(command: MutationCommand, target?: PathSegment | GraphPath): void;
}
/**
 * Signature for registering custom mutation operators.
 */
export type MutationOperatorHandler<TState extends GraphState = GraphState> = (ctx: MutationOperatorContext<TState>, payload: unknown) => void;
/**
 * Context supplied to custom query operators.
 */
export interface QueryOperatorContext<TState extends GraphState = GraphState> {
    readonly state: Readonly<TState>;
    readonly path: GraphPath;
    readonly scope?: QueryCapabilityScope;
    get(path: GraphPath): unknown;
}
/**
 * Signature for registering custom query operators.
 */
export type QueryOperatorHandler<TState extends GraphState = GraphState> = (value: unknown, directive: unknown, ctx: QueryOperatorContext<TState>) => unknown;
/**
 * Intent compiler context passed to intent producers.
 */
export interface IntentCompilerContext<TState extends GraphState = GraphState> {
    readonly state: Readonly<TState>;
    query<TResult>(query: QueryInput<TState, TResult>): TResult;
}
/**
 * Rich output from an intent producer.
 */
export interface CompiledIntent<TState extends GraphState = GraphState> {
    patch: MutationPatch;
    metadata?: Record<string, unknown>;
    event?: false | Partial<GraphEvent>;
}
/**
 * Translates semantic intent payloads into executable patches.
 */
export type IntentProducer<TState extends GraphState = GraphState, TPayload = unknown> = (payload: TPayload, ctx: IntentCompilerContext<TState>) => MutationPatch | CompiledIntent<TState> | null | undefined;
/**
 * Runtime dispatch options for an intent execution.
 */
export interface DispatchIntentOptions<TState extends GraphState = GraphState> {
    source?: string;
    metadata?: Record<string, unknown>;
    emitEvent?: boolean;
    history?: CommitOptions<TState>['history'];
    event?: CommitOptions<TState>['event'];
}
export type CommitListener<TState extends GraphState = GraphState> = (record: Readonly<CommitRecord<TState>>) => void;
export type EventListener<TState extends GraphState = GraphState> = (event: Readonly<GraphEvent>, record: Readonly<CommitRecord<TState>>) => void;
export type QueryRunListener<TState extends GraphState = GraphState> = (event: Readonly<QueryRunEvent<TState, unknown>>) => void;
export type QueryInvalidationListener<TState extends GraphState = GraphState> = (event: Readonly<QueryInvalidationEvent<TState>>) => void;
export type StateListener<TState extends GraphState = GraphState> = (state: Readonly<TState>, record: Readonly<CommitRecord<TState>>) => void;
/**
 * Store construction options.
 */
export interface GraphiteStoreOptions<TState extends GraphState = GraphState> {
    initialState?: TState;
    eventMode?: EventMode;
    maxCommits?: number;
    mutationOperators?: Record<string, MutationOperatorHandler<TState>>;
    queryOperators?: Record<string, QueryOperatorHandler<TState>>;
    idFactory?: () => string;
}
/**
 * Public Graphite runtime contract.
 */
export interface GraphiteStore<TState extends GraphState = GraphState> {
    /**
     * Returns the current immutable state snapshot.
     */
    getState(): Readonly<TState>;
    /**
     * Applies a patch and creates a commit record.
     */
    commit(patch: MutationPatch, options?: CommitOptions<TState>): CommitRecord<TState>;
    /**
     * Commits an external patch (for sync/connectors) without emitting events by default.
     */
    materializeExternalPatch(patch: MutationPatch, metadata?: Record<string, unknown>): CommitRecord<TState>;
    /**
     * Executes a one-off query.
     */
    query<TResult>(query: QueryInput<TState, TResult>, scope?: QueryCapabilityScope): TResult;
    /**
     * Subscribes to a reactive query and re-runs it on invalidation.
     */
    watchQuery<TResult>(query: QueryInput<TState, TResult>, listener: (value: TResult, event: QueryRunEvent<TState, TResult>) => void, options?: QueryWatchOptions<TState, TResult>): QuerySubscription<TState, TResult>;
    /**
     * Registers a custom mutation operator (for example `$myMutation`).
     */
    registerMutationOperator(name: string, handler: MutationOperatorHandler<TState>): () => void;
    /**
     * Registers a custom query operator (for example `$myFilter`).
     */
    registerQueryOperator(name: string, handler: QueryOperatorHandler<TState>): () => void;
    /**
     * Registers an intent producer.
     */
    registerIntent<TPayload>(name: string, producer: IntentProducer<TState, TPayload>): () => void;
    /**
     * Dispatches a registered intent and returns its commit, or `null` if it produced no patch.
     */
    dispatchIntent<TPayload>(name: string, payload: TPayload, options?: DispatchIntentOptions<TState>): CommitRecord<TState> | null;
    onCommit(listener: CommitListener<TState>): () => void;
    onEvent(listener: EventListener<TState>): () => void;
    onQueryRun(listener: QueryRunListener<TState>): () => void;
    onInvalidation(listener: QueryInvalidationListener<TState>): () => void;
    onState(listener: StateListener<TState>): () => void;
    getCommitLog(): readonly CommitRecord<TState>[];
    /**
     * Returns whether undo is available for a history channel.
     */
    canUndo(channel?: string): boolean;
    /**
     * Returns whether redo is available for a history channel.
     */
    canRedo(channel?: string): boolean;
    /**
     * Applies inverse patch of the latest undoable commit in a channel.
     */
    undo(recordOrId?: string | CommitRecord<TState>, channel?: string): CommitRecord<TState> | null;
    /**
     * Re-applies the latest redone commit in a channel.
     */
    redo(recordOrId?: string | CommitRecord<TState>, channel?: string): CommitRecord<TState> | null;
}
export type QueryDirectiveObject = Record<string, unknown>;
/**
 * Marker type for query macro helpers.
 */
export type QueryMacro<Payload = unknown> = QueryDirectiveObject & {
    readonly __graphiteQueryMacro__?: Payload;
};
//# sourceMappingURL=types.d.ts.map