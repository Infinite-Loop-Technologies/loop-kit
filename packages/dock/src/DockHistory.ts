/**
 * Undo/redo history for committed dock state.
 */

import type { DockCommand } from "./DockCommands.js";
import type { DockState } from "./DockState.js";

export interface DockHistoryState {
  readonly past: ReadonlyArray<DockState>;
  readonly future: ReadonlyArray<DockState>;
  readonly commands: ReadonlyArray<DockCommand>;
}

export const createDockHistoryState = (): DockHistoryState => ({
  past: [],
  future: [],
  commands: [],
});
