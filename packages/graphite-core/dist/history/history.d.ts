import type { CommitMeta, CommitResult } from '../store/commit.js';
import type { Patch } from '../store/patch.js';
export type HistoryEntry = {
    forward: Patch;
    inverse: Patch;
    meta: CommitMeta;
};
export type HistoryCommit = (patch: Patch, meta?: CommitMeta) => CommitResult;
export declare class HistoryManager {
    private undoStack;
    private redoStack;
    record(entry: HistoryEntry): void;
    canUndo(): boolean;
    canRedo(): boolean;
    undo(commit: HistoryCommit): CommitResult | undefined;
    redo(commit: HistoryCommit): CommitResult | undefined;
    clear(): void;
    getDepth(): {
        undo: number;
        redo: number;
    };
}
//# sourceMappingURL=history.d.ts.map