export type GraphState = Record<string, unknown>;

export type PathSegment = string | number;
export type GraphPath = readonly PathSegment[];

export type EventMode = 'manual' | 'always' | 'when-observed';

export interface GraphNode<TData extends GraphState = GraphState> {
  id: string;
  type?: string;
  data?: TData;
  links?: Record<string, string[]>;
  [key: string]: unknown;
}

export const GRAPHITE_MUTATION_SYMBOL = Symbol.for('graphite.mutation.command');

export interface MutationCommand<Name extends string = string, Payload = unknown> {
  readonly [GRAPHITE_MUTATION_SYMBOL]: true;
  readonly kind: Name;
  readonly payload: Payload;
}

export interface MutationPatchObject {
  [key: string]: MutationPatchValue;
}

export type MutationPatchValue =
  | MutationCommand
  | MutationPatchObject
  | readonly unknown[]
  | unknown;

export type MutationPatch = MutationPatchObject | MutationCommand;

export interface ValueSnapshot {
  exists: boolean;
  value: unknown;
}

export interface MutationChange {
  path: GraphPath;
  operation: string;
  before: ValueSnapshot;
  after: ValueSnapshot;
}

export interface CommitDiff {
  changes: readonly MutationChange[];
  addedPaths: readonly GraphPath[];
  removedPaths: readonly GraphPath[];
  updatedPaths: readonly GraphPath[];
}

export interface CommitIntentFrame {
  name: string;
  payload?: unknown;
}

export interface GraphEvent {
  id: string;
  name: string;
  commitId: string;
  at: number;
  patch: MutationPatch;
  diff: CommitDiff;
  metadata?: Record<string, unknown>;
}

export interface CommitOptions<TState extends GraphState = GraphState> {
  intent?: CommitIntentFrame;
  source?: string;
  metadata?: Record<string, unknown>;
  emitEvent?: boolean;
  event?:
    | false
    | Partial<GraphEvent>
    | ((record: Readonly<CommitRecord<TState>>) => false | Partial<GraphEvent> | void);
}

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
  event?: GraphEvent;
  state: Readonly<TState>;
}

export interface QueryCapabilityScope {
  allow?: readonly GraphPath[];
  deny?: readonly GraphPath[];
}

export interface QueryRuntimeContext<TState extends GraphState = GraphState> {
  readonly state: Readonly<TState>;
  readonly scope?: QueryCapabilityScope;
  get(path: GraphPath): unknown;
}

export type QueryResolver<
  TState extends GraphState = GraphState,
  TResult = unknown,
> = (state: Readonly<TState>, ctx: QueryRuntimeContext<TState>) => TResult;

export type QueryShape = Record<string, unknown>;
export type QueryInput<
  TState extends GraphState = GraphState,
  TResult = unknown,
> = QueryShape | QueryResolver<TState, TResult>;

export type QueryRunReason = 'initial' | 'commit' | 'manual' | 'query-updated';

export interface QueryRunEvent<
  TState extends GraphState = GraphState,
  TResult = unknown,
> {
  queryId: string;
  reason: QueryRunReason;
  at: number;
  durationMs: number;
  dependencies: readonly GraphPath[];
  changedPaths?: readonly GraphPath[];
  result: TResult;
  state: Readonly<TState>;
}

export interface QueryInvalidationEvent<
  TState extends GraphState = GraphState,
> {
  queryId: string;
  at: number;
  dependencies: readonly GraphPath[];
  changedPaths: readonly GraphPath[];
  commit: Readonly<CommitRecord<TState>>;
}

export interface QueryWatchOptions<
  TState extends GraphState = GraphState,
  TResult = unknown,
> {
  fireImmediately?: boolean;
  equalityFn?: (prev: TResult, next: TResult) => boolean;
  scope?: QueryCapabilityScope;
}

export interface QuerySubscription<
  TState extends GraphState = GraphState,
  TResult = unknown,
> {
  readonly id: string;
  getCurrent(): TResult;
  update(query: QueryInput<TState, TResult>): TResult;
  run(): TResult;
  unsubscribe(): void;
}

export interface LinkMutationPayload {
  relation: string;
  to: string | readonly string[];
  from?: string;
  bidirectional?: boolean;
  inverseRelation?: string;
}

export interface UnlinkMutationPayload {
  relation: string;
  to?: string | readonly string[];
  from?: string;
  bidirectional?: boolean;
  inverseRelation?: string;
}

export interface MoveMutationPayload {
  from: number | string | GraphPath;
  to: number | string | GraphPath;
}

