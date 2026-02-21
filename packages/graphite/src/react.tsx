import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from 'react';
import type {
  CommitOptions,
  CommitRecord,
  DispatchIntentOptions,
  GraphEvent,
  GraphState,
  GraphiteStore,
  MutationPatch,
  QueryInput,
  QueryInvalidationEvent,
  QueryRunEvent,
  QuerySubscription,
  QueryWatchOptions,
} from './types';
import {
  attachGraphitePersistence,
  type GraphitePersistenceOptions,
} from './persistence';

const GraphiteContext = createContext<GraphiteStore<GraphState> | null>(null);

/**
 * React provider props for sharing a Graphite store through context.
 */
export interface GraphiteProviderProps<TState extends GraphState = GraphState>
  extends PropsWithChildren {
  store: GraphiteStore<TState>;
}

/**
 * Binds a Graphite store to React context.
 */
export function GraphiteProvider<TState extends GraphState>({
  store,
  children,
}: GraphiteProviderProps<TState>): ReactElement {
  return (
    <GraphiteContext.Provider value={store as GraphiteStore<GraphState>}>
      {children}
    </GraphiteContext.Provider>
  );
}

/**
 * Returns the current Graphite store from context.
 */
export function useGraphite<TState extends GraphState = GraphState>(): GraphiteStore<TState> {
  const store = useContext(GraphiteContext);
  if (!store) {
    throw new Error('useGraphite must be used inside <GraphiteProvider>.');
  }
  return store as GraphiteStore<TState>;
}

export interface UseGraphiteQueryOptions<
  TState extends GraphState = GraphState,
  TResult = unknown,
> extends Omit<QueryWatchOptions<TState, TResult>, 'fireImmediately'> {}

/**
 * React hook for reactive queries.
 */
export function useQuery<TState extends GraphState, TResult>(
  query: QueryInput<TState, TResult>,
  options: UseGraphiteQueryOptions<TState, TResult> = {}
): TResult {
  const store = useGraphite<TState>();
  const queryRef = useRef(query);
  queryRef.current = query;

  const [result, setResult] = useState<TResult>(() => store.query(query, options.scope));
  const subscriptionRef = useRef<QuerySubscription<TState, TResult> | null>(null);

  const scope = options.scope;
  const equalityFn = options.equalityFn;

  useEffect(() => {
    const subscription = store.watchQuery(
      queryRef.current,
      (nextResult) => {
        setResult(nextResult);
      },
      {
        fireImmediately: false,
        scope,
        equalityFn,
      }
    );

    subscriptionRef.current = subscription;
    setResult(subscription.getCurrent());

    return () => {
      subscriptionRef.current = null;
      subscription.unsubscribe();
    };
  }, [store, scope, equalityFn]);

  useEffect(() => {
    const subscription = subscriptionRef.current;
    if (!subscription) return;
    setResult(subscription.update(query));
  }, [query]);

  return result;
}

/**
 * Returns a stable callback for `store.commit`.
 */
export function useCommit<TState extends GraphState = GraphState>() {
  const store = useGraphite<TState>();
  return useCallback(
    (patch: MutationPatch, options?: CommitOptions<TState>) => store.commit(patch, options),
    [store]
  );
}

export interface UseHistoryOptions {
  channel?: string;
}

/**
 * Exposes undo/redo state and commands for a history channel.
 */
export function useHistory<TState extends GraphState = GraphState>(
  options: UseHistoryOptions = {}
) {
  const store = useGraphite<TState>();
  const channel = options.channel;
  const [state, setState] = useState(() => ({
    canUndo: store.canUndo(channel),
    canRedo: store.canRedo(channel),
  }));

  useEffect(() => {
    setState({
      canUndo: store.canUndo(channel),
      canRedo: store.canRedo(channel),
    });
  }, [store, channel]);

  useEffect(() => {
    return store.onCommit(() => {
      setState({
        canUndo: store.canUndo(channel),
        canRedo: store.canRedo(channel),
      });
    });
  }, [store, channel]);

  const undo = useCallback(
    (recordOrId?: string | CommitRecord<TState>) => store.undo(recordOrId, channel),
    [store, channel]
  );
  const redo = useCallback(
    (recordOrId?: string | CommitRecord<TState>) => store.redo(recordOrId, channel),
    [store, channel]
  );

  return {
    channel,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    undo,
    redo,
  };
}

/**
 * Returns a typed dispatcher for registered intents.
 */
