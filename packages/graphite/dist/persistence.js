import { $set } from './dsl';
function cloneForPersistence(value) {
    const structured = globalThis.structuredClone;
    if (typeof structured === 'function') {
        try {
            return structured(value);
        }
        catch {
            // Fall through.
        }
    }
    return JSON.parse(JSON.stringify(value));
}
function toSnapshot(store, strategy, maxCommits) {
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
        state: cloneForPersistence(store.getState()),
    };
}
function isPersistenceSnapshot(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const candidate = value;
    if (candidate.version !== 1)
        return false;
    if (candidate.strategy !== 'state' && candidate.strategy !== 'commits') {
        return false;
    }
    return true;
}
async function hydrateFromSnapshot(store, snapshot) {
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
export function attachGraphitePersistence(store, options) {
    const strategy = options.strategy ?? 'state';
    const debounceMs = Math.max(0, Math.trunc(options.debounceMs ?? 80));
    const maxCommits = Math.max(1, Math.trunc(options.maxCommits ?? 200));
    let disposed = false;
    let hydrating = false;
    let timer = null;
    let inflightSave = null;
    const saveNow = async () => {
        if (disposed || hydrating)
            return;
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
        if (disposed || hydrating)
            return;
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
            if (disposed)
                return false;
            hydrating = true;
            try {
                const loaded = await options.adapter.load();
                if (!loaded || !isPersistenceSnapshot(loaded)) {
                    return false;
                }
                return await hydrateFromSnapshot(store, loaded);
            }
            finally {
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
            if (disposed)
                return;
            disposed = true;
            unsubscribe();
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        },
    };
}
function resolveStorage(storage) {
    if (storage)
        return storage;
    if (typeof window === 'undefined')
        return null;
    return window.localStorage ?? null;
}
export function createLocalStoragePersistenceAdapter(options) {
    return {
        load: () => {
            const storage = resolveStorage(options.storage);
            if (!storage)
                return null;
            const raw = storage.getItem(options.key);
            if (!raw)
                return null;
            try {
                const parsed = JSON.parse(raw);
                if (!isPersistenceSnapshot(parsed)) {
                    return null;
                }
                return parsed;
            }
            catch {
                return null;
            }
        },
        save: (snapshot) => {
            const storage = resolveStorage(options.storage);
            if (!storage)
                return;
            storage.setItem(options.key, JSON.stringify(snapshot));
        },
        clear: () => {
            const storage = resolveStorage(options.storage);
            if (!storage)
                return;
            storage.removeItem(options.key);
        },
    };
}
//# sourceMappingURL=persistence.js.map