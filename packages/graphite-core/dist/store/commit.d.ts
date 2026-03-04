import type { ScopeId } from '../types/ids.js';
import type { HistoryManager } from '../history/history.js';
import type { GraphiteMetrics } from '../instrument/metrics.js';
import { GraphStore } from './graphStore.js';
import { type Patch } from './patch.js';
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
export declare class EventLog {
    private entries;
    private nextId;
    append(commit: CommitResult): EventLogEntry;
    list(): readonly EventLogEntry[];
    clear(): void;
}
export type CommitControllerOptions = {
    history?: HistoryManager;
    eventLog?: EventLog;
    metrics?: GraphiteMetrics;
    onTouchedKeys?: (touchedKeys: Set<string>, result: CommitResult) => void;
};
export declare class CommitController {
    private readonly store;
    private readonly options;
    private listeners;
    constructor(store: GraphStore, options?: CommitControllerOptions);
    commit(patch: Patch, meta?: CommitMeta): CommitResult;
    subscribe(listener: CommitListener): () => void;
    getStoreVersion(): number;
}
export declare function createCommitController(store: GraphStore, options?: CommitControllerOptions): CommitController;
export declare function emptyCommitPatch(): Patch;
//# sourceMappingURL=commit.d.ts.map