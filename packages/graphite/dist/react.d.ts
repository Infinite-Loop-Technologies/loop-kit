import { type PropsWithChildren, type ReactElement } from 'react';
import type { CommitOptions, CommitRecord, DispatchIntentOptions, GraphState, GraphiteStore, MutationPatch, QueryInput, QueryWatchOptions } from './types';
import { type GraphitePersistenceOptions } from './persistence';
export interface GraphiteProviderProps<TState extends GraphState = GraphState> extends PropsWithChildren {
    store: GraphiteStore<TState>;
}
export declare function GraphiteProvider<TState extends GraphState>({ store, children, }: GraphiteProviderProps<TState>): ReactElement;
export declare function useGraphite<TState extends GraphState = GraphState>(): GraphiteStore<TState>;
export interface UseGraphiteQueryOptions<TState extends GraphState = GraphState, TResult = unknown> extends Omit<QueryWatchOptions<TState, TResult>, 'fireImmediately'> {
}
export declare function useQuery<TState extends GraphState, TResult>(query: QueryInput<TState, TResult>, options?: UseGraphiteQueryOptions<TState, TResult>): TResult;
export declare function useCommit<TState extends GraphState = GraphState>(): (patch: MutationPatch, options?: CommitOptions<TState>) => CommitRecord<TState>;
export declare function useHistory<TState extends GraphState = GraphState>(): {
    canUndo: boolean;
    canRedo: boolean;
    undo: (recordOrId?: string | CommitRecord<TState>) => CommitRecord<TState> | null;
    redo: (recordOrId?: string | CommitRecord<TState>) => CommitRecord<TState> | null;
};
export declare function useIntent<TState extends GraphState = GraphState>(): <TPayload>(name: string, payload: TPayload, options?: DispatchIntentOptions<TState>) => CommitRecord<TState> | null;
export interface UseGraphitePersistenceOptions<TState extends GraphState = GraphState> extends GraphitePersistenceOptions<TState> {
    hydrateOnMount?: boolean;
}
export declare function useGraphitePersistence<TState extends GraphState = GraphState>(options: UseGraphitePersistenceOptions<TState>): void;
export declare function useCommitLog<TState extends GraphState = GraphState>(limit?: number): readonly CommitRecord<TState>[];
export interface IntentShortcutContext<TState extends GraphState = GraphState, TPayload = unknown> {
    event: KeyboardEvent;
    state: Readonly<TState>;
    store: GraphiteStore<TState>;
    payload: TPayload | undefined;
}
export interface IntentShortcutExecutionContext<TState extends GraphState = GraphState> {
    event: KeyboardEvent;
    state: Readonly<TState>;
    store: GraphiteStore<TState>;
}
export interface IntentShortcut<TPayload = unknown, TState extends GraphState = GraphState> {
    shortcut: string;
    intent: string;
    description?: string;
    payload?: TPayload | ((context: IntentShortcutExecutionContext<TState>) => TPayload);
    when?: boolean | ((context: IntentShortcutContext<TState, TPayload>) => boolean);
    preventDefault?: boolean;
    allowInEditable?: boolean;
    stopPropagation?: boolean;
}
export interface UseIntentShortcutsOptions {
    enabled?: boolean;
    preventDefault?: boolean;
    allowInEditable?: boolean;
    stopPropagation?: boolean;
    capture?: boolean;
}
export declare function useIntentShortcuts<TState extends GraphState = GraphState, TPayload = unknown>(shortcuts: readonly IntentShortcut<TPayload, TState>[], options?: UseIntentShortcutsOptions): void;
export interface GraphiteInspectorProps {
    className?: string;
    maxRows?: number;
}
export declare function GraphiteInspector({ className, maxRows }: GraphiteInspectorProps): ReactElement;
export interface IntentBrowserProps<TPayload = unknown, TState extends GraphState = GraphState> {
    shortcuts: readonly IntentShortcut<TPayload, TState>[];
    bind?: boolean;
    active?: boolean;
    className?: string;
}
export declare function GraphiteIntentBrowser<TPayload = unknown, TState extends GraphState = GraphState>({ shortcuts, bind, active, className, }: IntentBrowserProps<TPayload, TState>): ReactElement;
//# sourceMappingURL=react.d.ts.map