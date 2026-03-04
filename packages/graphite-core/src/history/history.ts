import type { CommitMeta, CommitResult } from '../store/commit.js';
import type { Patch } from '../store/patch.js';

export type HistoryEntry = {
    forward: Patch;
    inverse: Patch;
    meta: CommitMeta;
};

export type HistoryCommit = (patch: Patch, meta?: CommitMeta) => CommitResult;

export class HistoryManager {
    private undoStack: HistoryEntry[] = [];
    private redoStack: HistoryEntry[] = [];

    record(entry: HistoryEntry): void {
        this.undoStack.push(entry);
        this.redoStack = [];
    }

    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    undo(commit: HistoryCommit): CommitResult | undefined {
        const entry = this.undoStack.pop();
        if (!entry) {
            return undefined;
        }

        const result = commit(entry.inverse, {
            ...entry.meta,
            origin: 'history',
            history: false,
        });

        this.redoStack.push(entry);
        return result;
    }

    redo(commit: HistoryCommit): CommitResult | undefined {
        const entry = this.redoStack.pop();
        if (!entry) {
            return undefined;
        }

        const result = commit(entry.forward, {
            ...entry.meta,
            origin: 'history',
            history: false,
        });

        this.undoStack.push(entry);
        return result;
    }

    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

    getDepth(): { undo: number; redo: number } {
        return {
            undo: this.undoStack.length,
            redo: this.redoStack.length,
        };
    }
}
