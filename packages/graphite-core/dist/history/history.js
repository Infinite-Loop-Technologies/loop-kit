export class HistoryManager {
    undoStack = [];
    redoStack = [];
    record(entry) {
        this.undoStack.push(entry);
        this.redoStack = [];
    }
    canUndo() {
        return this.undoStack.length > 0;
    }
    canRedo() {
        return this.redoStack.length > 0;
    }
    undo(commit) {
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
    redo(commit) {
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
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
    getDepth() {
        return {
            undo: this.undoStack.length,
            redo: this.redoStack.length,
        };
    }
}
//# sourceMappingURL=history.js.map