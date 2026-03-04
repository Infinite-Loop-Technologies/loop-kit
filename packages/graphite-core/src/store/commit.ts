import type { ScopeId } from '../types/ids.js';
import { extractTouchedKeysFromPatch } from '../query/depKeys.js';
import type { HistoryManager } from '../history/history.js';
import type { GraphiteMetrics } from '../instrument/metrics.js';
import { GraphStore } from './graphStore.js';
import {
    type Patch,
    applyPatch,
    createPatch,
} from './patch.js';

export type CommitMeta = {
    origin?: string;
    scopeId?: ScopeId;
    history?: boolean;
    [key: string]: unknown;
};

export type CommitResult = {
    version: number;
    touchedKeys: Set<string>;
    patch: Patch;
    inversePatch: Patch;
    meta: CommitMeta;
    timestamp: number;
};

export type CommitListener = (result: CommitResult) => void;

export type EventLogEntry = {
    id: number;
    commit: CommitResult;
};

export class EventLog {
    private entries: EventLogEntry[] = [];
    private nextId = 1;

    append(commit: CommitResult): EventLogEntry {
        const entry: EventLogEntry = {
            id: this.nextId,
            commit,
        };

        this.nextId += 1;
        this.entries.push(entry);
        return entry;
    }

    list(): readonly EventLogEntry[] {
        return this.entries;
    }

    clear(): void {
        this.entries = [];
    }
}

export type CommitControllerOptions = {
    history?: HistoryManager;
    eventLog?: EventLog;
    metrics?: GraphiteMetrics;
    onTouchedKeys?: (touchedKeys: Set<string>, result: CommitResult) => void;
};

export class CommitController {
    private listeners = new Set<CommitListener>();

    constructor(
        private readonly store: GraphStore,
        private readonly options: CommitControllerOptions = {},
    ) {}

    commit(patch: Patch, meta: CommitMeta = {}): CommitResult {
        const start = performance.now();
        const workingCopy = this.store.clone();

        const { appliedPatch, inversePatch } = applyPatch(workingCopy, patch);
        const version = workingCopy.bumpVersion();
        this.store.replaceFrom(workingCopy);

        const touchedKeys = extractTouchedKeysFromPatch(appliedPatch);
        const result: CommitResult = {
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

    subscribe(listener: CommitListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    getStoreVersion(): number {
        return this.store.version;
    }
}

export function createCommitController(
    store: GraphStore,
    options: CommitControllerOptions = {},
): CommitController {
    return new CommitController(store, options);
}

export function emptyCommitPatch(): Patch {
    return createPatch();
}