export interface MutationOperatorContext<TState extends GraphState = GraphState> {
  readonly state: TState;
  readonly path: GraphPath;
  readonly commitOptions: Readonly<CommitOptions<TState>>;
  get(target?: PathSegment | GraphPath): unknown;
  set(value: unknown, target?: PathSegment | GraphPath): void;
  merge(value: unknown, target?: PathSegment | GraphPath): void;
  del(target?: PathSegment | GraphPath): void;
  move(
    from: number | string | GraphPath,
    to: number | string | GraphPath,
    target?: PathSegment | GraphPath
  ): void;
  link(payload: LinkMutationPayload, target?: PathSegment | GraphPath): void;
  unlink(payload: UnlinkMutationPayload, target?: PathSegment | GraphPath): void;
  apply(command: MutationCommand, target?: PathSegment | GraphPath): void;
}

export type MutationOperatorHandler<TState extends GraphState = GraphState> = (
  ctx: MutationOperatorContext<TState>,
  payload: unknown
) => void;

export interface QueryOperatorContext<TState extends GraphState = GraphState> {
  readonly state: Readonly<TState>;
  readonly path: GraphPath;
  readonly scope?: QueryCapabilityScope;
  get(path: GraphPath): unknown;
}

export type QueryOperatorHandler<TState extends GraphState = GraphState> = (
  value: unknown,
  directive: unknown,
  ctx: QueryOperatorContext<TState>
) => unknown;

export interface IntentCompilerContext<TState extends GraphState = GraphState> {
  readonly state: Readonly<TState>;
  query<TResult>(query: QueryInput<TState, TResult>): TResult;
}

export interface CompiledIntent<TState extends GraphState = GraphState> {
  patch: MutationPatch;
  metadata?: Record<string, unknown>;
  event?: false | Partial<GraphEvent>;
}

export type IntentProducer<
  TState extends GraphState = GraphState,
  TPayload = unknown,
> = (
  payload: TPayload,
  ctx: IntentCompilerContext<TState>
) => MutationPatch | CompiledIntent<TState> | null | undefined;

export interface DispatchIntentOptions<TState extends GraphState = GraphState> {
  source?: string;
  metadata?: Record<string, unknown>;
  emitEvent?: boolean;
}

export type CommitListener<TState extends GraphState = GraphState> = (
  record: Readonly<CommitRecord<TState>>
) => void;

export type EventListener<TState extends GraphState = GraphState> = (
  event: Readonly<GraphEvent>,
  record: Readonly<CommitRecord<TState>>
) => void;

export type QueryRunListener<TState extends GraphState = GraphState> = (
  event: Readonly<QueryRunEvent<TState, unknown>>
) => void;

export type QueryInvalidationListener<TState extends GraphState = GraphState> = (
  event: Readonly<QueryInvalidationEvent<TState>>
) => void;

export type StateListener<TState extends GraphState = GraphState> = (
  state: Readonly<TState>,
  record: Readonly<CommitRecord<TState>>
) => void;

export interface GraphiteStoreOptions<TState extends GraphState = GraphState> {
  initialState?: TState;
  eventMode?: EventMode;
  maxCommits?: number;
  mutationOperators?: Record<string, MutationOperatorHandler<TState>>;
  queryOperators?: Record<string, QueryOperatorHandler<TState>>;
  idFactory?: () => string;
}

export interface GraphiteStore<TState extends GraphState = GraphState> {
  getState(): Readonly<TState>;
  commit(patch: MutationPatch, options?: CommitOptions<TState>): CommitRecord<TState>;
  materializeExternalPatch(
    patch: MutationPatch,
    metadata?: Record<string, unknown>
  ): CommitRecord<TState>;
  query<TResult>(query: QueryInput<TState, TResult>, scope?: QueryCapabilityScope): TResult;
  watchQuery<TResult>(
    query: QueryInput<TState, TResult>,
    listener: (value: TResult, event: QueryRunEvent<TState, TResult>) => void,
    options?: QueryWatchOptions<TState, TResult>
  ): QuerySubscription<TState, TResult>;
  registerMutationOperator(name: string, handler: MutationOperatorHandler<TState>): () => void;
  registerQueryOperator(name: string, handler: QueryOperatorHandler<TState>): () => void;
  registerIntent<TPayload>(
    name: string,
    producer: IntentProducer<TState, TPayload>
  ): () => void;
  dispatchIntent<TPayload>(
    name: string,
    payload: TPayload,
    options?: DispatchIntentOptions<TState>
  ): CommitRecord<TState> | null;
  onCommit(listener: CommitListener<TState>): () => void;
  onEvent(listener: EventListener<TState>): () => void;
  onQueryRun(listener: QueryRunListener<TState>): () => void;
  onInvalidation(listener: QueryInvalidationListener<TState>): () => void;
  onState(listener: StateListener<TState>): () => void;
  getCommitLog(): readonly CommitRecord<TState>[];
  canUndo(): boolean;
  canRedo(): boolean;
  undo(recordOrId?: string | CommitRecord<TState>): CommitRecord<TState> | null;
  redo(recordOrId?: string | CommitRecord<TState>): CommitRecord<TState> | null;
}

export type QueryDirectiveObject = Record<string, unknown>;

export type QueryMacro<Payload = unknown> = QueryDirectiveObject & {
  readonly __graphiteQueryMacro__?: Payload;
};