export function useIntent<TState extends GraphState = GraphState>() {
  const store = useGraphite<TState>();
  const dispatch = useCallback(
    (name: string, payload: unknown, options?: DispatchIntentOptions<TState>) =>
      store.dispatchIntent(name, payload, options),
    [store]
  );

  return dispatch as <TPayload>(
    name: string,
    payload: TPayload,
    options?: DispatchIntentOptions<TState>
  ) => CommitRecord<TState> | null;
}

export interface UseGraphitePersistenceOptions<
  TState extends GraphState = GraphState,
> extends GraphitePersistenceOptions<TState> {
  hydrateOnMount?: boolean;
}

/**
 * Attaches a persistence adapter for the current store lifecycle.
 */
export function useGraphitePersistence<TState extends GraphState = GraphState>(
  options: UseGraphitePersistenceOptions<TState>
): void {
  const store = useGraphite<TState>();
  const {
    adapter,
    strategy,
    debounceMs,
    maxCommits,
    hydrateOnMount = true,
  } = options;

  useEffect(() => {
    const controller = attachGraphitePersistence(store, {
      adapter,
      strategy,
      debounceMs,
      maxCommits,
    });
    if (hydrateOnMount) {
      void controller.hydrate();
    }

    return () => {
      void controller.flush();
      controller.dispose();
    };
  }, [store, adapter, strategy, debounceMs, maxCommits, hydrateOnMount]);
}

/**
 * Returns a rolling window of recent commit records.
 */
export function useCommitLog<TState extends GraphState = GraphState>(
  limit = 50
): readonly CommitRecord<TState>[] {
  const store = useGraphite<TState>();
  const [records, setRecords] = useState<readonly CommitRecord<TState>[]>(() => {
    const all = store.getCommitLog();
    return all.slice(Math.max(0, all.length - limit));
  });

  useEffect(() => {
    return store.onCommit(() => {
      const all = store.getCommitLog();
      setRecords(all.slice(Math.max(0, all.length - limit)));
    });
  }, [store, limit]);

  return records;
}

export interface IntentShortcutContext<
  TState extends GraphState = GraphState,
  TPayload = unknown,
> {
  event: KeyboardEvent;
  state: Readonly<TState>;
  store: GraphiteStore<TState>;
  payload: TPayload | undefined;
}

export interface IntentShortcutExecutionContext<
  TState extends GraphState = GraphState,
> {
  event: KeyboardEvent;
  state: Readonly<TState>;
  store: GraphiteStore<TState>;
}

export interface IntentShortcut<
  TPayload = unknown,
  TState extends GraphState = GraphState,
> {
  shortcut: string;
  intent: string;
  description?: string;
  payload?: TPayload | ((context: IntentShortcutExecutionContext<TState>) => TPayload);
  dispatchOptions?: DispatchIntentOptions<TState>;
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

/**
 * Binds keyboard shortcuts to Graphite intents.
 */
export function useIntentShortcuts<TState extends GraphState = GraphState, TPayload = unknown>(
  shortcuts: readonly IntentShortcut<TPayload, TState>[],
  options: UseIntentShortcutsOptions = {}
): void {
  const store = useGraphite<TState>();
  const dispatchIntent = useIntent<TState>();
  const enabled = options.enabled ?? true;
  const preventDefault = options.preventDefault ?? true;
  const allowInEditable = options.allowInEditable ?? false;
  const stopPropagation = options.stopPropagation ?? true;
  const capture = options.capture ?? true;

  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const alreadyHandledKey = '__graphiteShortcutHandled';
      if ((event as KeyboardEvent & Record<string, unknown>)[alreadyHandledKey]) {
        return;
      }

      for (const shortcut of shortcutsRef.current) {
        if (!matchesShortcut(event, shortcut.shortcut)) {
          continue;
        }

        const allowInEditableForShortcut = shortcut.allowInEditable ?? allowInEditable;
        if (!allowInEditableForShortcut && isEditableEventTarget(event.target)) {
          continue;
        }

        const executionContext: IntentShortcutExecutionContext<TState> = {
          event,
          state: store.getState(),
          store,
        };
        const payload =
          typeof shortcut.payload === 'function'
            ? (shortcut.payload as (context: IntentShortcutExecutionContext<TState>) => TPayload)(
                executionContext
              )
            : shortcut.payload;
        const context: IntentShortcutContext<TState, TPayload> = {
          ...executionContext,
          payload,
        };
        const shouldRun =
          typeof shortcut.when === 'function'
            ? shortcut.when(context)
            : (shortcut.when ?? true);
        if (!shouldRun) {
          continue;
        }

        if (shortcut.preventDefault ?? preventDefault) {
          event.preventDefault();
          (event as KeyboardEvent & { returnValue?: boolean }).returnValue = false;
        }

        if (shortcut.stopPropagation ?? stopPropagation) {
          event.stopPropagation();
          event.stopImmediatePropagation();
        }

        (event as KeyboardEvent & Record<string, unknown>)[alreadyHandledKey] = true;
        dispatchIntent(shortcut.intent, payload as TPayload, shortcut.dispatchOptions);
        break;
      }
    };

    document.addEventListener('keydown', onKeyDown, { capture });
    return () => {
      document.removeEventListener('keydown', onKeyDown, { capture });
    };
  }, [store, dispatchIntent, enabled, preventDefault, allowInEditable, stopPropagation, capture]);
}

