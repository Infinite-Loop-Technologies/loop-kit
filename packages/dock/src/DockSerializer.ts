/**
 * Dock serialization boundary.
 */

import type { DockState } from "./DockState.js";

export interface DockSerializer {
  readonly serialize: (state: DockState) => string;
  readonly deserialize: (payload: string) => DockState;
}

export const createJsonDockSerializer = (): DockSerializer => ({
  serialize: (state) => JSON.stringify(state),
  deserialize: (payload) => JSON.parse(payload) as DockState,
});
