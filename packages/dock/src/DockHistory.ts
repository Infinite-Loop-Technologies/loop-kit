/**
 * Lightweight domain history records.
 *
 * History is persisted as command/event descriptions rather than closures.
 * This first pass records enough for debugging and future undo/redo work; it
 * does not expose a full reversible command engine.
 *
 * @module
 */

export interface DockHistoryEntry {
  readonly id: string
  readonly label: string
  readonly timestamp: number
}

export interface DockHistoryState {
  readonly past: ReadonlyArray<DockHistoryEntry>
  readonly future: ReadonlyArray<DockHistoryEntry>
}

export const createDockHistoryState = (): DockHistoryState => ({
  past: [],
  future: [],
})

export const appendDockHistory = (
  history: DockHistoryState,
  label: string,
  timestamp = Date.now()
): DockHistoryState => ({
  past: [...history.past, { id: `${timestamp}:${history.past.length}`, label, timestamp }],
  future: [],
})