function normalizeShortcut(shortcut: string): string[] {
  return shortcut
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeShortcutToken(token: string): string {
  switch (token) {
    case 'cmd':
    case 'command':
      return 'meta';
    case 'option':
      return 'alt';
    case 'dot':
    case 'period':
      return '.';
    case 'comma':
      return ',';
    case 'esc':
      return 'escape';
    case 'del':
      return 'delete';
    case 'return':
      return 'enter';
    default:
      return token;
  }
}

function normalizeEventKey(key: string): string {
  return normalizeShortcutToken(key.toLowerCase());
}

function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = normalizeShortcut(shortcut).map((part) => normalizeShortcutToken(part));
  const key = normalizeEventKey(event.key);

  const requiresMod = parts.includes('mod') || parts.includes('cmdorctrl');
  const requiresCtrl = parts.includes('ctrl');
  const requiresMeta = parts.includes('meta');
  const requiresShift = parts.includes('shift');
  const requiresAlt = parts.includes('alt');

  if (requiresMod && !(event.ctrlKey || event.metaKey)) return false;
  if (requiresCtrl && !event.ctrlKey) return false;
  if (requiresMeta && !event.metaKey) return false;
  if (requiresShift && !event.shiftKey) return false;
  if (requiresAlt && !event.altKey) return false;

  const allowsCtrl = requiresCtrl || requiresMod;
  const allowsMeta = requiresMeta || requiresMod;
  if (!allowsCtrl && event.ctrlKey) return false;
  if (!allowsMeta && event.metaKey) return false;
  if (!requiresShift && event.shiftKey) return false;
  if (!requiresAlt && event.altKey) return false;

  const keyPart = parts.find(
    (part) =>
      part !== 'ctrl' &&
      part !== 'meta' &&
      part !== 'shift' &&
      part !== 'alt' &&
      part !== 'mod' &&
      part !== 'cmdorctrl'
  );

  if (!keyPart) return false;
  return key === keyPart;
}

function previewPatch(record: CommitRecord<GraphState>) {
  try {
    return JSON.stringify(record.patch, null, 2);
  } catch {
    return '[Patch preview unavailable]';
  }
}

function formatPath(path: readonly (string | number)[]): string {
  if (path.length === 0) return 'root';
  return path.map((segment) => String(segment)).join('.');
}

export interface GraphiteInspectorProps {
  className?: string;
  maxRows?: number;
}

/**
 * Lightweight inspector UI for commits, events, query runs, and invalidations.
 */
