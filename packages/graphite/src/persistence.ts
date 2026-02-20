import { $set } from './dsl';
import type {
  GraphState,
  GraphiteStore,
  MutationPatch,
} from './types';

export type GraphitePersistenceStrategy = 'state' | 'commits';

export interface GraphitePersistenceSnapshot<
  TState extends GraphState = GraphState,
> {
  version: 1;
  strategy: GraphitePersistenceStrategy;
  storedAt: number;
  state?: TState;
  commits?: MutationPatch[];
}

export interface GraphitePersistenceAdapter<
  TState extends GraphState = GraphState,
> {
  load():
    | GraphitePersistenceSnapshot<TState>
    | null
    | Promise<GraphitePersistenceSnapshot<TState> | null>;
  save(
    snapshot: GraphitePersistenceSnapshot<TState>
  ): void | Promise<void>;
  clear?(): void | Promise<void>;
}

export interface GraphitePersistenceOptions<
  TState extends GraphState = GraphState,
> {
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

function cloneForPersistence<T>(value: T): T {
  const structured = globalThis.structuredClone as
    | ((source: T) => T)
    | undefined;

  if (typeof structured === 'function') {
    try {
      return structured(value);
    } catch {
      // Fall through.
    }
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function toSnapshot<TState extends GraphState>(
  store: GraphiteStore<TState>,
  strategy: GraphitePersistenceStrategy,
  maxCommits: number
): GraphitePersistenceSnapshot<TState> {
  if (strategy === 'commits') {
    const commits = store
      .getCommitLog()
      .slice(-Math.max(1, maxCommits))
      .map((record) => cloneForPersistence(record.patch));

    return {
      version: 1,
      strategy,
      storedAt: Date.now(),
      commits,
    };
  }

  return {
    version: 1,
    strategy,
    storedAt: Date.now(),
    state: cloneForPersistence(store.getState() as TState),
  };
}

function isPersistenceSnapshot<TState extends GraphState>(
  value: unknown
): value is GraphitePersistenceSnapshot<TState> {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<GraphitePersistenceSnapshot<TState>>;
  if (candidate.version !== 1) return false;
  if (candidate.strategy !== 'state' && candidate.strategy !== 'commits') {
    return false;
  }
  return true;
}

async function hydrateFromSnapshot<TState extends GraphState>(
  store: GraphiteStore<TState>,
  snapshot: GraphitePersistenceSnapshot<TState>
) {
  if (snapshot.strategy === 'commits') {
    const commits = Array.isArray(snapshot.commits) ? snapshot.commits : [];
    for (const patch of commits) {
      store.materializeExternalPatch(cloneForPersistence(patch), {
        persistence: true,
        persistenceStrategy: 'commits',
      });
    }
    return commits.length > 0;
  }

  if (!snapshot.state) {
    return false;
  }

  store.materializeExternalPatch($set(cloneForPersistence(snapshot.state)), {
    persistence: true,
    persistenceStrategy: 'state',
  });
  return true;
}

export function attachGraphitePersistence<TState extends GraphState = GraphState>(
  store: GraphiteStore<TState>,
  options: GraphitePersistenceOptions<TState>
): GraphitePersistenceController {
  const strategy = options.strategy ?? 'state';
  const debounceMs = Math.max(0, Math.trunc(options.debounceMs ?? 80));
  const maxCommits = Math.max(1, Math.trunc(options.maxCommits ?? 200));

  let disposed = false;
  let hydrating = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inflightSave: Promise<void> | null = null;

  const saveNow = async () => {
    if (disposed || hydrating) return;
    const snapshot = toSnapshot(store, strategy, maxCommits);
    await options.adapter.save(snapshot);
  };

  const flush = async () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (inflightSave) {
      await inflightSave;
      return;
    }

    inflightSave = saveNow().finally(() => {
      inflightSave = null;
    });
    await inflightSave;
  };

  const schedule = () => {
    if (disposed || hydrating) return;
    if (debounceMs === 0) {
      void flush();
      return;
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      void flush();
    }, debounceMs);
  };

  const unsubscribe = store.onCommit(() => {
    schedule();
  });

  return {
    hydrate: async () => {
      if (disposed) return false;
      hydrating = true;
      try {
        const loaded = await options.adapter.load();
        if (!loaded || !isPersistenceSnapshot<TState>(loaded)) {
          return false;
        }
        return await hydrateFromSnapshot(store, loaded);
      } finally {
        hydrating = false;
      }
    },
    flush,
    clear: async () => {
      if (options.adapter.clear) {
        await options.adapter.clear();
      }
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      unsubscribe();
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}

export interface LocalStoragePersistenceAdapterOptions {
  key: string;
  storage?: Storage;
}

function resolveStorage(storage?: Storage): Storage | null {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage ?? null;
}

export function createLocalStoragePersistenceAdapter<
  TState extends GraphState = GraphState,
>(
  options: LocalStoragePersistenceAdapterOptions
): GraphitePersistenceAdapter<TState> {
  return {
    load: () => {
      const storage = resolveStorage(options.storage);
      if (!storage) return null;
      const raw = storage.getItem(options.key);
      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw) as unknown;
        if (!isPersistenceSnapshot<TState>(parsed)) {
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    },
    save: (snapshot) => {
      const storage = resolveStorage(options.storage);
      if (!storage) return;
      storage.setItem(options.key, JSON.stringify(snapshot));
    },
    clear: () => {
      const storage = resolveStorage(options.storage);
      if (!storage) return;
      storage.removeItem(options.key);
    },
  };
}
