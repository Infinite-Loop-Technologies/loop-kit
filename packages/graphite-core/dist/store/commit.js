import { extractTouchedKeysFromPatch } from '../query/depKeys.js';
import { applyPatch, createPatch, } from './patch.js';
export class EventLog {
    entries = [];
    nextId = 1;
    append(commit) {
        const entry = {
            id: this.nextId,
            commit,
        };
        this.nextId += 1;
        this.entries.push(entry);
        return entry;
    }
    list() {
        return this.entries;
    }
    clear() {
        this.entries = [];
    }
}
export class CommitController {
    store;
    options;
    listeners = new Set();
    constructor(store, options = {}) {
        this.store = store;
        this.options = options;
    }
    commit(patch, meta = {}) {
        const start = performance.now();
        const workingCopy = this.store.clone();
        const { appliedPatch, inversePatch } = applyPatch(workingCopy, patch);
        const version = workingCopy.bumpVersion();
        this.store.replaceFrom(workingCopy);
        const touchedKeys = extractTouchedKeysFromPatch(appliedPatch);
        const result = {
            version,
            touchedKeys,
            patch: appliedPatch,
            inversePatch,
            meta,
            timestamp: Date.now(),
        };
        this.options.onTouchedKeys?.(touchedKeys, result);
        this.options.eventLog?.append(result);
        if (this.options.history && meta.origin !== 'history' && meta.history !== false) {
            this.options.history.record({
                forward: appliedPatch,
                inverse: inversePatch,
                meta,
            });
        }
        for (const listener of this.listeners) {
            listener(result);
        }
        this.options.metrics?.increment('commit.count');
        this.options.metrics?.onCommitTime(performance.now() - start);
        return result;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    getStoreVersion() {
        return this.store.version;
    }
}
export function createCommitController(store, options = {}) {
    return new CommitController(store, options);
}
export function emptyCommitPatch() {
    return createPatch();
}
//# sourceMappingURL=commit.js.map