export function GraphiteInspector({ className, maxRows = 20 }: GraphiteInspectorProps): ReactElement {
  const store = useGraphite<GraphState>();
  const commits = useCommitLog<GraphState>(maxRows);
  const [events, setEvents] = useState<readonly GraphEvent[]>([]);
  const [queryRuns, setQueryRuns] = useState<
    readonly { id: number; event: QueryRunEvent<GraphState, unknown> }[]
  >([]);
  const [invalidations, setInvalidations] = useState<
    readonly { id: number; event: QueryInvalidationEvent<GraphState> }[]
  >([]);
  const queryRunRowId = useRef(0);
  const invalidationRowId = useRef(0);

  useEffect(() => {
    return store.onEvent((event) => {
      setEvents((prev) => [event, ...prev].slice(0, maxRows));
    });
  }, [store, maxRows]);

  useEffect(() => {
    return store.onQueryRun((event) => {
      queryRunRowId.current += 1;
      setQueryRuns((prev) =>
        [{ id: queryRunRowId.current, event }, ...prev].slice(0, maxRows)
      );
    });
  }, [store, maxRows]);

  useEffect(() => {
    return store.onInvalidation((event) => {
      invalidationRowId.current += 1;
      setInvalidations((prev) =>
        [{ id: invalidationRowId.current, event }, ...prev].slice(0, maxRows)
      );
    });
  }, [store, maxRows]);

  return (
    <div className={className}>
      <section>
        <h3>Graphite Commits</h3>
        <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid #d4d4d8', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th align='left'>#</th>
                <th align='left'>Source</th>
                <th align='left'>Intent</th>
                <th align='left'>Changed Paths</th>
              </tr>
            </thead>
            <tbody>
              {[...commits].reverse().slice(0, maxRows).map((record) => (
                <tr key={record.id}>
                  <td>{record.index}</td>
                  <td>{record.source}</td>
                  <td>{record.intent?.name ?? '-'}</td>
                  <td>{record.changedPaths.map((path) => formatPath(path)).join(', ') || 'none'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Latest Patch</h3>
        <pre
          style={{
            maxHeight: 180,
            overflow: 'auto',
            margin: 0,
            border: '1px solid #d4d4d8',
            borderRadius: 8,
            padding: 8,
            fontSize: 12,
          }}>
          {commits.length > 0 ? previewPatch(commits[commits.length - 1] as CommitRecord<GraphState>) : 'No commits yet'}
        </pre>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Events ({events.length})</h3>
        <div style={{ maxHeight: 140, overflow: 'auto', border: '1px solid #d4d4d8', borderRadius: 8, padding: 8 }}>
          {events.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12 }}>No events emitted.</p>
          ) : (
            events.map((event) => (
              <p key={event.id} style={{ margin: '2px 0', fontSize: 12 }}>
                <strong>{event.name}</strong> {'->'} commit {event.commitId}
              </p>
            ))
          )}
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Query Runs ({queryRuns.length})</h3>
        <div style={{ maxHeight: 140, overflow: 'auto', border: '1px solid #d4d4d8', borderRadius: 8, padding: 8 }}>
          {queryRuns.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12 }}>No query runs yet.</p>
          ) : (
            queryRuns.map((entry) => (
              <p key={entry.id} style={{ margin: '2px 0', fontSize: 12 }}>
                {entry.event.queryId}: {entry.event.reason} ({entry.event.durationMs.toFixed(2)}ms)
              </p>
            ))
          )}
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Invalidations ({invalidations.length})</h3>
        <div style={{ maxHeight: 140, overflow: 'auto', border: '1px solid #d4d4d8', borderRadius: 8, padding: 8 }}>
          {invalidations.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12 }}>No invalidations yet.</p>
          ) : (
            invalidations.map((entry) => (
              <p key={entry.id} style={{ margin: '2px 0', fontSize: 12 }}>
                {entry.event.queryId}: {entry.event.changedPaths.map((path) => formatPath(path)).join(', ')}
              </p>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export interface IntentBrowserProps<
  TPayload = unknown,
  TState extends GraphState = GraphState,
> {
  shortcuts: readonly IntentShortcut<TPayload, TState>[];
  bind?: boolean;
  active?: boolean;
  className?: string;
}

/**
 * Renders a table of intent shortcuts and can optionally bind them.
 */
export function GraphiteIntentBrowser<
  TPayload = unknown,
  TState extends GraphState = GraphState,
>({
  shortcuts,
  bind = false,
  active,
  className,
}: IntentBrowserProps<TPayload, TState>): ReactElement {
  useIntentShortcuts<TState, TPayload>(shortcuts, { enabled: bind });
  const isActive = active ?? bind;

  const sorted = useMemo(
    () => [...shortcuts].sort((left, right) => left.shortcut.localeCompare(right.shortcut)),
    [shortcuts]
  );

  return (
    <div className={className}>
      <h3>Intent Browser</h3>
      <div style={{ border: '1px solid #d4d4d8', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th align='left'>Shortcut</th>
              <th align='left'>Intent</th>
              <th align='left'>When</th>
              <th align='left'>Prevent</th>
              <th align='left'>Description</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry) => (
              <tr key={`${entry.shortcut}-${entry.intent}`}>
                <td>{entry.shortcut}</td>
                <td>{entry.intent}</td>
                <td>{typeof entry.when === 'undefined' ? 'always' : typeof entry.when === 'function' ? 'dynamic' : entry.when ? 'true' : 'false'}</td>
                <td>{entry.preventDefault === false ? 'no' : 'yes'}</td>
                <td>{entry.description ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isActive ? (
        <p style={{ marginTop: 8, fontSize: 12 }}>Keyboard shortcuts are currently active.</p>
      ) : (
        <p style={{ marginTop: 8, fontSize: 12 }}>Preview mode. Pass `bind=true` to enable shortcuts.</p>
      )}
    </div>
  );
}
